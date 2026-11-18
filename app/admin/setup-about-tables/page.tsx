"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function SetupAboutTablesPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const runSetup = async () => {
    setStatus('loading')
    setMessage('Setting up database tables for about page...')

    try {
      const response = await fetch('/api/admin/setup-database', {
        method: 'POST'
      })

      if (response.ok) {
        setStatus('success')
        setMessage('Database tables created successfully! The about page should now work properly.')
      } else {
        const errorData = await response.json()
        setStatus('error')
        setMessage(`Error: ${errorData.error || 'Failed to setup database'}`)
      }
    } catch (error) {
      setStatus('error')
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Setup About Page Database Tables</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This will create the necessary database tables (team_members and milestones) for the about page to function properly.
          </p>

          {status === 'idle' && (
            <Button onClick={runSetup} className="w-full">
              Run Database Setup
            </Button>
          )}

          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Setting up database...</span>
            </div>
          )}

          {status === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">What this does:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Creates team_members table with sample data</li>
              <li>• Creates milestones table with sample data</li>
              <li>• Sets up proper RLS policies</li>
              <li>• Enables the about page to display team and milestone information</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

