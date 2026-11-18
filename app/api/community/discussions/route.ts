import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // For now, return static data since we don't have a discussion_categories table yet
    // In the future, this could fetch from a database table
    const discussions = [
      {
        name: "Web Development",
        description: "Discuss frontend, backend, and full-stack web development topics.",
        recentTopics: [
          {
            title: "React vs. Vue in 2025",
            author: "Sam Rodriguez",
            replies: 24,
            lastActive: "2 hours ago",
          },
          {
            title: "Best practices for API authentication",
            author: "Morgan Chen",
            replies: 18,
            lastActive: "1 day ago",
          },
          {
            title: "CSS Grid vs. Flexbox - when to use each",
            author: "Taylor Smith",
            replies: 32,
            lastActive: "3 days ago",
          },
        ],
      },
      {
        name: "Cybersecurity",
        description: "Share security news, tools, and techniques.",
        recentTopics: [
          {
            title: "Analyzing the latest ransomware trends",
            author: "Jamie Lee",
            replies: 15,
            lastActive: "5 hours ago",
          },
          {
            title: "Setting up a home security lab",
            author: "Alex Johnson",
            replies: 29,
            lastActive: "2 days ago",
          },
          {
            title: "Web application penetration testing resources",
            author: "Casey Wong",
            replies: 21,
            lastActive: "4 days ago",
          },
        ],
      },
      {
        name: "Robotics",
        description: "Discuss hardware, sensors, and programming for robotics projects.",
        recentTopics: [
          {
            title: "Arduino vs. Raspberry Pi for robotics",
            author: "Jordan Patel",
            replies: 27,
            lastActive: "1 day ago",
          },
          {
            title: "Computer vision techniques for object detection",
            author: "Riley Kim",
            replies: 14,
            lastActive: "3 days ago",
          },
          {
            title: "Motor control best practices",
            author: "Alex Johnson",
            replies: 19,
            lastActive: "5 days ago",
          },
        ],
      },
    ]

    return NextResponse.json(discussions)
  } catch (error) {
    console.error('Error fetching discussion categories:', error)
    return NextResponse.json({ error: 'Failed to fetch discussion categories' }, { status: 500 })
  }
}
