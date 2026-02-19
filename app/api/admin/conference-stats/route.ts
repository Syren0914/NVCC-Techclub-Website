import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function isAdmin(user: any): Promise<boolean> {
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    return userData?.role === 'admin'
  } catch (error) {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Admin check
    const adminCheck = await isAdmin(user)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Use admin client to bypass RLS for conference registrations
    const adminSupabase = getSupabaseAdmin()
    
    // Get conference registration statistics
    const { data: registrations, error: registrationsError } = await adminSupabase
      .from('conference_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (registrationsError) {
      console.error('Error fetching conference registrations:', registrationsError)
      return NextResponse.json(
        { error: 'Failed to fetch conference registrations' },
        { status: 500 }
      )
    }

    const totalRegistrations = registrations?.length || 0
    const checkedInCount = registrations?.filter(r => r.checked_in).length || 0
    const pendingCheckIn = totalRegistrations - checkedInCount

    // Group by major
    const majorStats = registrations?.reduce((acc: any, reg: any) => {
      const major = reg.major || 'Unknown'
      acc[major] = (acc[major] || 0) + 1
      return acc
    }, {}) || {}

    // Group by participation type
    const participationStats = registrations?.reduce((acc: any, reg: any) => {
      const participation = reg.participation || 'attending'
      acc[participation] = (acc[participation] || 0) + 1
      return acc
    }, {}) || {}

    // Recent registrations (last 10)
    const recentRegistrations = registrations?.slice(0, 10) || []

    // Age distribution
    const ageStats = registrations?.reduce((acc: any, reg: any) => {
      if (reg.age) {
        if (reg.age < 18) acc['Under 18'] = (acc['Under 18'] || 0) + 1
        else if (reg.age <= 22) acc['18-22'] = (acc['18-22'] || 0) + 1
        else if (reg.age <= 30) acc['23-30'] = (acc['23-30'] || 0) + 1
        else acc['Over 30'] = (acc['Over 30'] || 0) + 1
      } else {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1
      }
      return acc
    }, {}) || {}

    // Registration timeline (by day)
    const registrationsByDay = registrations?.reduce((acc: any, reg: any) => {
      const date = new Date(reg.created_at).toDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {}) || {}

    return NextResponse.json({
      summary: {
        totalRegistrations,
        checkedInCount,
        pendingCheckIn,
        checkInRate: totalRegistrations > 0 ? Math.round((checkedInCount / totalRegistrations) * 100) : 0
      },
      breakdown: {
        majorStats,
        participationStats,
        ageStats,
        registrationsByDay
      },
      recentRegistrations: recentRegistrations.map(reg => ({
        id: reg.id,
        name: `${reg.first_name} ${reg.last_name}`,
        email: reg.email,
        major: reg.major,
        age: reg.age,
        participation: reg.participation,
        checked_in: reg.checked_in,
        checked_in_at: reg.checked_in_at,
        created_at: reg.created_at,
        unique_code: reg.unique_code
      })),
      allRegistrations: registrations?.map(reg => ({
        id: reg.id,
        name: `${reg.first_name} ${reg.last_name}`,
        email: reg.email,
        major: reg.major,
        age: reg.age,
        participation: reg.participation,
        expectations: reg.expectations,
        checked_in: reg.checked_in,
        checked_in_at: reg.checked_in_at,
        created_at: reg.created_at,
        unique_code: reg.unique_code
      })) || []
    })

  } catch (error) {
    console.error('Error in conference stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
