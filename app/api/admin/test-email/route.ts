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

    const { to, subject, body } = await request.json()

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('RESEND_API_KEY is not configured; skipping send. Logging only.')
      console.log('Test email (dry-run):', { to, subject, body })
      return NextResponse.json({ 
        success: true, 
        message: 'Email not sent (missing RESEND_API_KEY). Logged for debugging instead.',
        details: { to, subject, body }
      })
    }

    const resend = new Resend(apiKey)
    const fromAddress = process.env.RESEND_FROM

    if (!fromAddress) {
      return NextResponse.json(
        { error: 'RESEND_FROM is not set. Set it to an address on your verified domain.' },
        { status: 500 }
      )
    }

    if (process.env.NODE_ENV === 'production') {
      if (!process.env.RESEND_FROM) {
        return NextResponse.json(
          { error: 'RESEND_FROM must be set to a verified domain address in production' },
          { status: 500 }
        )
      }
      const domainPart = fromAddress.split('<')[1]?.split('>')[0] || fromAddress
      if (domainPart.endsWith('@resend.dev')) {
        return NextResponse.json(
          { error: 'In production, RESEND_FROM cannot use resend.dev. Verify your domain and update RESEND_FROM.' },
          { status: 500 }
        )
      }
    }

    try {
      const sendResult = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject: subject || 'Test Email from TechClub',
        html: body || '<p>This is a test email from TechClub</p>',
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
        message: 'Test email sent successfully',
        details: { to, subject, id: sendResult.data?.id }
      })
    } catch (sendError) {
      console.error('Unexpected error sending test email:', sendError)
      return NextResponse.json(
        { error: 'Unexpected error sending email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in test email route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 