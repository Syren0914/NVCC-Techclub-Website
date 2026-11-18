import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // For now, return static data since we don't have a community_members table yet
    // In the future, this could fetch from a database table or join with existing user tables
    const members = [
      {
        name: "Alex Johnson",
        role: "Club President",
        image: "/placeholder.svg?height=100&width=100",
        contributions: 47,
        joinDate: "September 2022",
      },
      {
        name: "Sam Rodriguez",
        role: "Web Development Lead",
        image: "/placeholder.svg?height=100&width=100",
        contributions: 38,
        joinDate: "October 2022",
      },
      {
        name: "Jamie Lee",
        role: "Cybersecurity Lead",
        image: "/placeholder.svg?height=100&width=100",
        contributions: 32,
        joinDate: "January 2023",
      },
      {
        name: "Taylor Smith",
        role: "Events Coordinator",
        image: "/placeholder.svg?height=100&width=100",
        contributions: 29,
        joinDate: "September 2023",
      },
      {
        name: "Jordan Patel",
        role: "Robotics Lead",
        image: "/placeholder.svg?height=100&width=100",
        contributions: 35,
        joinDate: "September 2022",
      },
      {
        name: "Casey Wong",
        role: "Outreach Coordinator",
        image: "/placeholder.svg?height=100&width=100",
        contributions: 26,
        joinDate: "January 2023",
      },
      {
        name: "Morgan Chen",
        role: "Secretary",
        image: "/placeholder.svg?height=100&width=100",
        contributions: 24,
        joinDate: "September 2023",
      },
      {
        name: "Riley Kim",
        role: "Marketing Director",
        image: "/placeholder.svg?height=100&width=100",
        contributions: 28,
        joinDate: "January 2023",
      },
    ]

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching community members:', error)
    return NextResponse.json({ error: 'Failed to fetch community members' }, { status: 500 })
  }
}
