"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, Clock, Users, Mail, Calendar } from "lucide-react"

interface ProjectApplication {
  id: string
  project_id: string
  user_email: string
  user_name: string
  user_major?: string
  user_year?: string
  motivation: string
  skills: string[]
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  created_at: string
  updated_at?: string
  projects: {
    id: string
    title: string
  }
}

export function ProjectApplicationsManager() {
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<ProjectApplication | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [processing, setProcessing] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      // Get the session to access the token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('No active session found')
        return
      }

      const token = session.access_token
      const response = await fetch('/api/admin/project-applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setApplications(result.data || [])
      } else {
        console.error('Failed to load applications')
      }
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId: string, status: 'approved' | 'rejected') => {
    setProcessing(true)
    try {
      // Get the session to access the token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('No active session found')
      }

      const token = session.access_token
      const response = await fetch('/api/admin/project-applications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          application_id: applicationId,
          status,
          admin_notes: adminNotes
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Application Updated",
          description: result.message,
        })
        loadApplications()
        setSelectedApplication(null)
        setAdminNotes("")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update application",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const approvedApplications = applications.filter(app => app.status === 'approved')
  const rejectedApplications = applications.filter(app => app.status === 'rejected')

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Applications</h2>
        <Button onClick={loadApplications} variant="outline">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="size-4" />
            Pending ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="size-4" />
            Approved ({approvedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="size-4" />
            Rejected ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No pending applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{application.user_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{application.user_email}</p>
                      </div>
                      <Badge variant="secondary">{application.projects.title}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Major:</span> {application.user_major || 'Not specified'}
                      </div>
                      <div>
                        <span className="font-medium">Year:</span> {application.user_year || 'Not specified'}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Motivation:</span>
                      <p className="text-sm text-muted-foreground mt-1">{application.motivation}</p>
                    </div>

                    {application.skills.length > 0 && (
                      <div>
                        <span className="font-medium">Skills:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {application.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-3" />
                      Applied on {new Date(application.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review Application</DialogTitle>
                            <DialogDescription>
                              Review and approve or reject this application
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Admin Notes (optional)</label>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add any notes about this application..."
                                rows={3}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleStatusUpdate(application.id, 'approved')}
                                disabled={processing}
                                className="flex-1"
                              >
                                <CheckCircle className="size-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                disabled={processing}
                                variant="destructive"
                                className="flex-1"
                              >
                                <XCircle className="size-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No approved applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {approvedApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{application.user_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{application.user_email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{application.projects.title}</Badge>
                        <Badge variant="default">Approved</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Approved on {application.updated_at ? new Date(application.updated_at).toLocaleDateString() : new Date(application.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No rejected applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rejectedApplications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{application.user_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{application.user_email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{application.projects.title}</Badge>
                        <Badge variant="destructive">Rejected</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Rejected on {application.updated_at ? new Date(application.updated_at).toLocaleDateString() : new Date(application.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

