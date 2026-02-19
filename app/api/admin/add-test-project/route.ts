import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No authorization header'
      })
    }

    // Verify the JWT token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        details: authError
      })
    }

    // Check if user exists in our users table and has admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (userData?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      })
    }

    // Add a test project
    const { data: project, error } = await supabase
      .from('projects')
      .insert([{
        title: 'Test Project',
        description: 'This is a test project for testing project applications',
        technologies: ['React', 'Node.js', 'TypeScript'],
        github_url: 'https://github.com/test/project',
        live_url: 'https://test-project.com',
        image_url: '/placeholder.svg',
        status: 'active',
        team_members: [],
        created_by: user.id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating test project:', error)
      return NextResponse.json(
        { error: 'Failed to create test project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test project created successfully',
      data: project
    })

  } catch (error) {
    console.error('Error in add test project API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

