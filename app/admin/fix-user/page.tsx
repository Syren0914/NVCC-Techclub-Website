"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function FixUserPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const fixUser = async () => {
    setLoading(true)
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setResult({ success: false, error: 'Not authenticated' })
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/setup-user-complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message })
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Fix User Database
          </CardTitle>
          <CardDescription>
            Add the current user to the database with admin role
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will add your current user account to the database with admin privileges.
            </AlertDescription>
          </Alert>

          <Button 
            onClick={fixUser} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding User to Database...
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Add User to Database
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Result:</h3>
              {result.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.message}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {result.error}
                  </AlertDescription>
                </Alert>
              )}
              
              {result.user && (
                <div>
                  <h4 className="font-medium">User Details:</h4>
                  <pre className="bg-green-100 p-2 rounded text-sm">
                    {JSON.stringify(result.user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
