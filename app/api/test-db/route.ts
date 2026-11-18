import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Check if Supabase client is configured
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase client not initialized' 
      }, { status: 500 })
    }

    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('events')
      .select('count')
      .limit(1)

    if (connectionError) {
      console.error('Database connection error:', connectionError)
      
      // Check if it's a table doesn't exist error
      if (connectionError.message && connectionError.message.includes('relation "events" does not exist')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Events table does not exist. Please run the database setup script.',
          details: connectionError.message
        }, { status: 404 })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed',
        details: connectionError.message
      }, { status: 500 })
    }

    // Try to get table info
    const { data: tables, error: tablesError } = await supabase
      .from('events')
      .select('*')
      .limit(5)

    if (tablesError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Error querying events table',
        details: tablesError.message
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      eventsCount: tables?.length || 0,
      sampleEvent: tables?.[0] || null
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
