"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, UserPlus, Database } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AddUserMembershipPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState({
    email: 'eb70216@email.vccs.edu',
    name: 'Erdene Batbayar',
    major: 'Computer Science',
    graduation_year: 2025,
    student_id: 'eb70216'
  })

  const addUserAndMembership = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Step 1: Add user to the users table
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          id: 'eb70216-user-id', // Generate a unique ID
          email: userData.email,
          role: 'user'
        }])
        .select()
        .single()

      if (userError && userError.code !== '23505') { // Ignore duplicate key errors
        throw new Error(`Failed to create user: ${userError.message}`)
      }

      // Step 2: Add membership application
      const { data: membership, error: membershipError } = await supabase
        .from('membership_applications')
        .insert([{
          name: userData.name,
          email: userData.email,
          student_id: userData.student_id,
          major: userData.major,
          graduation_year: userData.graduation_year,
          interests: ['Web Development', 'Programming'],
          experience: 'Student with programming experience',
          motivation: 'Want to join TechClub to learn and contribute to projects',
          status: 'approved'
        }])
        .select()
        .single()

      if (membershipError && membershipError.code !== '23505') { // Ignore duplicate key errors
        throw new Error(`Failed to create membership: ${membershipError.message}`)
      }

      setResult({
        success: true,
        message: 'User and membership added successfully',
        data: {
          user: newUser || { email: userData.email, role: 'user' },
          membership: membership || { email: userData.email, status: 'approved' }
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
            Add User and Membership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This will add a new user and their approved membership to the database.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={userData.name}
                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="major">Major</Label>
              <Input
                id="major"
                type="text"
                value={userData.major}
                onChange={(e) => setUserData(prev => ({ ...prev, major: e.target.value }))}
                placeholder="Enter major"
              />
            </div>

            <div>
              <Label htmlFor="graduation_year">Graduation Year</Label>
              <Input
                id="graduation_year"
                type="number"
                value={userData.graduation_year}
                onChange={(e) => setUserData(prev => ({ ...prev, graduation_year: parseInt(e.target.value) }))}
                placeholder="Enter graduation year"
              />
            </div>

            <div>
              <Label htmlFor="student_id">Student ID</Label>
              <Input
                id="student_id"
                type="text"
                value={userData.student_id}
                onChange={(e) => setUserData(prev => ({ ...prev, student_id: e.target.value }))}
                placeholder="Enter student ID"
              />
            </div>
          </div>

          <Button onClick={addUserAndMembership} disabled={loading} className="w-full">
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
                  Now check the user at 
                  <a href="/admin/check-user-by-email" className="text-blue-600 underline ml-1">
                    /admin/check-user-by-email
                  </a>
                  - they should be able to apply to projects now.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
