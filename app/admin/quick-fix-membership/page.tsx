"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, UserPlus } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function QuickFixMembershipPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fixMembership = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Create the missing membership application
      const { data: membership, error: membershipError } = await supabase
        .from('membership_applications')
        .insert([{
          name: 'Test User',
          email: 'test@email.vccs.edu',
          student_id: '12345',
          major: 'Computer Science',
          graduation_year: 2025,
          interests: ['Web Development', 'AI/ML'],
          experience: 'Some programming experience',
          motivation: 'Want to join TechClub to learn and grow',
          status: 'approved'
        }])
        .select()
        .single()

      if (membershipError) {
        // If it's a duplicate key error, try to update instead
        if (membershipError.code === '23505') {
          const { data: updatedMembership, error: updateError } = await supabase
            .from('membership_applications')
            .update({
              status: 'approved',
              updated_at: new Date().toISOString()
            })
            .eq('email', 'test@email.vccs.edu')
            .select()
            .single()

          if (updateError) {
            throw new Error(`Failed to update membership: ${updateError.message}`)
          }

          setResult({
            success: true,
            message: 'Membership updated successfully',
            data: updatedMembership
          })
        } else {
          throw new Error(`Failed to create membership: ${membershipError.message}`)
        }
      } else {
        setResult({
          success: true,
          message: 'Membership created successfully',
          data: membership
        })
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fix membership')
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
            Quick Fix: Add Missing Membership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This will add the missing membership application for test@email.vccs.edu so they can apply to projects.
          </p>

          <Button onClick={fixMembership} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Fix Membership
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
                <h3 className="font-semibold">Membership Details:</h3>
                <div className="text-sm space-y-1">
                  <div>Name: {result.data.name}</div>
                  <div>Email: {result.data.email}</div>
                  <div>Status: {result.data.status}</div>
                  <div>Major: {result.data.major}</div>
                  <div>Graduation Year: {result.data.graduation_year}</div>
                </div>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">✅ Fixed!</div>
                <div className="text-sm text-green-700">
                  The user can now apply to join projects. Try checking the user again at 
                  <a href="/admin/check-user-by-email" className="text-blue-600 underline ml-1">
                    /admin/check-user-by-email
                  </a>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
