"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function TestTablesPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const testTables = async () => {
    setLoading(true)
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setResult({ error: 'Not authenticated' })
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/test-tables', {
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
            <Database className="h-6 w-6" />
            Test Database Tables
          </CardTitle>
          <CardDescription>
            Check if all required database tables exist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={testTables} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Tables...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Test Tables
              </>
            )}
          </Button>

          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Table Status:</h3>
              
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
                    <h4 className="font-medium">User:</h4>
                    <pre className="bg-muted p-2 rounded text-sm">
                      {JSON.stringify(result.user, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium">Tables:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(result.tables || {}).map(([table, status]: [string, any]) => (
                        <div key={table} className="flex items-center gap-2 p-2 border rounded">
                          {status.exists ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-mono">{table}</span>
                          <span className="text-sm text-muted-foreground">
                            {status.exists ? '✅ Exists' : '❌ Missing'}
                          </span>
                          {!status.exists && status.error && (
                            <span className="text-xs text-red-500">({status.error})</span>
                          )}
                        </div>
                      ))}
                    </div>
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
