import { NextResponse } from 'next/server'

interface LeetCodeUser {
  id: string
  username: string
  name: string
  rank: number
  problems_solved: number
  rating: number
  streak: number
  avatar_url?: string
}

export async function GET() {
  try {
    // Option 1: Try to fetch from LeetCode's GraphQL API
    const leetcodeApiUrl = 'https://leetcode.com/graphql'
    
    const query = `
      query userRankings {
        userRankings {
          username
          rating
          problemsSolved
          streak
        }
      }
    `

    const response = await fetch(leetcodeApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ query })
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.data && data.data.userRankings) {
        const rankings: LeetCodeUser[] = data.data.userRankings
          .slice(0, 10)
          .map((user: any, index: number) => ({
            id: `leetcode-${index}`,
            username: user.username,
            name: user.username, // LeetCode API doesn't provide real names
            rank: index + 1,
            problems_solved: user.problemsSolved || 0,
            rating: user.rating || 0,
            streak: user.streak || 0
          }))

        return NextResponse.json({
          success: true,
          data: rankings,
          source: 'LeetCode API'
        })
      }
    }

    // Option 2: If LeetCode API doesn't work, try web scraping
    return await scrapeLeetCodeRankings()

  } catch (error) {
    console.error('Error fetching LeetCode data:', error)
    return await scrapeLeetCodeRankings()
  }
}

async function scrapeLeetCodeRankings() {
  try {
    // This would require more sophisticated scraping
    // For now, return sample data
    return NextResponse.json({
      success: false,
      data: [
        {
          id: 'sample-1',
          username: 'alex_coder',
          name: 'Alex Johnson',
          rank: 1,
          problems_solved: 450,
          rating: 1850,
          streak: 15
        },
        {
          id: 'sample-2',
          username: 'sarah_dev',
          name: 'Sarah Chen',
          rank: 2,
          problems_solved: 380,
          rating: 1720,
          streak: 8
        },
        {
          id: 'sample-3',
          username: 'mike_algo',
          name: 'Mike Rodriguez',
          rank: 3,
          problems_solved: 320,
          rating: 1650,
          streak: 12
        },
        {
          id: 'sample-4',
          username: 'emma_leet',
          name: 'Emma Wilson',
          rank: 4,
          problems_solved: 290,
          rating: 1580,
          streak: 5
        },
        {
          id: 'sample-5',
          username: 'david_code',
          name: 'David Kim',
          rank: 5,
          problems_solved: 250,
          rating: 1520,
          streak: 20
        }
      ],
      error: 'Using sample data. LeetCode integration requires manual setup.',
      note: 'To get real data, consider using LeetCode\'s API or manual tracking.'
    })
  } catch (error) {
    console.error('Error in fallback LeetCode data:', error)
    return NextResponse.json({
      success: false,
      data: [],
      error: 'Failed to load LeetCode rankings'
    })
  }
} 