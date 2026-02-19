import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test if users table exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')

    // Test if we can find your specific user
    const { data: yourUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', 'c6077857-5638-43af-81b1-ddb4954cb4fa')
      .maybeSingle()

    return NextResponse.json({
      usersTableExists: !usersError,
      usersError: usersError,
      totalUsers: users?.length || 0,
      yourUserExists: !userError,
      yourUser: yourUser,
      yourUserError: userError
    })
  } catch (error) {
    console.error('Error in test db simple:', error)
    return NextResponse.json(
      { error: 'Database test failed', details: error },
      { status: 500 }
    )
  }
}
