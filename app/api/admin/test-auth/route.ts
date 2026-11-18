import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the JWT token with Supabase
    const token = authHeader.replace('Bearer ', '')
    console.log('Token length:', token.length)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    console.log('Auth result:', { user: !!user, error: authError })
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', details: authError },
        { status: 401 }
      )
    }

    // Check if user is admin (simple email-based check)
    if (user.email !== 'test@email.vccs.edu') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Test creating a project
    const body = await request.json()
    console.log('Request body:', body)

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title: body.title || 'Test Project',
        description: body.description || 'Test Description',
        technologies: body.technologies || [],
        github_url: body.github_url || null,
        live_url: body.live_url || null,
        status: body.status || 'active',
        team_members: body.team_members || [],
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json(
        { error: 'Failed to create project', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error('Error in test auth API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
