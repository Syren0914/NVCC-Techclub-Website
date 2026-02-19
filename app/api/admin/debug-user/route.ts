import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        error: 'No authorization header'
      })
    }

    // Verify the JWT token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Invalid token',
        details: authError
      })
    }

    // Check what users exist in the database
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*')

    // Check if current user exists in database
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    return NextResponse.json({
      currentUser: {
        id: user.id,
        email: user.email
      },
      allUsers: allUsers || [],
      currentUserInDatabase: currentUser || null,
      currentUserError: currentUserError,
      usersError: usersError
    })
  } catch (error) {
    console.error('Error in debug user API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
