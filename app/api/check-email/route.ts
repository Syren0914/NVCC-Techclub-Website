import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    console.log('Check-email API: Starting email check...')
    const { email } = await request.json()
    
    console.log('Check-email API: Received email:', email)
    
    if (!email) {
      console.log('Check-email API: No email provided')
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createClient()
    console.log('Check-email API: Supabase client created')
    
    // Check if email exists in membership_applications
    console.log('Check-email API: Querying database for email:', email)
    const { data: existingApplications, error } = await supabase
      .from('membership_applications')
      .select('id, email, status')
      .eq('email', email)

    console.log('Check-email API: Database query result:', { existingApplications, error })

    if (error) {
      console.error('Check-email API: Error checking email:', error)
      return NextResponse.json({ error: 'Failed to check email' }, { status: 500 })
    }

    if (existingApplications && existingApplications.length > 0) {
      // Get the most recent application (assuming the last one is the most recent)
      const latestApplication = existingApplications[existingApplications.length - 1]
      
      const response = { 
        exists: true, 
        status: latestApplication.status,
        message: latestApplication.status === 'pending' 
          ? 'You already have a pending application. Please wait for approval.'
          : latestApplication.status === 'approved'
          ? 'You are already an approved member!'
          : 'You have a previous application. Please contact an admin for assistance.'
      }
      console.log('Check-email API: Email exists, returning:', response)
      return NextResponse.json(response)
    }

    console.log('Check-email API: Email is available')
    return NextResponse.json({ exists: false, message: 'Email is available' })

  } catch (error) {
    console.error('Check-email API: Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
