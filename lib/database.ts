import { supabase, TeamMember, Event, Project, Resource, MembershipApplication } from './supabase'
import { validateEmailDomain, getEmailDomainError } from './auth'

// Team Members
export async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('Error fetching team members:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.warn('Unexpected error in getTeamMembers:', err)
    return []
  }
}

// Alias for compatibility
export const fetchTeamMembers = getTeamMembers

// Milestones
export async function fetchMilestones(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .order('year', { ascending: true })

    if (error) {
      console.warn('Error fetching milestones:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.warn('Unexpected error in fetchMilestones:', err)
    return []
  }
}

// Events
export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(4)

    if (error) {
      console.warn('Error fetching events:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.warn('Unexpected error in getUpcomingEvents:', err)
    return []
  }
}

export async function getAllEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.warn('Error fetching all events:', error)
      return []
    }

    // Map database fields to expected interface
    const mappedEvents = (data || []).map(event => ({
      ...event,
      date: event.date || event.start_date || new Date().toISOString(),
      time: event.time || event.start_time || '',
      type: event.type || event.event_type || 'General',
      isOnline: event.isOnline || event.is_online || false,
      capacity: event.capacity || event.max_attendees || 0,
      registered: event.registered || event.current_attendees || 0,
      tags: event.tags || [event.type || event.event_type || 'General'],
      host: event.host || 'TechClub',
      image_url: event.image_url || event.image || ''
    }))

    return mappedEvents
  } catch (err) {
    console.warn('Unexpected error in getAllEvents:', err)
    return []
  }
}

// Featured Event
export async function getFeaturedEvent(): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_featured', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(1)
      .single()

    if (error) {
      // PGRST116 = no rows found, which is expected when no featured event exists
      if (error.code !== 'PGRST116') {
        console.warn('Error fetching featured event:', error)
      }
      return null
    }

    return data
  } catch (err) {
    console.warn('Unexpected error in getFeaturedEvent:', err)
    return null
  }
}

// Projects
export async function getProjectsByCategory(category: string): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching projects:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.warn('Unexpected error in getProjectsByCategory:', err)
    return []
  }
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching all projects:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.warn('Unexpected error in getAllProjects:', err)
    return []
  }
}

// Resources
export async function getResourcesByCategory(category: string): Promise<Resource[]> {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching resources:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.warn('Unexpected error in getResourcesByCategory:', err)
    return []
  }
}

export async function getAllResources(): Promise<Resource[]> {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Error fetching all resources:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.warn('Unexpected error in getAllResources:', err)
    return []
  }
}

// Membership Applications
export async function submitMembershipApplication(application: {
  first_name: string
  last_name: string
  email: string
  major: string
  areas_of_interest: string
  technical_experience_level?: string
  goals?: string
  github_username?: string
  linkedin_url?: string
  phone?: string
  graduation_year?: string
  preferred_contact_method?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate email domain
    if (!validateEmailDomain(application.email)) {
      return { success: false, error: getEmailDomainError() }
    }

    // Validate required fields
    if (!application.first_name || !application.last_name || !application.email || !application.major || !application.areas_of_interest) {
      return { success: false, error: 'Please fill in all required fields' }
    }

    // Create the base application data with only the columns that definitely exist
    const applicationData: any = {
      first_name: application.first_name,
      last_name: application.last_name,
      email: application.email,
      major: application.major,
      areas_of_interest: application.areas_of_interest,
      status: 'pending'
    }

    // Try to add optional columns if they exist
    if (application.technical_experience_level) {
      applicationData.technical_experience_level = application.technical_experience_level
    }
    if (application.goals) {
      applicationData.goals = application.goals
    }
    if (application.github_username) {
      applicationData.github_username = application.github_username
    }
    if (application.linkedin_url) {
      applicationData.linkedin_url = application.linkedin_url
    }
    if (application.phone) {
      applicationData.phone = application.phone
    }
    if (application.graduation_year) {
      applicationData.graduation_year = application.graduation_year
    }
    if (application.preferred_contact_method) {
      applicationData.preferred_contact_method = application.preferred_contact_method
    }

    const { error } = await supabase
      .from('membership_applications')
      .insert([applicationData])

    if (error) {
      console.error('Error submitting application:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error submitting application:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}


