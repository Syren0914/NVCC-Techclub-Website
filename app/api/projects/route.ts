import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Fetch all projects (public access)
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    return NextResponse.json(projects || [])
  } catch (error) {
    console.error('Error in projects API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'No authorization token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, role, priority, deadline, team_members, github_url, live_url } = body

    if (!name || !description) {
      return NextResponse.json({ success: false, error: 'Name and description are required' })
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name,
        description,
        user_id: user.id,
        role: role || 'Developer',
        priority: priority || 'medium',
        deadline,
        team_members: team_members || [],
        github_url,
        live_url,
        progress: 0,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ success: false, error: 'Failed to create project' })
    }

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Error in projects POST:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' })
  }
} 