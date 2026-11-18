"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function DebugUserPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const debugUser = async () => {
    setLoading(true)
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setResult({ error: 'Not authenticated' })
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/debug-user', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error.message })
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Debug User
          </CardTitle>
          <CardDescription>
            Check what user ID is being used and what users exist in the database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={debugUser} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Debugging User...
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Debug User
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Debug Result:</h3>
              
              {result.error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.error}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Current User (from Supabase Auth):</h4>
                    <pre className="bg-muted p-2 rounded text-sm">
                      {JSON.stringify(result.currentUser, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium">Current User in Database:</h4>
                    {result.currentUserInDatabase ? (
                      <pre className="bg-green-100 p-2 rounded text-sm">
                        {JSON.stringify(result.currentUserInDatabase, null, 2)}
                      </pre>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          User not found in database. Error: {result.currentUserError?.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium">All Users in Database:</h4>
                    <pre className="bg-muted p-2 rounded text-sm">
                      {JSON.stringify(result.allUsers, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
