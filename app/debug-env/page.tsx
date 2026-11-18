"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"

export default function DebugEnvPage() {
  const [envStatus, setEnvStatus] = useState<{
    clerkPublishable: boolean
    clerkSecret: boolean
    supabaseUrl: boolean
    supabaseAnon: boolean
    resendApi: boolean
  } | null>(null)

  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  const checkEnvironmentVariables = async () => {
    try {
      // Fetch environment variable status from server-side API
      const response = await fetch('/api/debug-env')
      const status = await response.json()
      setEnvStatus(status)
    } catch (error) {
      console.error('Error checking environment variables:', error)
      // Fallback to client-side check for public variables only
      const fallbackStatus = {
        clerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        clerkSecret: false, // Cannot check server-side variables on client
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        resendApi: false, // Cannot check server-side variables on client
      }
      setEnvStatus(fallbackStatus)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-500">Configured</Badge>
    ) : (
      <Badge variant="destructive">Missing</Badge>
    )
  }

  if (!envStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking environment variables...</p>
        </div>
      </div>
    )
  }

  const allConfigured = Object.values(envStatus).every(Boolean)
  const criticalMissing = !envStatus.clerkPublishable || !envStatus.clerkSecret

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Environment Variables Debug</h1>
              <p className="text-muted-foreground">
                Check if your environment variables are properly configured
              </p>
            </div>
            <Button onClick={checkEnvironmentVariables} variant="outline">
              Refresh Status
            </Button>
          </div>
        </div>

        {criticalMissing && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Critical Issue:</strong> Clerk authentication keys are missing. 
              This will prevent authentication from working properly.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Environment Variables Status
            </CardTitle>
            <CardDescription>
              Check if all required environment variables are configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Clerk Variables */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">🔐 Clerk Authentication</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(envStatus.clerkPublishable)}
                    <span className="font-medium">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</span>
                  </div>
                  {getStatusBadge(envStatus.clerkPublishable)}
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(envStatus.clerkSecret)}
                    <span className="font-medium">CLERK_SECRET_KEY</span>
                  </div>
                  {getStatusBadge(envStatus.clerkSecret)}
                </div>
              </div>
            </div>

            {/* Supabase Variables */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">🗄️ Supabase Database</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(envStatus.supabaseUrl)}
                    <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
                  </div>
                  {getStatusBadge(envStatus.supabaseUrl)}
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(envStatus.supabaseAnon)}
                    <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                  </div>
                  {getStatusBadge(envStatus.supabaseAnon)}
                </div>
              </div>
            </div>

            {/* Resend Variables */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">📧 Email Service (Resend)</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(envStatus.resendApi)}
                    <span className="font-medium">RESEND_API_KEY</span>
                  </div>
                  {getStatusBadge(envStatus.resendApi)}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {allConfigured ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>
                    {allConfigured 
                      ? "All environment variables are configured" 
                      : "Some environment variables are missing"
                    }
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {criticalMissing 
                    ? "Clerk authentication will not work without the required keys"
                    : "Application should work properly"
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Fix Missing Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Create/Update .env.local</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Create a `.env.local` file in your project root with these variables:
                </p>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend Email
RESEND_API_KEY=re_your_resend_key_here`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Get Your Keys</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Clerk:</strong> Go to <a href="https://dashboard.clerk.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Clerk Dashboard</a> → API Keys</li>
                  <li>• <strong>Supabase:</strong> Go to your Supabase project → Settings → API</li>
                  <li>• <strong>Resend:</strong> Go to <a href="https://resend.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Resend Dashboard</a> → API Keys</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Restart Server</h4>
                <p className="text-sm text-muted-foreground">
                  After updating your `.env.local` file, restart your development server:
                </p>
                <code className="bg-muted px-2 py-1 rounded text-xs">npm run dev</code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 