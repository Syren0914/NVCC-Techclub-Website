"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Search, User, Database, Shield } from "lucide-react"

interface UserCheckResult {
  success: boolean
  email: string
  auth: {
    exists: boolean
    user: any
    error: any
  }
  custom_users_table: {
    exists: boolean
    user: any
    error: any
  }
  membership_applications: {
    exists: boolean
    application: any
    error: any
  }
  project_applications: {
    count: number
    applications: any[]
    error: any
  }
  summary: {
    inAuth: boolean
    inCustomTable: boolean
    hasMembership: boolean
    membershipStatus: string
    projectApplicationsCount: number
  }
}

export default function CheckUserByEmailPage() {
  const [email, setEmail] = useState("test@email.vccs.edu")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UserCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkUser = async () => {
    if (!email) {
      setError("Please enter an email address")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/check-user-by-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
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

  const getStatusIcon = (exists: boolean) => {
    return exists ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusText = (exists: boolean) => {
    return exists ? "Found" : "Not Found"
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            Check User by Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                />
                <Button onClick={checkUser} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Check
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  User check completed for <strong>{result.email}</strong>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Auth Status */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4" />
                      Supabase Auth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.auth.exists)}
                      <span className="text-sm">{getStatusText(result.auth.exists)}</span>
                    </div>
                    {result.auth.user && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <div>ID: {result.auth.user.id}</div>
                        <div>Created: {new Date(result.auth.user.created_at).toLocaleDateString()}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Custom Users Table */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4" />
                      Custom Users Table
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.custom_users_table.exists)}
                      <span className="text-sm">{getStatusText(result.custom_users_table.exists)}</span>
                    </div>
                    {result.custom_users_table.user && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <div>Role: {result.custom_users_table.user.role}</div>
                        <div>ID: {result.custom_users_table.user.id}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Membership Applications */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      Membership Application
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.membership_applications.exists)}
                      <span className="text-sm">{getStatusText(result.membership_applications.exists)}</span>
                    </div>
                    {result.membership_applications.application && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <div>Status: {result.membership_applications.application.status}</div>
                        <div>Name: {result.membership_applications.application.name}</div>
                        <div>Major: {result.membership_applications.application.major}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Project Applications */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4" />
                      Project Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{result.project_applications.count} applications</span>
                    </div>
                    {result.project_applications.applications && result.project_applications.applications.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {result.project_applications.applications.map((app, index) => (
                          <div key={index}>
                            Status: {app.status} - {app.user_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">In Auth System</div>
                      <div className={result.summary.inAuth ? "text-green-600" : "text-red-600"}>
                        {result.summary.inAuth ? "Yes" : "No"}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">In Custom Table</div>
                      <div className={result.summary.inCustomTable ? "text-green-600" : "text-red-600"}>
                        {result.summary.inCustomTable ? "Yes" : "No"}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Has Membership</div>
                      <div className={result.summary.hasMembership ? "text-green-600" : "text-red-600"}>
                        {result.summary.hasMembership ? "Yes" : "No"}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Project Apps</div>
                      <div className="text-blue-600">
                        {result.summary.projectApplicationsCount}
                      </div>
                    </div>
                  </div>
                  
                  {result.summary.hasMembership && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="font-medium">Membership Status: {result.summary.membershipStatus}</div>
                      <div className="text-sm text-muted-foreground">
                        This user can apply to join projects
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
