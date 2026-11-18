"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, User, Shield, Database } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function CheckUserPage() {
  const [loading, setLoading] = useState(false)
  const [userStatus, setUserStatus] = useState<any>(null)

  const checkUserStatus = async () => {
    setLoading(true)
    setUserStatus(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setUserStatus({
          authenticated: false,
          error: 'No active session'
        })
        return
      }

      const response = await fetch('/api/admin/check-user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      setUserStatus(data)
    } catch (error) {
      setUserStatus({
        error: 'Network error',
        details: error
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkUserStatus()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Status Check
          </CardTitle>
          <CardDescription>
            Check your authentication and admin status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={checkUserStatus} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Check User Status
          </Button>

          {userStatus && (
            <div className="space-y-4">
              <Alert className={userStatus.authenticated ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {userStatus.authenticated ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={userStatus.authenticated ? "text-green-800" : "text-red-800"}>
                  <strong>Authentication:</strong> {userStatus.authenticated ? '✅ Authenticated' : '❌ Not authenticated'}
                </AlertDescription>
              </Alert>

              {userStatus.authenticated && userStatus.user && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span><strong>User ID:</strong> {userStatus.user.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span><strong>Email:</strong> {userStatus.user.email}</span>
                  </div>
                </div>
              )}

              {userStatus.inDatabase !== undefined && (
                <Alert className={userStatus.inDatabase ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                  <Database className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Database Status:</strong> {userStatus.inDatabase ? '✅ User found in database' : '⚠️ User not found in database'}
                  </AlertDescription>
                </Alert>
              )}

              {userStatus.isAdmin !== undefined && (
                <Alert className={userStatus.isAdmin ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <Shield className="h-4 w-4 text-green-600" />
                  <AlertDescription className={userStatus.isAdmin ? "text-green-800" : "text-red-800"}>
                    <strong>Admin Status:</strong> {userStatus.isAdmin ? '✅ Admin privileges' : '❌ No admin privileges'}
                  </AlertDescription>
                </Alert>
              )}

              {userStatus.error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>Error:</strong> {userStatus.error}
                  </AlertDescription>
                </Alert>
              )}

              {!userStatus.isAdmin && userStatus.authenticated && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                    <li>Go to <a href="/admin/setup" className="underline">Admin Setup</a> to set up admin privileges</li>
                    <li>Or run the database setup script in Supabase</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
