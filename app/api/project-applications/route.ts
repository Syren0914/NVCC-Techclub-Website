import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_id, user_email, user_name, user_major, user_year, motivation, skills } = body

    // Validate required fields
    if (!project_id || !user_email || !user_name || !motivation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user is already a member of TechClub (get all applications and find approved one)
    const { data: membershipData, error: membershipError } = await supabase
      .from('membership_applications')
      .select('*')
      .eq('email', user_email)

    if (membershipError) {
      console.error('Error checking membership:', membershipError)
      return NextResponse.json(
        { error: 'Error checking membership status' },
        { status: 500 }
      )
    }

    // Find approved membership
    const approvedMembership = membershipData?.find(m => m.status === 'approved')
    
    if (!approvedMembership) {
      return NextResponse.json(
        { error: 'You need to be a member of TechClub first to join projects. Please apply for membership first.' },
        { status: 403 }
      )
    }

    // Check if user has already applied for this project
    const { data: existingApplication, error: existingError } = await supabase
      .from('project_applications')
      .select('*')
      .eq('project_id', project_id)
      .eq('user_email', user_email)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this project' },
        { status: 400 }
      )
    }

    // Get project details for email notification
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('title')
      .eq('id', project_id)
      .single()

    if (projectError) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Insert the application
    const { data: application, error } = await supabase
      .from('project_applications')
      .insert([{
        project_id,
        user_email,
        user_name,
        user_major,
        user_year,
        motivation,
        skills: skills || []
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating project application:', error)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    // Send email notification to admin (you can implement this with your email service)
    // For now, we'll just log it
    console.log(`New project application: ${user_name} (${user_email}) wants to join project "${projectData.title}"`)

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! You will be notified when your application is reviewed.',
      data: application
    })

  } catch (error) {
    console.error('Error in project applications API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')

    let query = supabase
      .from('project_applications')
      .select(`
        *,
        projects (
          title
        )
      `)
      .order('created_at', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    const { data: applications, error } = await query

    if (error) {
      console.error('Error fetching project applications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json(applications || [])
  } catch (error) {
    console.error('Error in project applications API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

