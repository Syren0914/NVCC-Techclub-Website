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

    // Check if user exists in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (userError || !userData) {
      // User doesn't exist in our table, create them
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          role: 'user' // Default role
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        return NextResponse.json({
          success: false,
          error: 'Failed to create user record',
          details: insertError
        })
      }

      return NextResponse.json({
        success: true,
        isAdmin: false,
        user: newUser,
        message: 'User created with default role'
      })
    }

    // User exists, check if they're admin
    const isAdmin = userData.role === 'admin'

    return NextResponse.json({
      success: true,
      isAdmin,
      user: userData,
      message: isAdmin ? 'Admin access granted' : 'User access granted'
    })

  } catch (error) {
    console.error('Error in check admin API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
