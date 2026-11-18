import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  image: string
  year: string
  contact: string
  specialties: string[]
  github: string
  linkedin: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  date: string // Changed from start_date to match events page
  start_date?: string // Keep for backward compatibility
  end_date?: string
  time?: string // Changed from start_time to match events page
  start_time?: string // Keep for backward compatibility
  end_time?: string
  location?: string
  description?: string
  type: string // Changed from event_type to match events page
  event_type?: string // Keep for backward compatibility
  is_online?: boolean
  isOnline?: boolean // Add alias for events page
  max_attendees?: number
  current_attendees?: number
  capacity?: number // Add alias for events page
  registered?: number // Add alias for events page
  status?: string
  created_by?: string
  created_at: string
  updated_at?: string
  image_url?: string // Add image field for events page
  tags?: string[] // Add tags field for events page
  host?: string // Add host field for events page
  is_featured?: boolean // Add featured field for events page
}

export interface Project {
  id: number
  name: string
  description: string
  link: string
  category: string
  image?: string
  status?: string
  tags?: string[]
  featured?: boolean
  github?: string
  demo?: string
  members?: number
  created_at: string
}

export interface Resource {
  id: number
  title: string
  description: string
  link?: string
  url?: string
  category: string
  icon?: string
  image?: string
  type?: string
  level?: string
  featured?: boolean
  tags?: string[]
  author?: string
  dateUpdated?: string
  created_at: string
}

export interface MembershipApplication {
  id: number
  first_name: string
  last_name: string
  email: string
  major: string
  areas_of_interest: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
} 
