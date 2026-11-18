import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // For now, return static data since we don't have a community_platforms table yet
    // In the future, this could fetch from a database table
    const platforms = [
      {
        name: "Discord Server",
        description: "Our primary communication platform for real-time chat, announcements, and collaboration.",
        link: "https://discord.gg/pwcdweEwjM",
        buttonText: "Join Discord",
        members: 215,
        featured: true,
      },
      {
        name: "GitHub Organization",
        description: "Collaborate on code, contribute to projects, and showcase your work.",
        link: "https://github.com/techclub",
        buttonText: "View GitHub",
        members: 178,
        featured: true,
      },
      {
        name: "Minecraft Server",
        description: "Relax and have fun with fellow members on our custom Minecraft server.",
        link: "https://minecraft.techclub.university.edu",
        buttonText: "Server Details",
        members: 87,
        featured: true,
      },
      {
        name: "LinkedIn Group",
        description: "Connect professionally with current members and alumni for networking opportunities.",
        link: "https://linkedin.com/groups/techclub",
        buttonText: "Join Group",
        members: 156,
        featured: false,
      },
    ]

    return NextResponse.json(platforms)
  } catch (error) {
    console.error('Error fetching community platforms:', error)
    return NextResponse.json({ error: 'Failed to fetch community platforms' }, { status: 500 })
  }
}
