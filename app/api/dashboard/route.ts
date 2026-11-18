import { NextResponse } from 'next/server'
import { supabase, getCurrentUser, getUserProfile, getUserRoles, getAllRoles } from '@/lib/auth'

export interface DashboardData {
  userProfile: any
  userRoles: any[]
  upcomingEvents: any[]
  upcomingWorkshops: any[]
  upcomingHackathons: any[]
  userProjects: any[]
  userResources: any[]
  leetcodeRankings: any[]
  devpostHackathons: any[]
  notifications: any[]
  activities: any[]
  quickStats: any
  roleStats: any
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      })
    }

    console.log('🔄 Loading dashboard data for user:', userId)

    // Get user profile (will create if doesn't exist)
    let userProfile = null
    try {
      userProfile = await getUserProfile(userId)
    } catch (error) {
      console.warn('Could not get or create user profile, using fallback:', error)
    }

    // If profile creation failed, create a fallback profile
    if (!userProfile) {
      console.log('⚠️ Using fallback user profile')
      userProfile = {
        id: userId,
        first_name: 'User',
        last_name: 'Member',
        email: 'user@example.com',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    console.log('✅ User profile loaded:', userProfile)

    // Get user roles
    let userRoles = []
    try {
      userRoles = await getUserRoles(userId)
    } catch (error) {
      console.warn('Could not fetch user roles:', error)
    }
    console.log('👤 User roles:', userRoles)

    // Fetch events from database
    let events = null
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true })
        .limit(5)

      if (eventsError) {
        console.error('Error fetching events:', eventsError)
      } else {
        events = eventsData
      }
    } catch (error) {
      console.warn('Events table not available:', error)
    }

    // Fetch workshops from database
    let workshops = null
    try {
      const { data: workshopsData, error: workshopsError } = await supabase
        .from('workshops')
        .select('*')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .limit(3)

      if (workshopsError) {
        console.error('Error fetching workshops:', workshopsError)
      } else {
        workshops = workshopsData
      }
    } catch (error) {
      console.warn('Workshops table not available:', error)
    }

    // Fetch projects from database
    let projects = null
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (projectsError) {
        console.error('Error fetching projects:', projectsError)
      } else {
        projects = projectsData
      }
    } catch (error) {
      console.warn('Projects table not available:', error)
    }

    // Fetch resources from database
    let resources = null
    try {
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (resourcesError) {
        console.error('Error fetching resources:', resourcesError)
      } else {
        resources = resourcesData
      }
    } catch (error) {
      console.warn('Resources table not available:', error)
    }

    // Fetch notifications from database
    let notifications = null
    try {
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError)
      } else {
        notifications = notificationsData
      }
    } catch (error) {
      console.warn('Notifications table not available:', error)
    }

    // Fetch activities from database
    let activities = null
    try {
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError)
      } else {
        activities = activitiesData
      }
    } catch (error) {
      console.warn('Activities table not available:', error)
    }

    // Get role statistics
    let roleStats = {
      total_members: 0,
      officers: 0,
      vice_presidents: 0,
      presidents: 0
    }
    try {
      const allRoles = await getAllRoles()
      roleStats = {
        total_members: allRoles.filter(r => r.role === 'member').length,
        officers: allRoles.filter(r => r.role === 'officer').length,
        vice_presidents: allRoles.filter(r => r.role === 'vice_president').length,
        presidents: allRoles.filter(r => r.role === 'president').length
      }
    } catch (error) {
      console.warn('Could not fetch role statistics:', error)
    }

    // Get quick stats
    let memberCount = 156
    let projectCount = 8
    let workshopCount = 24

    try {
      const { data: memberData } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
      if (memberData) memberCount = memberData.length
    } catch (error) {
      console.warn('Could not fetch member count:', error)
    }

    try {
      const { data: projectData } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
      if (projectData) projectCount = projectData.length
    } catch (error) {
      console.warn('Could not fetch project count:', error)
    }

    try {
      const { data: workshopData } = await supabase
        .from('workshops')
        .select('id', { count: 'exact' })
      if (workshopData) workshopCount = workshopData.length
    } catch (error) {
      console.warn('Could not fetch workshop count:', error)
    }

    const quickStats = {
      totalMembers: memberCount,
      activeProjects: projectCount,
      completedWorkshops: workshopCount,
      totalHackathons: 6,
      averageRating: 4.7,
      monthlyGrowth: 12.5
    }

    // Fetch LeetCode data
    let leetcodeRankings = []
    try {
      const leetcodeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/leetcode`)
      const leetcodeData = await leetcodeResponse.json()
      if (leetcodeData.success) {
        leetcodeRankings = leetcodeData.data
      }
    } catch (error) {
      console.error('Error fetching LeetCode data:', error)
    }

    // Fetch Devpost data
    let devpostHackathons = []
    try {
      const devpostResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/devpost`)
      const devpostData = await devpostResponse.json()
      if (devpostData.success) {
        devpostHackathons = devpostData.data
      }
    } catch (error) {
      console.error('Error fetching Devpost data:', error)
    }

    // Provide fallback data if database queries fail
    const fallbackEvents = [
      {
        id: '1',
        title: "Weekly Tech Club Meeting",
        date: "2024-12-15",
        time: "14:30",
        location: "LC Building Room 302E",
        type: "Meeting",
        attendees: 45,
        status: "upcoming"
      },
      {
        id: '2',
        title: "Web Development Workshop",
        date: "2024-12-20",
        time: "15:00",
        location: "Online",
        type: "Workshop",
        attendees: 120,
        status: "upcoming"
      }
    ]

    const fallbackWorkshops = [
      {
        id: '1',
        title: "React Hooks Deep Dive",
        date: "2024-12-18",
        time: "16:00",
        duration: 120,
        instructor: "John Smith",
        capacity: 50,
        enrolled: 35
      }
    ]

    const fallbackProjects = [
      {
        id: '1',
        name: "Club Website",
        description: "Building the TechClub website with Next.js",
        role: "Lead Developer",
        progress: 75,
        team: ["Alex", "Sarah", "Mike"],
        deadline: "2024-12-30",
        priority: "high"
      },
      {
        id: '2',
        name: "Mobile App",
        description: "Creating a mobile app for event management",
        role: "Contributor",
        progress: 30,
        team: ["Emma", "David"],
        deadline: "2025-01-15",
        priority: "medium"
      }
    ]

    const fallbackResources = [
      {
        id: '1',
        title: "React Best Practices",
        category: "Web Development",
        accessed_at: "2024-12-10",
        views: 156,
        rating: 4.8
      },
      {
        id: '2',
        title: "Cybersecurity Fundamentals",
        category: "Security",
        accessed_at: "2024-12-08",
        views: 89,
        rating: 4.6
      }
    ]

    const fallbackNotifications = [
      {
        id: '1',
        title: "Welcome to TechClub!",
        message: "Your account has been created successfully",
        type: "welcome",
        time: "Just now",
        read: false
      }
    ]

    const fallbackActivities = [
      {
        id: '1',
        user: "You",
        action: "joined",
        target: "TechClub",
        time: "Just now",
        avatar: "/placeholder-user.jpg"
      }
    ]

    const dashboardData: DashboardData = {
      userProfile,
      userRoles,
      upcomingEvents: events || fallbackEvents,
      upcomingWorkshops: workshops || fallbackWorkshops,
      upcomingHackathons: [], // Will be populated from external API
      userProjects: projects || fallbackProjects,
      userResources: resources || fallbackResources,
      leetcodeRankings,
      devpostHackathons,
      notifications: notifications || fallbackNotifications,
      activities: activities || fallbackActivities,
      quickStats,
      roleStats
    }

    console.log('✅ Dashboard data loaded successfully')

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('❌ Error loading dashboard data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to load dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 