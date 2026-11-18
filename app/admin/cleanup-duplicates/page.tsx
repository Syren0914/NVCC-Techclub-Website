"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Trash2, Database } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function CleanupDuplicatesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const cleanupDuplicates = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // First, get all membership applications for test@email.vccs.edu
      const { data: memberships, error: fetchError } = await supabase
        .from('membership_applications')
        .select('*')
        .eq('email', 'test@email.vccs.edu')

      if (fetchError) {
        throw new Error(`Failed to fetch memberships: ${fetchError.message}`)
      }

      if (!memberships || memberships.length === 0) {
        setResult({
          success: true,
          message: 'No membership applications found to clean up',
          data: { count: 0 }
        })
        return
      }

      // Find the most recent approved membership
      const approvedMemberships = memberships.filter(m => m.status === 'approved')
      const mostRecentApproved = approvedMemberships.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]

      if (!mostRecentApproved) {
        throw new Error('No approved membership found')
      }

      // Delete all other membership applications
      const idsToDelete = memberships
        .filter(m => m.id !== mostRecentApproved.id)
        .map(m => m.id)

      if (idsToDelete.length === 0) {
        setResult({
          success: true,
          message: 'No duplicates found to clean up',
          data: { count: 0 }
        })
        return
      }

      const { error: deleteError } = await supabase
        .from('membership_applications')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        throw new Error(`Failed to delete duplicates: ${deleteError.message}`)
      }

      setResult({
        success: true,
        message: `Successfully cleaned up ${idsToDelete.length} duplicate membership applications`,
        data: {
          deletedCount: idsToDelete.length,
          keptMembership: mostRecentApproved
        }
      })

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cleanup duplicates')
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
            <Trash2 className="h-6 w-6" />
            Cleanup Duplicate Memberships
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This will remove duplicate membership applications for test@email.vccs.edu, keeping only the most recent approved one.
          </p>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="font-medium text-yellow-800">⚠️ Warning</div>
            <div className="text-sm text-yellow-700">
              This will permanently delete duplicate membership applications. Make sure you want to do this!
            </div>
          </div>

          <Button onClick={cleanupDuplicates} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Cleanup Duplicates
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

              {result.data.deletedCount > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Cleanup Results:</h3>
                  <div className="text-sm space-y-1">
                    <div>Deleted: {result.data.deletedCount} duplicate applications</div>
                    <div>Kept: 1 approved application</div>
                    <div>Email: {result.data.keptMembership.email}</div>
                    <div>Status: {result.data.keptMembership.status}</div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">✅ Cleanup Complete!</div>
                <div className="text-sm text-green-700">
                  Now check the user again at 
                  <a href="/admin/check-user-by-email" className="text-blue-600 underline ml-1">
                    /admin/check-user-by-email
                  </a>
                  - it should show "Has Membership: Yes"
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
