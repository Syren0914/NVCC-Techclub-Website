import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      status: 'testing',
      tables: {} as any,
      errors: [] as string[]
    }

    // Test each table connection
    const tables = [
      'users',
      'events', 
      'projects',
      'resources',
      'membership_applications',
      'team_members',
      'milestones'
    ]

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1)

        results.tables[table] = {
          exists: true,
          count: count || 0,
          error: error ? error.message : null
        }

        if (error) {
          results.errors.push(`${table}: ${error.message}`)
        }
      } catch (err) {
        results.tables[table] = {
          exists: false,
          count: 0,
          error: err instanceof Error ? err.message : 'Unknown error'
        }
        results.errors.push(`${table}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    // Test RLS policies
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('events')
        .select('count', { count: 'exact', head: true })

      results.rls = {
        working: !rlsError,
        error: rlsError?.message || null
      }

      if (rlsError) {
        results.errors.push(`RLS: ${rlsError.message}`)
      }
    } catch (err) {
      results.rls = {
        working: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
      results.errors.push(`RLS: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    results.status = results.errors.length === 0 ? 'healthy' : 'issues'
    
    return NextResponse.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 