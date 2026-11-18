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

    // Check if user has admin role (simple email-based check)
    if (user.email !== 'test@email.vccs.edu') {
      return NextResponse.json({
        success: false,
        error: 'Admin access required'
      })
    }

    // Run the SQL script to set up tables
    const sqlScript = `
      -- Drop existing tables if they exist
      DROP TABLE IF EXISTS project_applications CASCADE;
      DROP TABLE IF EXISTS membership_applications CASCADE;
      
      -- Create project_applications table
      CREATE TABLE project_applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          user_email TEXT NOT NULL,
          user_name TEXT,
          user_major TEXT,
          user_year TEXT,
          motivation TEXT,
          skills TEXT[] DEFAULT '{}',
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          admin_notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create membership_applications table with all required columns
      CREATE TABLE membership_applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          student_id TEXT,
          major TEXT,
          graduation_year INTEGER,
          interests TEXT[] DEFAULT '{}',
          experience TEXT,
          motivation TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable Row Level Security
      ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
      ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Anyone can insert project applications" ON project_applications;
      DROP POLICY IF EXISTS "Admins can read all project applications" ON project_applications;
      DROP POLICY IF EXISTS "Admins can update project applications" ON project_applications;
      DROP POLICY IF EXISTS "Admins can delete project applications" ON project_applications;
      
      DROP POLICY IF EXISTS "Anyone can insert applications" ON membership_applications;
      DROP POLICY IF EXISTS "Admins can read all applications" ON membership_applications;
      DROP POLICY IF EXISTS "Admins can update applications" ON membership_applications;
      DROP POLICY IF EXISTS "Admins can delete applications" ON membership_applications;
      
      -- Create RLS policies for project_applications
      CREATE POLICY "Anyone can insert project applications" ON project_applications FOR INSERT WITH CHECK (true);
      CREATE POLICY "Admins can read all project applications" ON project_applications FOR SELECT USING (true);
      CREATE POLICY "Admins can update project applications" ON project_applications FOR UPDATE USING (true);
      CREATE POLICY "Admins can delete project applications" ON project_applications FOR DELETE USING (true);
      
      -- Create RLS policies for membership_applications
      CREATE POLICY "Anyone can insert applications" ON membership_applications FOR INSERT WITH CHECK (true);
      CREATE POLICY "Admins can read all applications" ON membership_applications FOR SELECT USING (true);
      CREATE POLICY "Admins can update applications" ON membership_applications FOR UPDATE USING (true);
      CREATE POLICY "Admins can delete applications" ON membership_applications FOR DELETE USING (true);
      
      -- Insert a test membership application for test@email.vccs.edu
      INSERT INTO membership_applications (name, email, student_id, major, graduation_year, interests, experience, motivation, status) VALUES
      ('Test User', 'test@email.vccs.edu', '12345', 'Computer Science', 2025, ARRAY['Web Development', 'AI/ML'], 'Some programming experience', 'Want to join TechClub to learn and grow', 'approved')
      ON CONFLICT (email) DO UPDATE SET status = 'approved';
    `

    // Execute the SQL script
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript })

    if (error) {
      console.error('Error setting up project applications:', error)
      return NextResponse.json(
        { error: 'Failed to set up project applications tables' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project applications tables set up successfully'
    })

  } catch (error) {
    console.error('Error in setup project applications API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
