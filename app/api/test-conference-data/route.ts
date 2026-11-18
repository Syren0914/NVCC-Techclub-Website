import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing conference data access...')
    
    // Test with both regular and admin clients
    const adminSupabase = getSupabaseAdmin()
    
    // Test direct query to conference_registrations table with regular client
    const { data: registrations, error: registrationsError } = await supabase
      .from('conference_registrations')
      .select('*')
      .limit(10)
      
    // Test with admin client
    const { data: adminRegistrations, error: adminRegistrationsError } = await adminSupabase
      .from('conference_registrations')
      .select('*')
      .limit(10)

    console.log('Regular client result:', { registrations, registrationsError })
    console.log('Admin client result:', { adminRegistrations, adminRegistrationsError })

    // Test table existence by checking count with admin client
    const { count, error: countError } = await adminSupabase
      .from('conference_registrations')
      .select('*', { count: 'exact', head: true })

    console.log('Count query result:', { count, countError })

    return NextResponse.json({
      success: true,
      message: 'Conference data test completed',
      results: {
        regularClient: {
          registrations: registrations || [],
          registrationCount: registrations?.length || 0,
          error: registrationsError
        },
        adminClient: {
          registrations: adminRegistrations || [],
          registrationCount: adminRegistrations?.length || 0,
          error: adminRegistrationsError
        },
        totalCount: count || 0,
        countError
      }
    })

  } catch (error) {
    console.error('Error in test conference data API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
