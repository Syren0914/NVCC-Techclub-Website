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

    // Check if user is admin (simple email-based check)
    if (user.email !== 'test@email.vccs.edu') {
      return NextResponse.json({
        error: 'Admin access required'
      })
    }

    // Test each table
    const tables = ['users', 'events', 'projects', 'resources', 'membership_applications']
    const results = {}

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1)
        results[table] = {
          exists: !error,
          error: error?.message,
          count: data?.length || 0
        }
      } catch (err) {
        results[table] = {
          exists: false,
          error: err.message,
          count: 0
        }
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      tables: results
    })

  } catch (error) {
    console.error('Error in test tables API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
