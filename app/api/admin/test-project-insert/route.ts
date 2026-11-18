import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'No authorization header'
      })
    }

    // Verify the JWT token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Invalid token',
        details: authError
      })
    }

    // Check if user is admin (simple email-based check)
    if (user.email !== 'test@email.vccs.edu') {
      return NextResponse.json({
        error: 'Admin access required'
      })
    }

    // Test project insertion with detailed error logging
    const testProject = {
      title: 'Test Project',
      description: 'Test Description',
      technologies: ['Test'],
      github_url: null,
      live_url: null,
      status: 'active',
      team_members: [],
      created_by: user.id
    }

    console.log('Attempting to insert test project:', testProject)

    const { data: project, error } = await supabase
      .from('projects')
      .insert(testProject)
      .select()
      .single()

    if (error) {
      console.error('Project insertion error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create project',
        details: error,
        testProject
      })
    }

    return NextResponse.json({
      success: true,
      project,
      testProject
    })

  } catch (error) {
    console.error('Error in test project insert API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
