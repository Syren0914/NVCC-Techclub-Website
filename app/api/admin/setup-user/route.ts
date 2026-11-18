import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // First, check if the user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email)
    
    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: 'User not found in auth system', details: authError },
        { status: 404 }
      )
    }

    // Insert or update the user in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: authUser.user.id,
        email: email,
        role: 'admin'
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (userError) {
      console.error('Error setting up user:', userError)
      return NextResponse.json(
        { error: 'Failed to set up user', details: userError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been set up as admin`,
      user: userData
    })
  } catch (error) {
    console.error('Error in setup user API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
