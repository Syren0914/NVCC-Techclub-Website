import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Email notification function
async function sendApprovalEmail(userEmail: string, userName: string, projectTitle: string) {
  try {
    // You can replace this with your preferred email service (SendGrid, Resend, etc.)
    const emailData = {
      to: userEmail,
      subject: `🎉 Congratulations! You've been approved for ${projectTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">🎉 Congratulations!</h2>
          <p>Dear ${userName},</p>
          <p>Great news! Your application to join <strong>${projectTitle}</strong> has been approved!</p>
          <p>You are now officially a member of the project team. Here's what happens next:</p>
          <ul>
            <li>You'll receive project updates and communications</li>
            <li>You can start contributing to the project</li>
            <li>You'll be added to project meetings and discussions</li>
          </ul>
          <p>Welcome to the team! We're excited to have you on board.</p>
          <p>Best regards,<br>TechClub Admin Team</p>
        </div>
      `
    }

    // For now, we'll log the email (you can implement actual email sending here)
    console.log('📧 Approval Email would be sent:', {
      to: userEmail,
      subject: emailData.subject,
      project: projectTitle
    })

    // TODO: Implement actual email sending
    // Example with a service like Resend:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(emailData),
    // })

    return true
  } catch (error) {
    console.error('Error sending approval email:', error)
    return false
  }
}

export async function GET(request: NextRequest) {
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

    // Fetch all project applications with project details
    const { data: applications, error } = await supabase
      .from('project_applications')
      .select(`
        *,
        projects (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching project applications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: applications || []
    })

  } catch (error) {
    console.error('Error in project applications admin API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { application_id, status, admin_notes } = body

    if (!application_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update the application status
    const { data: updatedApplication, error } = await supabase
      .from('project_applications')
      .update({
        status,
        admin_notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', application_id)
      .select(`
        *,
        projects (
          title
        )
      `)
      .single()

    if (error) {
      console.error('Error updating project application:', error)
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      )
    }

    // If approved, add user to project team members
    if (status === 'approved') {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('team_members')
        .eq('id', updatedApplication.project_id)
        .single()

      if (!projectError && projectData) {
        const currentTeamMembers = projectData.team_members || []
        const updatedTeamMembers = [...currentTeamMembers, updatedApplication.user_name]

        await supabase
          .from('projects')
          .update({
            team_members: updatedTeamMembers,
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedApplication.project_id)
      }

      // Send email notification to user
      await sendApprovalEmail(
        updatedApplication.user_email,
        updatedApplication.user_name,
        updatedApplication.projects.title
      )
    }

    return NextResponse.json({
      success: true,
      message: `Application ${status} successfully`,
      data: updatedApplication
    })

  } catch (error) {
    console.error('Error in project applications admin API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

