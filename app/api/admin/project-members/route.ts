import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'Project ID is required'
      }, { status: 400 })
    }

    // Verify admin access
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authorization header required'
      }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (userData?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      }, { status: 403 })
    }

    // Fetch approved project applications (these are the project members)
    const { data: projectMembers, error } = await supabase
      .from('project_applications')
      .select(`
        id,
        project_id,
        user_email,
        user_name,
        user_major,
        user_year,
        created_at,
        projects (
          id,
          title,
          description,
          technologies
        )
      `)
      .eq('project_id', projectId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching project members:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch project members'
      }, { status: 500 })
    }

    // Transform the data to match the expected format
    const members = projectMembers?.map(member => ({
      id: member.id,
      project_id: member.project_id,
      user_email: member.user_email,
      user_name: member.user_name,
      user_major: member.user_major,
      user_year: member.user_year,
      joined_at: member.created_at,
      projects: member.projects
    })) || []

    return NextResponse.json({
      success: true,
      data: members
    })

  } catch (error) {
    console.error('Error in project members API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
