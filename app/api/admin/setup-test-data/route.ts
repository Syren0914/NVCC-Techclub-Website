import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No authorization header'
      })
    }

    // Verify the JWT token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        details: authError
      })
    }

    // Check if user exists in our users table and has admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (userData?.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      })
    }

    // Sample data
    const sampleUsers = [
      { id: 'user-1', email: 'john.doe@email.vccs.edu', role: 'user' },
      { id: 'user-2', email: 'jane.smith@email.vccs.edu', role: 'user' },
      { id: 'user-3', email: 'mike.johnson@email.vccs.edu', role: 'user' },
      { id: 'user-4', email: 'sarah.wilson@email.vccs.edu', role: 'user' },
      { id: 'user-5', email: 'david.brown@email.vccs.edu', role: 'user' }
    ]

    const sampleEvents = [
      {
        title: 'Tech Talk: Introduction to React',
        description: 'Learn the basics of React development',
        date: '2024-02-15',
        time: '14:00',
        location: 'Room 101',
        is_featured: true,
        image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'
      },
      {
        title: 'Hackathon 2024',
        description: '24-hour coding challenge for students',
        date: '2024-03-20',
        time: '09:00',
        location: 'Main Hall',
        is_featured: false,
        image_url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=500'
      },
      {
        title: 'Career Fair',
        description: 'Meet with tech companies and startups',
        date: '2024-04-10',
        time: '10:00',
        location: 'Student Center',
        is_featured: true,
        image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500'
      }
    ]

    const sampleProjects = [
      {
        title: 'E-Learning Platform',
        description: 'A modern learning management system',
        technologies: ['React', 'Node.js', 'MongoDB'],
        status: 'active',
        team_members: ['John Doe', 'Jane Smith'],
        github_url: 'https://github.com/techclub/elearning',
        live_url: 'https://elearning.techclub.edu',
        image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500'
      },
      {
        title: 'Mobile App for Campus',
        description: 'Campus navigation and event management app',
        technologies: ['React Native', 'Firebase', 'TypeScript'],
        status: 'active',
        team_members: ['Mike Johnson', 'Sarah Wilson'],
        github_url: 'https://github.com/techclub/campus-app',
        live_url: 'https://campus-app.techclub.edu',
        image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500'
      },
      {
        title: 'AI Chatbot',
        description: 'Intelligent chatbot for student services',
        technologies: ['Python', 'TensorFlow', 'Flask'],
        status: 'completed',
        team_members: ['David Brown', 'Emily Davis'],
        github_url: 'https://github.com/techclub/ai-chatbot',
        live_url: 'https://chatbot.techclub.edu',
        image_url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=500'
      },
      {
        title: 'E-commerce Website',
        description: 'Online store for campus merchandise',
        technologies: ['Next.js', 'Stripe', 'PostgreSQL'],
        status: 'on-hold',
        team_members: ['Alex Chen', 'Maria Garcia'],
        github_url: 'https://github.com/techclub/ecommerce',
        live_url: 'https://store.techclub.edu',
        image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500'
      }
    ]

    const sampleResources = [
      {
        title: 'React Fundamentals',
        description: 'Complete guide to React basics',
        category: 'Web Development',
        url: 'https://react.dev/learn',
        image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500'
      },
      {
        title: 'Python for Beginners',
        description: 'Learn Python programming from scratch',
        category: 'Programming',
        url: 'https://python.org/doc/tutorial/',
        image_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500'
      },
      {
        title: 'Database Design',
        description: 'SQL and database design principles',
        category: 'Database',
        url: 'https://sqlbolt.com/',
        image_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500'
      },
      {
        title: 'UI/UX Design Principles',
        description: 'Design beautiful and functional interfaces',
        category: 'Design',
        url: 'https://uxdesign.cc/',
        image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500'
      },
      {
        title: 'Machine Learning Basics',
        description: 'Introduction to ML concepts and algorithms',
        category: 'AI/ML',
        url: 'https://ml.coursera.org/',
        image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecadf12?w=500'
      },
      {
        title: 'DevOps Practices',
        description: 'CI/CD and deployment strategies',
        category: 'DevOps',
        url: 'https://devops.com/',
        image_url: 'https://images.unsplash.com/photo-1667372393119-4d95c8a9a7a7?w=500'
      }
    ]

    const sampleTeamMembers = [
      {
        name: 'John Doe',
        email: 'john.doe@email.vccs.edu',
        student_id: 'jd123',
        major: 'Computer Science',
        graduation_year: 2024,
        interests: ['Web Development', 'React', 'Node.js'],
        experience: '2 years of web development experience',
        motivation: 'Passionate about creating user-friendly applications',
        status: 'approved'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@email.vccs.edu',
        student_id: 'js456',
        major: 'Information Technology',
        graduation_year: 2025,
        interests: ['Mobile Development', 'UI/UX', 'Flutter'],
        experience: 'Mobile app development enthusiast',
        motivation: 'Want to build apps that make a difference',
        status: 'approved'
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@email.vccs.edu',
        student_id: 'mj789',
        major: 'Software Engineering',
        graduation_year: 2024,
        interests: ['Backend Development', 'Python', 'Django'],
        experience: 'Backend developer with database skills',
        motivation: 'Interested in scalable architecture',
        status: 'approved'
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.vccs.edu',
        student_id: 'sw012',
        major: 'Computer Science',
        graduation_year: 2026,
        interests: ['AI/ML', 'Data Science', 'Python'],
        experience: 'Machine learning projects and research',
        motivation: 'Excited about AI applications',
        status: 'approved'
      },
      {
        name: 'David Brown',
        email: 'david.brown@email.vccs.edu',
        student_id: 'db345',
        major: 'Information Systems',
        graduation_year: 2025,
        interests: ['Full Stack', 'JavaScript', 'MongoDB'],
        experience: 'Full-stack development experience',
        motivation: 'Love building complete solutions',
        status: 'approved'
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@email.vccs.edu',
        student_id: 'ed678',
        major: 'Computer Science',
        graduation_year: 2024,
        interests: ['Cybersecurity', 'Networking', 'Linux'],
        experience: 'Security research and penetration testing',
        motivation: 'Passionate about digital security',
        status: 'approved'
      },
      {
        name: 'Alex Chen',
        email: 'alex.chen@email.vccs.edu',
        student_id: 'ac901',
        major: 'Information Technology',
        graduation_year: 2026,
        interests: ['Cloud Computing', 'AWS', 'Docker'],
        experience: 'Cloud infrastructure and DevOps',
        motivation: 'Want to learn modern deployment practices',
        status: 'approved'
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@email.vccs.edu',
        student_id: 'mg234',
        major: 'Software Engineering',
        graduation_year: 2025,
        interests: ['Game Development', 'Unity', 'C#'],
        experience: 'Game development and 3D modeling',
        motivation: 'Dream of creating engaging games',
        status: 'approved'
      }
    ]

    // Insert sample data
    let usersCreated = 0
    let eventsCreated = 0
    let projectsCreated = 0
    let resourcesCreated = 0
    let teamMembersCreated = 0

    // Insert users
    for (const user of sampleUsers) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'id' })
      
      if (!error) usersCreated++
    }

    // Insert events
    for (const event of sampleEvents) {
      const { error } = await supabase
        .from('events')
        .insert(event)
      
      if (!error) eventsCreated++
    }

    // Insert projects
    for (const project of sampleProjects) {
      const { error } = await supabase
        .from('projects')
        .insert(project)
      
      if (!error) projectsCreated++
    }

    // Insert resources
    for (const resource of sampleResources) {
      const { error } = await supabase
        .from('resources')
        .insert(resource)
      
      if (!error) resourcesCreated++
    }

    // Insert team members (membership applications)
    for (const member of sampleTeamMembers) {
      const { error } = await supabase
        .from('membership_applications')
        .upsert(member, { onConflict: 'email' })
      
      if (!error) teamMembersCreated++
    }

    return NextResponse.json({
      success: true,
      message: 'Test data setup completed successfully',
      data: {
        users: usersCreated,
        events: eventsCreated,
        projects: projectsCreated,
        resources: resourcesCreated,
        teamMembers: teamMembersCreated
      }
    })

  } catch (error) {
    console.error('Error in setup test data API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
