import { NextResponse } from 'next/server'

const LEETCODE_API_URL = 'https://leetcode.com/graphql/'

const PROBLEM_LIST_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        acRate
        difficulty
        questionId
        isPaidOnly
        title
        titleSlug
        topicTags {
          name
          slug
        }
      }
    }
  }
`

const PROBLEM_DETAIL_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      title
      titleSlug
      difficulty
      content
      codeSnippets {
        lang
        langSlug
        code
      }
      topicTags {
        name
        slug
      }
      likes
      dislikes
      acRate
      exampleTestcases
      sampleTestCase
      hints
      metaData
    }
  }
`

// Fetch a CSRF token from LeetCode (needed for detail queries)
async function getCsrfToken(): Promise<string> {
  const res = await fetch('https://leetcode.com/graphql/', {
    method: 'OPTIONS',
  })
  const setCookie = res.headers.get('set-cookie') || ''
  const match = setCookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : ''
}

async function fetchLeetCode(query: string, variables?: any, needsCsrf = false) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Referer': 'https://leetcode.com',
  }

  if (needsCsrf) {
    const csrf = await getCsrfToken()
    if (csrf) {
      headers['x-csrftoken'] = csrf
      headers['Cookie'] = `csrftoken=${csrf}`
    }
  }

  const response = await fetch(LEETCODE_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`LeetCode API: ${response.status}`)
  }

  const data = await response.json()
  if (data.errors) {
    throw new Error(data.errors[0]?.message || 'GraphQL error')
  }
  return data.data
}

// GET /api/leetcode/problems?limit=50&skip=0&difficulty=EASY&slug=two-sum
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  // If slug is provided, fetch single problem details
  if (slug) {
    try {
      const data = await fetchLeetCode(PROBLEM_DETAIL_QUERY, { titleSlug: slug }, true)
      const q = data.question

      if (!q) {
        return NextResponse.json({ success: false, error: 'Problem not found' })
      }

      // Keep raw HTML for proper rendering on the frontend
      const rawHtml = q.content || ''

      // Create a plain text version for regex extraction
      const plainText = rawHtml
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()

      // Extract expected outputs from plain text
      const outputRegex = /Output:\s*([^\s]+)/g
      const expectedOutputs: string[] = []
      let outMatch
      while ((outMatch = outputRegex.exec(plainText)) !== null) {
        expectedOutputs.push(outMatch[1].trim())
      }

      // Parse example test cases
      const exampleTestcases = q.exampleTestcases || ''
      const exampleInputs = exampleTestcases.split('\n').filter(Boolean)

      // Parse metaData for function signature
      let metaData = null
      try {
        metaData = q.metaData ? JSON.parse(q.metaData) : null
      } catch {}

      // Build starter code map
      const starterCode: Record<string, string> = {}
      ;(q.codeSnippets || []).forEach((s: any) => {
        if (['python3', 'python', 'javascript', 'java'].includes(s.langSlug)) {
          const key = s.langSlug === 'python3' ? 'python' : s.langSlug
          starterCode[key] = s.code
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          id: q.titleSlug,
          frontendId: q.questionId,
          title: q.title,
          titleSlug: q.titleSlug,
          difficulty: q.difficulty as 'Easy' | 'Medium' | 'Hard',
          category: q.topicTags?.[0]?.name || 'General',
          description: rawHtml,
          starterCode,
          tags: (q.topicTags || []).map((t: any) => t.name),
          acceptanceRate: Math.round((q.acRate || 0) * 10) / 10,
          likes: q.likes || 0,
          dislikes: q.dislikes || 0,
          exampleTestcases: exampleInputs,
          expectedOutputs,
          metaData,
          source: 'leetcode',
        },
      })
    } catch (error) {
      console.error('Error fetching problem details:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch problem details' })
    }
  }

  // Otherwise, fetch problem list
  try {
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const skip = parseInt(searchParams.get('skip') || '0')
    const difficulty = searchParams.get('difficulty') // EASY, MEDIUM, HARD

    const filters: any = {}
    if (difficulty) {
      filters.difficulty = difficulty
    }

    const data = await fetchLeetCode(PROBLEM_LIST_QUERY, {
      categorySlug: '',
      limit,
      skip,
      filters,
    })

    const list = data.problemsetQuestionList
    const problems = (list.questions || [])
      .filter((q: any) => !q.isPaidOnly)
      .map((q: any) => ({
        id: q.titleSlug,
        frontendId: q.questionId,
        title: q.title,
        titleSlug: q.titleSlug,
        difficulty: q.difficulty,
        category: q.topicTags?.[0]?.name || 'General',
        tags: (q.topicTags || []).map((t: any) => t.name),
        acceptanceRate: Math.round((q.acRate || 0) * 10) / 10,
        source: 'leetcode',
      }))

    return NextResponse.json({
      success: true,
      data: {
        problems,
        total: list.total,
        limit,
        skip,
      },
    })
  } catch (error) {
    console.error('Error fetching problem list:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch problems from LeetCode',
      data: { problems: [], total: 0, limit: 50, skip: 0 },
    })
  }
}
