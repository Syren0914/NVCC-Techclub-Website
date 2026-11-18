import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export interface UserRole {
  id: string
  user_id: string
  role: 'member' | 'officer' | 'vice_president' | 'president'
  assigned_at: string
  assigned_by?: string
  permissions: string[]
  is_active: boolean
}

export interface RolePermissions {
  member: string[]
  officer: string[]
  vice_president: string[]
  president: string[]
}

// Define permissions for each role
const ROLE_PERMISSIONS: RolePermissions = {
  member: [
    'view_events',
    'join_events',
    'view_resources',
    'participate_leetcode',
    'view_projects',
    'submit_feedback'
  ],
  officer: [
    'view_events',
    'join_events',
    'view_resources',
    'participate_leetcode',
    'view_projects',
    'submit_feedback',
    'create_events',
    'edit_events',
    'manage_resources',
    'moderate_discussions',
    'view_analytics'
  ],
  vice_president: [
    'view_events',
    'join_events',
    'view_resources',
    'participate_leetcode',
    'view_projects',
    'submit_feedback',
    'create_events',
    'edit_events',
    'manage_resources',
    'moderate_discussions',
    'view_analytics',
    'manage_officers',
    'approve_events',
    'manage_budget',
    'view_member_list',
    'send_notifications'
  ],
  president: [
    'view_events',
    'join_events',
    'view_resources',
    'participate_leetcode',
    'view_projects',
    'submit_feedback',
    'create_events',
    'edit_events',
    'manage_resources',
    'moderate_discussions',
    'view_analytics',
    'manage_officers',
    'approve_events',
    'manage_budget',
    'view_member_list',
    'send_notifications',
    'manage_all_roles',
    'delete_events',
    'manage_club_settings',
    'access_admin_panel'
  ]
}

// GET - Fetch user roles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    let query = supabase
      .from('user_roles')
      .select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (role) {
      query = query.eq('role', role)
    }

    const { data: roles, error } = await query

    if (error) {
      console.error('Error fetching roles:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch roles'
      })
    }

    return NextResponse.json({
      success: true,
      data: roles,
      permissions: ROLE_PERMISSIONS
    })

  } catch (error) {
    console.error('Error in roles API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// POST - Assign role to user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, role, assignedBy } = body

    if (!userId || !role) {
      return NextResponse.json({
        success: false,
        error: 'User ID and role are required'
      })
    }

    // Validate role
    if (!Object.keys(ROLE_PERMISSIONS).includes(role)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid role'
      })
    }

    // Check if user already has this role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role)
      .single()

    if (existingRole) {
      return NextResponse.json({
        success: false,
        error: 'User already has this role'
      })
    }

    // Assign the role
    const { data: newRole, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        assigned_at: new Date().toISOString(),
        assigned_by: assignedBy,
        permissions: ROLE_PERMISSIONS[role as keyof RolePermissions],
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error assigning role:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to assign role'
      })
    }

    return NextResponse.json({
      success: true,
      data: newRole,
      message: `Role ${role} assigned successfully`
    })

  } catch (error) {
    console.error('Error in role assignment:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// PUT - Update user role
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { userId, role, isActive } = body

    if (!userId || !role) {
      return NextResponse.json({
        success: false,
        error: 'User ID and role are required'
      })
    }

    const updateData: any = {
      permissions: ROLE_PERMISSIONS[role as keyof RolePermissions]
    }

    if (isActive !== undefined) {
      updateData.is_active = isActive
    }

    const { data: updatedRole, error } = await supabase
      .from('user_roles')
      .update(updateData)
      .eq('user_id', userId)
      .eq('role', role)
      .select()
      .single()

    if (error) {
      console.error('Error updating role:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to update role'
      })
    }

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    })

  } catch (error) {
    console.error('Error in role update:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// DELETE - Remove user role
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    if (!userId || !role) {
      return NextResponse.json({
        success: false,
        error: 'User ID and role are required'
      })
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role)

    if (error) {
      console.error('Error removing role:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to remove role'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Role removed successfully'
    })

  } catch (error) {
    console.error('Error in role removal:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    })
  }
} 