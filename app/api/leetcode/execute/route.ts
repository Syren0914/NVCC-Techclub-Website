import { NextResponse } from 'next/server'
import { PROBLEMS } from '@/lib/leetcode-problems'

const PISTON_API = 'https://emkc.org/api/v2/piston/execute'

const LANGUAGE_CONFIG: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java: { language: 'java', version: '15.0.2' },
}

interface PistonResponse {
  run: {
    stdout: string
    stderr: string
    code: number
    signal: string | null
    output: string
  }
  compile?: {
    stdout: string
    stderr: string
    code: number
  }
}

interface TestCaseResult {
  input: string
  expected: string
  actual: string
  passed: boolean
  runtime?: number
  error?: string
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function runWithPiston(
  code: string,
  language: string,
  stdin: string
): Promise<{ stdout: string; stderr: string; error?: string }> {
  const config = LANGUAGE_CONFIG[language]
  if (!config) {
    return { stdout: '', stderr: '', error: `Unsupported language: ${language}` }
  }

  const body = {
    language: config.language,
    version: config.version,
    files: [{ content: code }],
    stdin,
    run_timeout: 10000,
  }

  const MAX_RETRIES = 3
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const response = await fetch(PISTON_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.status === 429) {
      if (attempt < MAX_RETRIES) {
        await sleep(1500 * (attempt + 1))
        continue
      }
      return { stdout: '', stderr: '', error: 'Rate limited — please wait a moment and try again' }
    }

    if (!response.ok) {
      return { stdout: '', stderr: '', error: `Piston API error: ${response.status}` }
    }

    const data: PistonResponse = await response.json()

    if (data.compile && data.compile.code !== 0) {
      return { stdout: '', stderr: data.compile.stderr || data.compile.stdout, error: 'Compilation error' }
    }

    if (data.run.code !== 0 && data.run.stderr) {
      return { stdout: data.run.stdout, stderr: data.run.stderr, error: 'Runtime error' }
    }

    return { stdout: data.run.stdout, stderr: data.run.stderr }
  }

  return { stdout: '', stderr: '', error: 'Rate limited — please wait a moment and try again' }
}

// Build a driver wrapper for LeetCode-style class solutions.
// This wraps the user's Solution class with stdin parsing and stdout printing
// so Piston can run it with example inputs.
function buildPythonDriver(userCode: string, metaData: any): string {
  if (!metaData?.name) return userCode // Can't generate driver without method name

  const methodName = metaData.name
  const params = metaData.params || []

  // Build stdin parsing lines
  const parseLines = params.map((p: any, i: number) => {
    const varName = p.name
    return `    ${varName} = json.loads(input())`
  }).join('\n')

  const argList = params.map((p: any) => p.name).join(', ')

  return `import json, sys
${userCode}

if __name__ == "__main__":
    sol = Solution()
${parseLines}
    result = sol.${methodName}(${argList})
    print(json.dumps(result))
`
}

function buildJavaScriptDriver(userCode: string, metaData: any): string {
  if (!metaData?.name) return userCode

  const methodName = metaData.name
  const params = metaData.params || []

  const parseLines = params.map((p: any, i: number) => {
    return `  const ${p.name} = JSON.parse(lines[${i}]);`
  }).join('\n')

  const argList = params.map((p: any) => p.name).join(', ')

  return `${userCode}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', l => lines.push(l.trim()));
rl.on('close', () => {
${parseLines}
  // Try class-based or function-based
  let result;
  if (typeof ${methodName} === 'function') {
    result = ${methodName}(${argList});
  }
  console.log(JSON.stringify(result));
});
`
}

// Normalize output for comparison - handles different JSON formats
function normalizeOutput(output: string): string {
  const trimmed = output.trim()
  try {
    // Try parsing as JSON and re-serializing for consistent formatting
    const parsed = JSON.parse(trimmed)
    return JSON.stringify(parsed)
  } catch {
    return trimmed
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      code,
      language,
      problemId,
      // For LeetCode API problems
      exampleTestcases,
      expectedOutputs,
      metaData,
      source,
    } = body

    if (!code || !language) {
      return NextResponse.json({ success: false, error: 'Code and language are required' })
    }

    const startTime = Date.now()
    const results: TestCaseResult[] = []

    // Check if this is a curated problem from our static bank (skip if source is leetcode)
    const curatedProblem = source !== 'leetcode' ? PROBLEMS.find((p) => p.id === problemId) : null

    if (curatedProblem) {
      // ===== CURATED PROBLEM: use our stdin/stdout test cases =====
      for (let idx = 0; idx < curatedProblem.testCases.length; idx++) {
        if (idx > 0) await sleep(500)
        const tc = curatedProblem.testCases[idx]
        const tcStart = Date.now()
        const { stdout, stderr, error } = await runWithPiston(code, language, tc.stdin)
        const tcRuntime = Date.now() - tcStart

        const actual = stdout.trim()
        const expected = tc.expectedStdout.trim()
        const passed = actual === expected

        results.push({
          input: tc.stdin.replace(/\n/g, ', '),
          expected,
          actual: error ? `[${error}] ${stderr.split('\n')[0]}` : actual,
          passed: !error && passed,
          runtime: tcRuntime,
          error: error ? stderr.split('\n').slice(0, 3).join('\n') : undefined,
        })
      }
    } else if (
      exampleTestcases &&
      expectedOutputs &&
      exampleTestcases.length > 0 &&
      expectedOutputs.length > 0
    ) {
      // ===== LEETCODE API PROBLEM: wrap user code with driver =====
      let driverCode = code

      // Only wrap if the code looks like a class-based solution
      const isClassBased = code.includes('class Solution')

      if (isClassBased && metaData) {
        if (language === 'python') {
          driverCode = buildPythonDriver(code, metaData)
        } else if (language === 'javascript') {
          driverCode = buildJavaScriptDriver(code, metaData)
        }
        // Java wrapping is complex - skip for now, run as-is
      }

      // Build test cases from the example inputs/outputs
      // exampleTestcases is the raw string from LeetCode, split by param count
      const paramCount = metaData?.params?.length || 1
      const allInputLines = (exampleTestcases as string[])

      // Group input lines by param count to form individual test cases
      const testInputs: string[] = []
      for (let i = 0; i < allInputLines.length; i += paramCount) {
        const inputGroup = allInputLines.slice(i, i + paramCount).join('\n')
        testInputs.push(inputGroup)
      }

      const outputs = expectedOutputs as string[]
      const testCount = Math.min(testInputs.length, outputs.length)

      for (let i = 0; i < testCount; i++) {
        if (i > 0) await sleep(500)
        const tcStart = Date.now()
        const { stdout, stderr, error } = await runWithPiston(driverCode, language, testInputs[i])
        const tcRuntime = Date.now() - tcStart

        const actual = normalizeOutput(stdout)
        const expected = normalizeOutput(outputs[i])
        const passed = actual === expected

        results.push({
          input: testInputs[i].replace(/\n/g, ', '),
          expected: outputs[i].trim(),
          actual: error ? `[${error}] ${stderr.split('\n')[0]}` : stdout.trim(),
          passed: !error && passed,
          runtime: tcRuntime,
          error: error ? stderr.split('\n').slice(0, 3).join('\n') : undefined,
        })
      }
    } else {
      // ===== UNKNOWN PROBLEM: just run the code and show output =====
      const tcStart = Date.now()
      const { stdout, stderr, error } = await runWithPiston(code, language, '')
      const tcRuntime = Date.now() - tcStart

      results.push({
        input: '(no input)',
        expected: '(free run - no expected output)',
        actual: error ? `[${error}] ${stderr.split('\n')[0]}` : stdout.trim() || '(no output)',
        passed: !error && stdout.trim().length > 0,
        runtime: tcRuntime,
        error: error ? stderr.split('\n').slice(0, 3).join('\n') : undefined,
      })
    }

    const totalRuntime = Date.now() - startTime
    const allPassed = results.every((r) => r.passed)

    return NextResponse.json({
      success: true,
      data: {
        success: allPassed,
        output: allPassed
          ? `All ${results.length} test cases passed!`
          : `${results.filter((r) => r.passed).length}/${results.length} test cases passed`,
        runtime: totalRuntime,
        testCases: results,
      },
    })
  } catch (error) {
    console.error('Code execution error:', error)
    return NextResponse.json({
      success: false,
      error: 'Code execution failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
