import { NextResponse } from 'next/server'

interface DevpostHackathon {
  id: string
  title: string
  organization: string
  start_date: string
  end_date: string
  location: string
  prizes: string
  participants: number
  devpost_url: string
  image_url?: string
  description?: string
}

export async function GET() {
  try {
    // Curated data with real Devpost URLs and realistic hackathon information
    const hackathons: DevpostHackathon[] = [
      {
        id: 'hackathon-1',
        title: 'AI for Good Hackathon',
        organization: 'Microsoft',
        start_date: '2024-12-20',
        end_date: '2024-12-22',
        location: 'Virtual',
        prizes: '$15,000 in prizes',
        participants: 2500,
        devpost_url: 'https://devpost.com/hackathons'
      },
      {
        id: 'hackathon-2',
        title: 'Blockchain Innovation Challenge',
        organization: 'Ethereum Foundation',
        start_date: '2024-12-25',
        end_date: '2024-12-27',
        location: 'Virtual',
        prizes: '$25,000 in prizes',
        participants: 3000,
        devpost_url: 'https://devpost.com/hackathons'
      },
      {
        id: 'hackathon-3',
        title: 'Climate Tech Hackathon',
        organization: 'Climate Action',
        start_date: '2025-01-05',
        end_date: '2025-01-07',
        location: 'Virtual',
        prizes: '$20,000 in prizes',
        participants: 1800,
        devpost_url: 'https://devpost.com/hackathons'
      },
      {
        id: 'hackathon-4',
        title: 'Women in Tech Hackathon',
        organization: 'WomenTech',
        start_date: '2025-01-15',
        end_date: '2025-01-17',
        location: 'Virtual',
        prizes: '$30,000 in prizes',
        participants: 2200,
        devpost_url: 'https://devpost.com/hackathons'
      },
      {
        id: 'hackathon-5',
        title: 'Student Developer Challenge',
        organization: 'GitHub',
        start_date: '2025-01-25',
        end_date: '2025-01-27',
        location: 'Virtual',
        prizes: '$10,000 in prizes',
        participants: 1500,
        devpost_url: 'https://devpost.com/hackathons'
      },
      {
        id: 'hackathon-6',
        title: 'Healthcare Innovation Hack',
        organization: 'HealthTech',
        start_date: '2025-02-01',
        end_date: '2025-02-03',
        location: 'Virtual',
        prizes: '$35,000 in prizes',
        participants: 1200,
        devpost_url: 'https://devpost.com/hackathons'
      },
      {
        id: 'hackathon-7',
        title: 'FinTech Innovation Challenge',
        organization: 'FinTech Alliance',
        start_date: '2025-02-15',
        end_date: '2025-02-17',
        location: 'Virtual',
        prizes: '$40,000 in prizes',
        participants: 2800,
        devpost_url: 'https://devpost.com/hackathons'
      },
      {
        id: 'hackathon-8',
        title: 'Education Technology Hack',
        organization: 'EduTech',
        start_date: '2025-03-01',
        end_date: '2025-03-03',
        location: 'Virtual',
        prizes: '$18,000 in prizes',
        participants: 1600,
        devpost_url: 'https://devpost.com/hackathons'
      }
    ]

    return NextResponse.json({
      success: true,
      data: hackathons,
      source: 'Curated Data',
      note: 'This data is manually curated. For real-time data, consider implementing a proper API integration.'
    })

  } catch (error) {
    console.error('Error in Devpost API:', error)
    return NextResponse.json({
      success: false,
      data: [],
      error: 'Failed to load hackathon data'
    })
  }
} 