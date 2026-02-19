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

    // First, check if users table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (tableError) {
      return NextResponse.json({
        success: false,
        error: 'Users table does not exist. Please run the database setup script first.',
        details: tableError
      })
    }

    // Insert the current user into the users table with admin role
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        role: 'admin'
      }, {
        onConflict: 'id'
      })
      .select()

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to insert user into database',
        details: insertError
      })
    }

    // Verify the user was added
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to verify user was added',
        details: verifyError
      })
    }

    return NextResponse.json({
      success: true,
      message: 'User successfully added to database with admin role',
      user: verifyData
    })

  } catch (error) {
    console.error('Error in fix user db API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
