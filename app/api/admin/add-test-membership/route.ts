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

    // Add a test membership application
    const { data: membership, error } = await supabase
      .from('membership_applications')
      .insert([{
        name: 'Test User',
        email: 'test@email.vccs.edu',
        student_id: '12345',
        major: 'Computer Science',
        graduation_year: 2025,
        interests: ['Web Development', 'AI/ML'],
        experience: 'Some programming experience',
        motivation: 'Want to join TechClub to learn and grow',
        status: 'approved'
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating test membership:', error)
      return NextResponse.json(
        { error: 'Failed to create test membership' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Test membership application created successfully',
      data: membership
    })

  } catch (error) {
    console.error('Error in add test membership API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

