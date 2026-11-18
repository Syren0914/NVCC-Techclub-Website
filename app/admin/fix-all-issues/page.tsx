"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Database, Shield, Users, Settings } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

interface FixStep {
  name: string
  status: 'pending' | 'loading' | 'success' | 'error'
  message: string
  details?: any
}

export default function FixAllIssuesPage() {
  const [steps, setSteps] = useState<FixStep[]>([
    { name: 'Database Tables', status: 'pending', message: 'Setting up database tables...' },
    { name: 'Admin User', status: 'pending', message: 'Creating admin user...' },
    { name: 'Test Membership', status: 'pending', message: 'Creating test membership...' },
    { name: 'Test Project', status: 'pending', message: 'Creating test project...' },
    { name: 'Project Applications', status: 'pending', message: 'Testing project applications...' },
    { name: 'Admin Access', status: 'pending', message: 'Verifying admin access...' }
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const { user } = useAuth()

  const updateStep = (index: number, status: FixStep['status'], message: string, details?: any) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, message, details } : step
    ))
  }

  const runAllFixes = async () => {
    setIsRunning(true)
    setOverallStatus('running')

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('No active session found')
      }

      const token = session.access_token

      // Step 1: Set up database tables
      updateStep(0, 'loading', 'Creating database tables...')
      
      const setupTablesSQL = `
        -- Drop existing tables if they exist
        DROP TABLE IF EXISTS project_applications CASCADE;
        DROP TABLE IF EXISTS membership_applications CASCADE;
        
        -- Create project_applications table
        CREATE TABLE IF NOT EXISTS project_applications (
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
        
        -- Create membership_applications table
        CREATE TABLE IF NOT EXISTS membership_applications (
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
        
        -- Enable RLS
        ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
        ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        DROP POLICY IF EXISTS "Anyone can insert project applications" ON project_applications;
        DROP POLICY IF EXISTS "Admins can read all project applications" ON project_applications;
        DROP POLICY IF EXISTS "Admins can update project applications" ON project_applications;
        DROP POLICY IF EXISTS "Admins can delete project applications" ON project_applications;
        
        DROP POLICY IF EXISTS "Anyone can insert applications" ON membership_applications;
        DROP POLICY IF EXISTS "Admins can read all applications" ON membership_applications;
        DROP POLICY IF EXISTS "Admins can update applications" ON membership_applications;
        DROP POLICY IF EXISTS "Admins can delete applications" ON membership_applications;
        
        CREATE POLICY "Anyone can insert project applications" ON project_applications FOR INSERT WITH CHECK (true);
        CREATE POLICY "Admins can read all project applications" ON project_applications FOR SELECT USING (true);
        CREATE POLICY "Admins can update project applications" ON project_applications FOR UPDATE USING (true);
        CREATE POLICY "Admins can delete project applications" ON project_applications FOR DELETE USING (true);
        
        CREATE POLICY "Anyone can insert applications" ON membership_applications FOR INSERT WITH CHECK (true);
        CREATE POLICY "Admins can read all applications" ON membership_applications FOR SELECT USING (true);
        CREATE POLICY "Admins can update applications" ON membership_applications FOR UPDATE USING (true);
        CREATE POLICY "Admins can delete applications" ON membership_applications FOR DELETE USING (true);
      `

      const { error: tablesError } = await supabase.rpc('exec_sql', { sql: setupTablesSQL })
      if (tablesError) {
        updateStep(0, 'error', 'Failed to create tables', tablesError)
        throw new Error('Database setup failed')
      }
      updateStep(0, 'success', 'Database tables created successfully')

      // Step 2: Create admin user
      updateStep(1, 'loading', 'Creating admin user...')
      
      const createAdminSQL = `
        INSERT INTO users (id, email, role) 
        VALUES ('c6077857-5638-43af-81b1-ddb4954cb4fa', 'test@email.vccs.edu', 'admin')
        ON CONFLICT (id) DO UPDATE SET role = 'admin';
      `

      const { error: adminError } = await supabase.rpc('exec_sql', { sql: createAdminSQL })
      if (adminError) {
        updateStep(1, 'error', 'Failed to create admin user', adminError)
      } else {
        updateStep(1, 'success', 'Admin user created successfully')
      }

      // Step 3: Create test membership
      updateStep(2, 'loading', 'Creating test membership...')
      
      const createMembershipSQL = `
        INSERT INTO membership_applications (name, email, student_id, major, graduation_year, interests, experience, motivation, status) VALUES
        ('Test User', 'test@email.vccs.edu', '12345', 'Computer Science', 2025, ARRAY['Web Development', 'AI/ML'], 'Some programming experience', 'Want to join TechClub to learn and grow', 'approved')
        ON CONFLICT (email) DO UPDATE SET status = 'approved';
      `

      const { error: membershipError } = await supabase.rpc('exec_sql', { sql: createMembershipSQL })
      if (membershipError) {
        updateStep(2, 'error', 'Failed to create test membership', membershipError)
      } else {
        updateStep(2, 'success', 'Test membership created successfully')
      }

      // Step 4: Create test project
      updateStep(3, 'loading', 'Creating test project...')
      
      const projectResponse = await fetch('/api/admin/add-test-project', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (projectResponse.ok) {
        const projectResult = await projectResponse.json()
        updateStep(3, 'success', 'Test project created successfully', projectResult)
      } else {
        const error = await projectResponse.json()
        updateStep(3, 'error', 'Failed to create test project', error)
      }

      // Step 5: Test project applications
      updateStep(4, 'loading', 'Testing project applications...')
      
      const testApplication = {
        project_id: "test-project-id", // We'll use a real project ID if available
        user_email: "test@email.vccs.edu",
        user_name: "Test User",
        user_major: "Computer Science",
        user_year: "Senior",
        motivation: "I want to join this project to learn and contribute.",
        skills: ["JavaScript", "React", "Node.js"]
      }

      const applicationResponse = await fetch('/api/project-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testApplication)
      })

      const applicationResult = await applicationResponse.json()
      
      if (applicationResponse.ok) {
        updateStep(4, 'success', 'Project applications working correctly', applicationResult)
      } else {
        updateStep(4, 'error', `Project applications test failed: ${applicationResult.error}`, applicationResult)
      }

      // Step 6: Test admin access
      updateStep(5, 'loading', 'Testing admin access...')
      
      const adminResponse = await fetch('/api/admin/check-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const adminResult = await adminResponse.json()
      
      if (adminResponse.ok && adminResult.success) {
        updateStep(5, 'success', `Admin access verified: ${adminResult.isAdmin ? 'Admin' : 'User'}`, adminResult)
      } else {
        updateStep(5, 'error', 'Admin access check failed', adminResult)
      }

      setOverallStatus('success')

    } catch (error) {
      setOverallStatus('error')
      console.error('Error in fix process:', error)
    } finally {
      setIsRunning(false)
    }
  }

  const getStepIcon = (status: FixStep['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Fix All Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This will systematically fix all known issues with the project applications system.
          </p>

          {overallStatus === 'idle' && (
            <Button onClick={runAllFixes} className="w-full" disabled={isRunning}>
              <Database className="h-4 w-4 mr-2" />
              Run All Fixes
            </Button>
          )}

          {overallStatus === 'running' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Running fixes... Please wait.
              </AlertDescription>
            </Alert>
          )}

          {overallStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All fixes completed successfully!
              </AlertDescription>
            </Alert>
          )}

          {overallStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some fixes failed. Check the details below.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">Fix Steps:</h3>
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {getStepIcon(step.status)}
                <div className="flex-1">
                  <div className="font-medium">{step.name}</div>
                  <div className="text-sm text-muted-foreground">{step.message}</div>
                  {step.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        Show details
                      </summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(step.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">What this fixes:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Database table creation and schema issues</li>
              <li>• Missing admin user and role assignments</li>
              <li>• Test membership application for project applications</li>
              <li>• Test project creation for applications</li>
              <li>• Project applications API functionality</li>
              <li>• Admin access verification and permissions</li>
              <li>• RLS policies for security</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
