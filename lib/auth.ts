import { createClient } from '@supabase/supabase-js'
import { User } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
  created_at: string
  updated_at: string
  leetcode_username?: string
  role?: string
  permissions?: string[]
  major?: string
  year_of_study?: string
  areas_of_interest?: string[]
  technical_experience_level?: string
  goals?: string
}

export interface UserRole {
  id: string
  user_id: string
  role: 'member' | 'officer' | 'vice_president' | 'president'
  assigned_at: string
  assigned_by?: string
  permissions: string[]
  is_active: boolean
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting current user:', error)
      return null
    }
    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

// Get or create user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    // First, try to get existing profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Creating new user profile for:', userId)
      return await createUserProfile(userId, {
        first_name: 'User',
        last_name: 'Member',
        email: 'user@example.com'
      })
    }

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return profile
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

// Create user profile
export async function createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Get user email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    const defaultProfile = {
      id: userId,
      first_name: profileData.first_name || 'User',
      last_name: profileData.last_name || 'Member',
      email: userData?.user?.email || profileData.email || 'user@example.com',
      avatar_url: profileData.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert(defaultProfile)
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    // Try to assign default member role (but don't fail if it doesn't work)
    try {
      await assignRole(userId, 'member')
    } catch (roleError) {
      console.warn('Could not assign default role, but profile was created:', roleError)
    }
    
    console.log('✅ User profile created successfully:', newProfile)
    return newProfile
  } catch (error) {
    console.error('Error in createUserProfile:', error)
    return null
  }
}

// Get user roles
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  try {
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching user roles:', error)
      return []
    }

    return roles || []
  } catch (error) {
    console.error('Error in getUserRoles:', error)
    return []
  }
}

// Get user permissions
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      user_uuid: userId
    })

    if (error) {
      console.error('Error fetching user permissions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserPermissions:', error)
    return []
  }
}

// Check if user has permission
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('has_permission', {
      user_uuid: userId,
      required_permission: permission
    })

    if (error) {
      console.error('Error checking permission:', error)
      return false
    }

    return data || false
  } catch (error) {
    console.error('Error in hasPermission:', error)
    return false
  }
}

// Assign role to user
export async function assignRole(userId: string, role: string, assignedBy?: string): Promise<boolean> {
  try {
    // First check if user_roles table exists by trying to query it
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1)

    if (tableError) {
      console.warn('user_roles table does not exist or is not accessible:', tableError.message)
      console.log('Skipping role assignment - table not available')
      return true // Return true to not block user creation
    }

    // Check if user already has this role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', role)
      .single()

    if (existingRole) {
      console.log('User already has role:', role)
      return true
    }

    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
        assigned_by: assignedBy,
        is_active: true
      })

    if (error) {
      console.error('Error assigning role:', error)
      // Don't fail user creation if role assignment fails
      return true
    }

    console.log('✅ Role assigned successfully:', role)
    return true
  } catch (error) {
    console.error('Error in assignRole:', error)
    // Don't fail user creation if role assignment fails
    return true
  }
}

// Remove role from user
export async function removeRole(userId: string, role: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role)

    if (error) {
      console.error('Error removing role:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in removeRole:', error)
    return false
  }
}

// Get all roles (for admin)
export async function getAllRoles(): Promise<UserRole[]> {
  try {
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('is_active', true)
      .order('assigned_at', { ascending: false })

    if (error) {
      console.error('Error fetching all roles:', error)
      return []
    }

    return roles || []
  } catch (error) {
    console.error('Error in getAllRoles:', error)
    return []
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  } catch (error) {
    console.error('Error in signOut:', error)
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user profile:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return false
  }
}

// Email domain validation
export function validateEmailDomain(email: string): boolean {
  // Allow any email domain for now
  // You can add specific domain validation here if needed
  return email.includes('@') && email.length > 5
}

export function getEmailDomainError(): string {
  return "Please enter a valid email address"
}

// Sign in function
export async function signIn(email: string, password: string): Promise<any> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data
  } catch (error) {
    console.error('Error in signIn:', error)
    throw error
  }
}

// Sign up function
export async function signUp(email: string, password: string, userData: Partial<UserProfile>): Promise<any> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          major: userData.major,
          year_of_study: userData.year_of_study,
          areas_of_interest: userData.areas_of_interest,
          technical_experience_level: userData.technical_experience_level,
          goals: userData.goals
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    // If user is created successfully, create their profile
    if (data.user) {
      await createUserProfile(data.user.id, {
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: email,
        major: userData.major,
        year_of_study: userData.year_of_study,
        areas_of_interest: userData.areas_of_interest,
        technical_experience_level: userData.technical_experience_level,
        goals: userData.goals
      })
    }
  
  return data
  } catch (error) {
    console.error('Error in signUp:', error)
    throw error
  }
} 

// Check if user is admin
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'president', 'officer'])
      .single()

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Get user role
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error getting user role:', error)
      return null
    }

    return data?.role || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}