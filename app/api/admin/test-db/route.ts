import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Test if events table exists
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('count')
      .limit(1)

    // Test if projects table exists
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('count')
      .limit(1)

    // Test if resources table exists
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('count')
      .limit(1)

    return NextResponse.json({
      events: { exists: !eventsError, error: eventsError },
      projects: { exists: !projectsError, error: projectsError },
      resources: { exists: !resourcesError, error: resourcesError }
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { error: 'Database test failed', details: error },
      { status: 500 }
    )
  }
}
