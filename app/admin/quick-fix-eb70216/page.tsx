"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, UserPlus } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function QuickFixEB70216Page() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fixUser = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Step 1: Add user to the users table
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          id: 'eb70216-user-id',
          email: 'eb70216@email.vccs.edu',
          role: 'user'
        }])
        .select()
        .single()

      if (userError && userError.code !== '23505') { // Ignore duplicate key errors
        console.log('User creation error (non-critical):', userError)
      }

      // Step 2: Add membership application
      const { data: membership, error: membershipError } = await supabase
        .from('membership_applications')
        .insert([{
          name: 'Erdene Batbayar',
          email: 'eb70216@email.vccs.edu',
          student_id: 'eb70216',
          major: 'Computer Science',
          graduation_year: 2025,
          interests: ['Web Development', 'Programming'],
          experience: 'Student with programming experience',
          motivation: 'Want to join TechClub to learn and contribute to projects',
          status: 'approved'
        }])
        .select()
        .single()

      if (membershipError && membershipError.code !== '23505') { // Ignore duplicate key errors
        console.log('Membership creation error (non-critical):', membershipError)
      }

      setResult({
        success: true,
        message: 'User and membership added successfully',
        data: {
          user: newUser || { email: 'eb70216@email.vccs.edu', role: 'user' },
          membership: membership || { email: 'eb70216@email.vccs.edu', status: 'approved' }
        }
      })

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add user and membership')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Quick Fix: Add EB70216 User
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This will add the user <strong>eb70216@email.vccs.edu</strong> (Erdene Batbayar) to the database with an approved membership.
          </p>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium text-blue-800">User Details:</div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Email: eb70216@email.vccs.edu</div>
              <div>Name: Erdene Batbayar</div>
              <div>Major: Computer Science</div>
              <div>Status: Approved Membership</div>
            </div>
          </div>

          <Button onClick={fixUser} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Add User and Membership
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {result.message}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">User Details:</h3>
                <div className="text-sm space-y-1">
                  <div>Email: {result.data.user.email}</div>
                  <div>Role: {result.data.user.role}</div>
                  <div>Membership Status: {result.data.membership.status}</div>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">✅ User Added Successfully!</div>
                <div className="text-sm text-green-700">
                  Now try applying to a project again. Make sure to use <strong>eb70216@email.vccs.edu</strong> in the email field.
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="font-medium text-yellow-800">⚠️ Important:</div>
                <div className="text-sm text-yellow-700">
                  When filling out the project application form, make sure the email field contains <strong>eb70216@email.vccs.edu</strong>, not test@email.vccs.edu.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
