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

    // Check if user has admin role (simple email-based check)
    if (user.email !== 'test@email.vccs.edu') {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      })
    }

    // Check if tables exist
    const tableChecks = ['users', 'events', 'projects', 'resources', 'membership_applications', 'team_members', 'milestones']
    const tableStatus = {}
    const missingTables = []
    
    for (const table of tableChecks) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1)
        tableStatus[table] = { exists: !error, error: error?.message }
        if (error) {
          missingTables.push(table)
        }
      } catch (err) {
        tableStatus[table] = { exists: false, error: err.message }
        missingTables.push(table)
      }
    }

    const allTablesExist = missingTables.length === 0

    if (allTablesExist) {
      return NextResponse.json({
        success: true,
        message: 'All database tables exist and are working correctly!'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: `Missing tables: ${missingTables.join(', ')}. Please run the recreate-tables.sql script in Supabase SQL Editor.`,
        missingTables,
        tableStatus,
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to the SQL Editor',
          '3. Copy the contents of recreate-tables.sql file',
          '4. Paste and execute the SQL script',
          '5. Refresh this page to verify the setup'
        ]
      })
    }

  } catch (error) {
    console.error('Error in setup database API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
