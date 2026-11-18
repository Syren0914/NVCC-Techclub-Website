import { NextResponse } from 'next/server'

interface LeetCodeProblem {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  description: string
  examples: string[]
  constraints: string[]
  starterCode: {
    [key: string]: string
  }
  solution?: string
  tags: string[]
  acceptanceRate: number
  likes: number
  dislikes: number
  questionId: string
  content: string
  codeSnippets: any[]
}

interface UserProgress {
  userId: string
  problemId: string
  status: 'not_started' | 'attempted' | 'solved'
  submissionDate?: string
  runtime?: number
  memory?: number
  language?: string
  code?: string
}

// LeetCode GraphQL API endpoint
const LEETCODE_API_URL = 'https://leetcode.com/graphql'

// GraphQL query to fetch daily problem
const DAILY_PROBLEM_QUERY = `
  query questionOfToday {
    activeDailyCodingChallengeQuestion {
      date
      link
      question {
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
        stats
        likes
        dislikes
        acRate
      }
    }
  }
`

// GraphQL query to fetch problem details
const PROBLEM_DETAILS_QUERY = `
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
      stats
      likes
      dislikes
      acRate
      exampleTestcases
      sampleTestCase
      hints
      solution {
        id
        content
        contentTypeId
      }
    }
  }
`

async function fetchFromLeetCodeAPI(query: string, variables?: any) {
  try {
    const response = await fetch(LEETCODE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({
        query,
        variables
      })
    })

    if (!response.ok) {
      throw new Error(`LeetCode API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      console.error('LeetCode GraphQL errors:', data.errors)
      throw new Error('GraphQL query failed')
    }

    return data.data
  } catch (error) {
    console.error('Error fetching from LeetCode API:', error)
    throw error
  }
}

function parseLeetCodeContent(content: string) {
  // Remove HTML tags and clean up content
  const cleanContent = content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()

  return cleanContent
}

function extractExamples(content: string) {
  const examples: string[] = []
  
  // Extract examples from content
  const exampleMatches = content.match(/Example \d+:/g)
  if (exampleMatches) {
    exampleMatches.forEach((match, index) => {
      const startIndex = content.indexOf(match)
      const nextMatch = exampleMatches[index + 1]
      const endIndex = nextMatch ? content.indexOf(nextMatch) : content.length
      const example = content.substring(startIndex, endIndex).trim()
      examples.push(example)
    })
  }

  return examples.length > 0 ? examples : [
    'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].'
  ]
}

function extractConstraints(content: string) {
  const constraints: string[] = []
  
  // Extract constraints from content
  const constraintMatches = content.match(/Constraints:/)
  if (constraintMatches) {
    const startIndex = content.indexOf('Constraints:')
    const constraintSection = content.substring(startIndex)
    const lines = constraintSection.split('\n')
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && trimmed !== 'Constraints:' && !trimmed.startsWith('Example')) {
        constraints.push(trimmed)
      }
    })
  }

  return constraints.length > 0 ? constraints : [
    '2 <= nums.length <= 104',
    '-109 <= nums[i] <= 109',
    '-109 <= target <= 109',
    'Only one valid answer exists.'
  ]
}

function generateStarterCode(codeSnippets: any[]) {
  const starterCode: { [key: string]: string } = {}
  
  codeSnippets.forEach(snippet => {
    const lang = snippet.langSlug
    starterCode[lang] = snippet.code
  })

  // Add fallback starter code for common languages
  if (!starterCode.python) {
    starterCode.python = `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass`
  }
  
  if (!starterCode.javascript) {
    starterCode.javascript = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};`
  }
  
  if (!starterCode.java) {
    starterCode.java = `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`
  }

  return starterCode
}

export async function GET() {
  try {
    console.log('🔄 Fetching daily problem from LeetCode API...')
    
    // Fetch daily problem from LeetCode
    const dailyData = await fetchFromLeetCodeAPI(DAILY_PROBLEM_QUERY)
    
    if (!dailyData?.activeDailyCodingChallengeQuestion?.question) {
      throw new Error('No daily problem found')
    }

    const question = dailyData.activeDailyCodingChallengeQuestion.question
    const date = dailyData.activeDailyCodingChallengeQuestion.date
    
    console.log('✅ Daily problem fetched:', question.title)

    // Fetch additional problem details if needed
    let detailedQuestion = question
    if (!question.content || question.content.length < 100) {
      console.log('🔄 Fetching detailed problem information...')
      const detailsData = await fetchFromLeetCodeAPI(PROBLEM_DETAILS_QUERY, {
        titleSlug: question.titleSlug
      })
      detailedQuestion = detailsData.question
    }

    // Parse and format the problem data
    const content = parseLeetCodeContent(detailedQuestion.content)
    const examples = extractExamples(content)
    const constraints = extractConstraints(content)
    const starterCode = generateStarterCode(detailedQuestion.codeSnippets || [])
    
    // Parse acceptance rate from stats
    let acceptanceRate = 49.2 // Default fallback
    try {
      if (detailedQuestion.stats) {
        const stats = JSON.parse(detailedQuestion.stats)
        acceptanceRate = parseFloat(stats.acRate) || 49.2
      }
    } catch (error) {
      console.warn('Could not parse acceptance rate:', error)
    }

    const problem: LeetCodeProblem = {
      id: `daily-${date}`,
      title: detailedQuestion.title,
      difficulty: detailedQuestion.difficulty,
      category: detailedQuestion.topicTags?.[0]?.name || 'Array',
      description: content,
      examples: examples,
      constraints: constraints,
      starterCode: starterCode,
      tags: detailedQuestion.topicTags?.map((tag: any) => tag.name) || ['Array'],
      acceptanceRate: acceptanceRate,
      likes: detailedQuestion.likes || 0,
      dislikes: detailedQuestion.dislikes || 0,
      questionId: detailedQuestion.questionId,
      content: detailedQuestion.content,
      codeSnippets: detailedQuestion.codeSnippets || []
    }

    console.log('✅ Problem processed successfully:', {
      title: problem.title,
      difficulty: problem.difficulty,
      languages: Object.keys(problem.starterCode),
      examples: problem.examples.length,
      constraints: problem.constraints.length
    })

    return NextResponse.json({
      success: true,
      data: {
        problem: problem,
        date: date,
        source: 'LeetCode API',
        note: 'Real daily problem from LeetCode'
      }
    })

  } catch (error) {
    console.error('❌ Error fetching daily problem:', error)
    
    // Fallback to sample data if API fails
    const fallbackProblem: LeetCodeProblem = {
      id: "daily-2024-12-14",
      title: "Two Sum",
      difficulty: "Easy",
      category: "Array",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
      examples: [
        `Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
        `Input: nums = [3,2,4], target = 6
Output: [1,2]`,
        `Input: nums = [3,3], target = 6
Output: [0,1]`
      ],
      constraints: [
        "2 <= nums.length <= 104",
        "-109 <= nums[i] <= 109",
        "-109 <= target <= 109",
        "Only one valid answer exists."
      ],
      starterCode: {
        "python": `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here
        pass`,
        "javascript": `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};`,
        "java": `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`
      },
      tags: ["Array", "Hash Table"],
      acceptanceRate: 49.2,
      likes: 45000,
      dislikes: 1500,
      questionId: "1",
      content: "",
      codeSnippets: []
    }

    return NextResponse.json({
      success: false,
      data: {
        problem: fallbackProblem,
        date: new Date().toISOString().split('T')[0],
        source: 'Fallback Data',
        note: 'Using fallback data due to API error. Check console for details.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
} 