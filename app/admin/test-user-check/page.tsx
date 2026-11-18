"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, TestTube } from "lucide-react"

export default function TestUserCheckPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testUserCheck = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/check-user-by-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@email.vccs.edu' })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to check user')
      }
    } catch (error) {
      setError('Failed to check user')
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
            <TestTube className="h-6 w-6" />
            Test User Check API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This will test the user check API with the test email.
          </p>

          <Button onClick={testUserCheck} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            Test User Check
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
                  API test completed successfully!
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">Results:</h3>
                <div className="text-sm space-y-1">
                  <div>Email: {result.email}</div>
                  <div>In Auth: {result.summary.inAuth ? 'Yes' : 'No'}</div>
                  <div>In Custom Table: {result.summary.inCustomTable ? 'Yes' : 'No'}</div>
                  <div>Has Membership: {result.summary.hasMembership ? 'Yes' : 'No'}</div>
                  <div>Membership Status: {result.summary.membershipStatus}</div>
                  <div>Project Applications: {result.summary.projectApplicationsCount}</div>
                </div>
              </div>

              <details className="mt-4">
                <summary className="text-sm font-medium cursor-pointer">
                  Show Full Response
                </summary>
                <pre className="text-xs bg-muted p-4 rounded mt-2 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
