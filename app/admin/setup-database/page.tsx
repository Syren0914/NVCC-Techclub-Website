"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function DatabaseSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testDatabaseSetup = async () => {
    setLoading(true)
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setResult({ success: false, error: 'Not authenticated' })
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/setup-database', {
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
            <Database className="h-6 w-6" />
            Database Setup
          </CardTitle>
          <CardDescription>
            Set up the database tables and permissions for the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Before running this setup, you need to manually run the SQL script in your Supabase dashboard.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to your <strong>Supabase Dashboard</strong></li>
              <li>Navigate to <strong>SQL Editor</strong></li>
              <li>Copy the contents of <code>setup-database.sql</code> file</li>
              <li>Paste and run the SQL script</li>
              <li>Come back here and click "Test Database Setup"</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SQL Script Location:</h3>
            <p className="text-sm text-muted-foreground">
              File: <code>setup-database.sql</code> in your project root
            </p>
          </div>

          <Button 
            onClick={testDatabaseSetup} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Database Setup...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Test Database Setup
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
              
              {result.tableStatus && (
                <div className="space-y-2">
                  <h4 className="font-medium">Table Status:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(result.tableStatus).map(([table, status]: [string, any]) => (
                      <div key={table} className="flex items-center gap-2">
                        {status.exists ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-mono">{table}</span>
                        {!status.exists && status.error && (
                          <span className="text-xs text-red-500">({status.error})</span>
                        )}
                      </div>
                    ))}
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
