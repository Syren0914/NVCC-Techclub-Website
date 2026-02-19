import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify the JWT token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const applicationId = body?.applicationId ?? body?.id

    if (!applicationId) {
      return NextResponse.json(
        { error: 'applicationId is required' },
        { status: 400 }
      )
    }

    // If fields are not provided by the client, fetch them from DB
    let email = body?.email
    let firstName = body?.firstName
    let lastName = body?.lastName
    let status = body?.status

    if (!email || !firstName || !lastName || !status) {
      const { data: application, error: appError } = await supabase
        .from('membership_applications')
        .select('id, email, first_name, last_name, status')
        .eq('id', applicationId)
        .single()

      if (appError || !application) {
        return NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        )
      }

      email = email ?? application.email
      firstName = firstName ?? application.first_name
      lastName = lastName ?? application.last_name
      status = status ?? application.status
    }

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not configured; skipping send. Logging only.')
      console.log('Approval email (dry-run):', { applicationId, email, firstName, lastName, status })
      return NextResponse.json({
        success: true,
        message: 'Email not sent (missing RESEND_API_KEY). Logged for debugging instead.',
        details: { applicationId, email, firstName, lastName, status },
      })
    }

    const resend = new Resend(apiKey)
    const fromAddress = process.env.RESEND_FROM

    if (!fromAddress) {
      return NextResponse.json(
        { error: 'RESEND_FROM is not set. Set it to an address on your verified domain (e.g., no-reply@your-domain.com).' },
        { status: 500 }
      )
    }

    // In production, require a verified custom domain sender (not resend.dev)
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.RESEND_FROM) {
        return NextResponse.json(
          { error: 'RESEND_FROM must be set to a verified domain address in production (e.g., no-reply@your-domain.com)' },
          { status: 500 }
        )
      }
      const domainPart = fromAddress.split('<')[1]?.split('>')[0] || fromAddress
      if (domainPart.endsWith('@resend.dev')) {
        return NextResponse.json(
          { error: 'In production, RESEND_FROM cannot use resend.dev. Verify your domain in Resend and use that domain.' },
          { status: 500 }
        )
      }
    }

    const subject = 'Your TechClub Membership Application was Approved 🎉'
    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111">
        <h2>Hi ${firstName},</h2>
        <p>Great news — your membership application to <strong>TechClub</strong> has been <strong>approved</strong>!</p>
        <p>We're excited to have you join. You'll start receiving club updates, event invitations, and project opportunities soon.</p>
        <p style="margin-top: 16px">If you have any questions, just reply to this email.</p>
        <p style="margin-top: 24px">Welcome aboard,<br/>TechClub Team</p>
      </div>
    `

    try {
      const sendResult = await resend.emails.send({
        from: fromAddress,
        to: [email],
        subject,
        html,
      })

      if (sendResult.error) {
        console.error('Resend error:', sendResult.error)
        return NextResponse.json(
          { error: 'Failed to send email', details: sendResult.error },
          { status: 502 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Approval email sent successfully',
        details: { applicationId, email, firstName, lastName, status, id: sendResult.data?.id },
      })
    } catch (sendError) {
      console.error('Unexpected error sending email with Resend:', sendError)
      return NextResponse.json(
        { error: 'Unexpected error sending email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in send approval email route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 