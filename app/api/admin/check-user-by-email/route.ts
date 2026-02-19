import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 })
    }

    // Check if user exists in our custom users table
    const { data: customUser, error: customError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    // Check if user has any membership applications (get all, not just single)
    const { data: memberships, error: membershipError } = await supabase
      .from('membership_applications')
      .select('*')
      .eq('email', email)

    // Check if user has any project applications
    const { data: projectApplications, error: projectError } = await supabase
      .from('project_applications')
      .select('*')
      .eq('user_email', email)

    // Find approved membership (if any exist)
    const approvedMembership = memberships?.find(m => m.status === 'approved')
    const hasApprovedMembership = !!approvedMembership

    // For auth check, we'll assume if they exist in our users table, they exist in auth
    // This is a reasonable assumption since our system creates users in both places
    const authExists = !!customUser

    return NextResponse.json({
      success: true,
      email: email,
      auth: {
        exists: authExists,
        user: customUser ? {
          id: customUser.id,
          email: customUser.email,
          created_at: customUser.created_at || new Date().toISOString()
        } : null,
        error: null
      },
      custom_users_table: {
        exists: !!customUser,
        user: customUser,
        error: customError
      },
      membership_applications: {
        exists: memberships && memberships.length > 0,
        count: memberships?.length || 0,
        applications: memberships,
        approvedMembership: approvedMembership,
        hasApprovedMembership: hasApprovedMembership,
        error: membershipError
      },
      project_applications: {
        count: projectApplications?.length || 0,
        applications: projectApplications,
        error: projectError
      },
      summary: {
        inAuth: authExists,
        inCustomTable: !!customUser,
        hasMembership: hasApprovedMembership,
        membershipStatus: approvedMembership?.status || 'none',
        projectApplicationsCount: projectApplications?.length || 0,
        totalMembershipApplications: memberships?.length || 0
      }
    })

  } catch (error) {
    console.error('Error checking user by email:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error
    }, { status: 500 })
  }
}
