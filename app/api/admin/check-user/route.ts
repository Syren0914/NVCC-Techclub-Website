import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        authenticated: false,
        error: 'No authorization header'
      })
    }

    // Verify the JWT token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        authenticated: false,
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

    if (userError) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email
        },
        inDatabase: false,
        error: 'User not found in database',
        details: userError
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: userData.role
      },
      inDatabase: true,
      isAdmin: userData.role === 'admin'
    })
  } catch (error) {
    console.error('Error in check user API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
