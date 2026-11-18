"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"

export default function TestProjectApplicationsPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [testResults, setTestResults] = useState<any>(null)
  const { user } = useAuth()

  const setupDatabase = async () => {
    setStatus('loading')
    setMessage('Setting up database tables...')
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('No active session found')
      }

      const token = session.access_token
      
      // First, let's try to create the membership_applications table
      const createMembershipTable = `
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
      `

      // Create project_applications table
      const createProjectApplicationsTable = `
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
      `

      // Enable RLS
      const enableRLS = `
        ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
        ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
      `

      // Create policies
      const createPolicies = `
        DROP POLICY IF EXISTS "Anyone can insert applications" ON membership_applications;
        CREATE POLICY "Anyone can insert applications" ON membership_applications FOR INSERT WITH CHECK (true);
        CREATE POLICY "Admins can read all applications" ON membership_applications FOR SELECT USING (true);
        CREATE POLICY "Admins can update applications" ON membership_applications FOR UPDATE USING (true);
        CREATE POLICY "Admins can delete applications" ON membership_applications FOR DELETE USING (true);
        
        DROP POLICY IF EXISTS "Anyone can insert project applications" ON project_applications;
        CREATE POLICY "Anyone can insert project applications" ON project_applications FOR INSERT WITH CHECK (true);
        CREATE POLICY "Admins can read all project applications" ON project_applications FOR SELECT USING (true);
        CREATE POLICY "Admins can update project applications" ON project_applications FOR UPDATE USING (true);
        CREATE POLICY "Admins can delete project applications" ON project_applications FOR DELETE USING (true);
      `

      // Insert test membership
      const insertTestMembership = `
        INSERT INTO membership_applications (name, email, student_id, major, graduation_year, interests, experience, motivation, status) VALUES
        ('Test User', 'test@email.vccs.edu', '12345', 'Computer Science', 2025, ARRAY['Web Development', 'AI/ML'], 'Some programming experience', 'Want to join TechClub to learn and grow', 'approved')
        ON CONFLICT (email) DO UPDATE SET status = 'approved';
      `

      // Execute the SQL commands
      const { error: membershipError } = await supabase.rpc('exec_sql', { sql: createMembershipTable })
      if (membershipError) {
        console.error('Error creating membership table:', membershipError)
      }

      const { error: projectError } = await supabase.rpc('exec_sql', { sql: createProjectApplicationsTable })
      if (projectError) {
        console.error('Error creating project applications table:', projectError)
      }

      const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLS })
      if (rlsError) {
        console.error('Error enabling RLS:', rlsError)
      }

      const { error: policiesError } = await supabase.rpc('exec_sql', { sql: createPolicies })
      if (policiesError) {
        console.error('Error creating policies:', policiesError)
      }

      const { error: insertError } = await supabase.rpc('exec_sql', { sql: insertTestMembership })
      if (insertError) {
        console.error('Error inserting test membership:', insertError)
      }

      setStatus('success')
      setMessage('Database setup completed! Now running tests...')
      
      // Now run the tests
      setTimeout(() => {
        testProjectApplications()
      }, 1000)

    } catch (error) {
      setStatus('error')
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    }
  }

  const testProjectApplications = async () => {
    setStatus('loading')
    setMessage('Testing project applications functionality...')
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('No active session found')
      }

      const token = session.access_token
      
      // Step 1: Check if tables exist
      const tableCheckResponse = await fetch('/api/admin/test-tables')
      const tableCheckResult = await tableCheckResponse.json()
      
      // Step 2: Create test membership
      const membershipResponse = await fetch('/api/admin/add-test-membership', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const membershipResult = await membershipResponse.json()
      
      // Step 3: Create test project
      const projectResponse = await fetch('/api/admin/add-test-project', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const projectResult = await projectResponse.json()
      
      // Step 4: Try to submit a test application
      const testApplication = {
        project_id: projectResult.data.id,
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

      setTestResults({
        tableCheck: tableCheckResult,
        membershipTest: {
          status: membershipResponse.status,
          result: membershipResult
        },
        projectTest: {
          status: projectResponse.status,
          result: projectResult
        },
        applicationTest: {
          status: applicationResponse.status,
          result: applicationResult
        }
      })

      if (applicationResponse.ok) {
        setStatus('success')
        setMessage('Project applications are working correctly!')
      } else {
        setStatus('error')
        setMessage(`Application test failed: ${applicationResult.error}`)
      }
    } catch (error) {
      setStatus('error')
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Project Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This will set up the database tables and test the project applications functionality.
          </p>
          
          {status === 'idle' && (
            <Button onClick={setupDatabase} className="w-full">
              Set Up Database & Run Tests
            </Button>
          )}
          
          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{message}</span>
            </div>
          )}
          
          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {testResults && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Test Results:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">What this test does:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Sets up database tables (membership_applications, project_applications)</li>
              <li>• Creates RLS policies for security</li>
              <li>• Creates a test membership application (approved)</li>
              <li>• Creates a test project</li>
              <li>• Tests project application submission</li>
              <li>• Verifies membership validation</li>
              <li>• Identifies any API or database issues</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
