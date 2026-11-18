"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Database, FileText } from "lucide-react"

export default function DatabaseSetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSetup = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setResult({ success: response.ok, data })
    } catch (error) {
      setResult({ success: false, data: { error: 'Network error' } })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Setup
          </CardTitle>
          <CardDescription>
            Set up the database tables and sample data for the TechClub application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Go to your Supabase dashboard</li>
              <li>Open the SQL Editor</li>
              <li>Copy and paste the contents of <code className="bg-muted px-1 rounded">setup-database.sql</code></li>
              <li>Click "Run" to execute the script</li>
              <li>Come back here and click "Test Database Setup"</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">SQL Script Content:</h3>
            <div className="bg-muted p-4 rounded-lg text-sm font-mono max-h-60 overflow-y-auto">
              <FileText className="h-4 w-4 mb-2" />
              <p>-- Step 1: Create users table</p>
              <p>CREATE TABLE IF NOT EXISTS users (...);</p>
              <p>-- Step 2: Create events table</p>
              <p>CREATE TABLE IF NOT EXISTS events (...);</p>
              <p>-- Step 3: Create projects table</p>
              <p>CREATE TABLE IF NOT EXISTS projects (...);</p>
              <p>-- Step 4: Create resources table</p>
              <p>CREATE TABLE IF NOT EXISTS resources (...);</p>
              <p>-- Step 5: Create membership_applications table</p>
              <p>CREATE TABLE IF NOT EXISTS membership_applications (...);</p>
              <p>-- Step 6: Insert sample data</p>
              <p>INSERT INTO membership_applications (...);</p>
              <p>-- Step 7-9: Enable RLS and create policies</p>
              <p>ALTER TABLE users ENABLE ROW LEVEL SECURITY;</p>
              <p>CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);</p>
              <p>-- ... and more policies</p>
            </div>
          </div>
          
          <Button 
            onClick={handleSetup} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Test Database Setup
          </Button>

          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                {result.success ? result.data.message : result.data.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
