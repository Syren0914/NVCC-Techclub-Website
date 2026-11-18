"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, CheckCircle, XCircle } from "lucide-react"

export default function TestEmailPage() {
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const sendTestEmail = async () => {
    if (!testEmail) {
      setResult({
        success: false,
        message: 'Please enter an email address'
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log('Sending test email to:', testEmail)
      
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail }),
      })

      console.log('Test email API response status:', response.status)
      
      const data = await response.json()
      console.log('Test email API response data:', data)

      if (response.ok) {
        setResult({
          success: true,
          message: 'Test email sent successfully! Check your inbox.',
          details: data
        })
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send test email',
          details: data.details
        })
      }
    } catch (err) {
      console.error('Error sending test email:', err)
      setResult({
        success: false,
        message: 'Network error occurred',
        details: err
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email System Test</h1>
          <p className="text-muted-foreground">
            Test the email functionality to ensure Resend is properly configured
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
            <CardDescription>
              Enter an email address to test the email system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testEmail">Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="test@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <Button 
              onClick={sendTestEmail} 
              disabled={loading || !testEmail}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Test Email...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>

            {result && (
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <div className="font-medium">{result.message}</div>
                  {result.details && (
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer">View Details</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>
              Common issues and solutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Check Environment Variables</h3>
              <p className="text-sm text-muted-foreground">
                Make sure <code>RESEND_API_KEY</code> is set in your <code>.env.local</code> file
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">2. Verify Resend Account</h3>
              <p className="text-sm text-muted-foreground">
                Ensure your Resend account is active and you have a valid API key
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">3. Check Domain Verification</h3>
              <p className="text-sm text-muted-foreground">
                For production, verify your domain in Resend dashboard
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">4. Review Console Logs</h3>
              <p className="text-sm text-muted-foreground">
                Check browser console and server logs for detailed error messages
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 