"use client"

import { useState, useEffect } from "react"
import { AdminProtection } from "@/components/admin-protection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Eye, CheckCircle, XCircle, Clock, Mail, Phone, Github, Linkedin, Calendar, User, BookOpen, Target, GraduationCap, Check, X, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface MembershipApplication {
  id: string
  first_name: string
  last_name: string
  email: string
  major: string
  areas_of_interest: string
  technical_experience_level: string
  goals?: string
  github_username?: string
  linkedin_url?: string
  phone?: string
  graduation_year?: string
  preferred_contact_method?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

function ApplicationsContent() {
  const [applications, setApplications] = useState<MembershipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<MembershipApplication | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])
  const router = useRouter()

  const fetchApplications = async () => {
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Authentication required. Please sign in.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/applications', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      } else {
        setError('Failed to fetch applications')
      }
    } catch (err) {
      setError('Error loading applications')
      console.error('Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    setUpdatingStatus(applicationId)
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Authentication required. Please sign in.')
        setUpdatingStatus(null)
        return
      }

      const response = await fetch(`/api/admin/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Update the local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        )
        
        // If approved, send congratulatory email
        if (newStatus === 'approved') {
          await sendApprovalEmail(applicationId)
        }
      } else {
        setError('Failed to update status')
      }
    } catch (err) {
      setError('Error updating status')
      console.error('Error updating status:', err)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const sendApprovalEmail = async (applicationId: string) => {
    setSendingEmail(true)
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Authentication required. Please sign in.')
        setSendingEmail(false)
        return
      }

      console.log('Attempting to send approval email for application ID:', applicationId)
      
      const response = await fetch('/api/admin/send-approval-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ applicationId }),
      })

      console.log('Email API response status:', response.status)
      console.log('Email API response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to send approval email. Status:', response.status)
        console.error('Error response:', errorText)
        
        try {
          const errorJson = JSON.parse(errorText)
          console.error('Parsed error JSON:', errorJson)
        } catch (parseError) {
          console.error('Could not parse error response as JSON:', parseError)
        }
      } else {
        const successData = await response.json()
        console.log('Email sent successfully:', successData)
      }
    } catch (err) {
      console.error('Error sending approval email:', err)
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : 'Unknown'
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const handleViewApplication = (application: MembershipApplication) => {
    setSelectedApplication(application)
    setIsDialogOpen(true)
  }

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'advanced':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading applications...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Membership Applications</h1>
          <p className="text-muted-foreground">
            Review and manage membership applications
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Applications ({applications.length})</CardTitle>
            <CardDescription>
              All submitted membership applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/import-csv")}
            >
              Import CSV Members
            </Button>
          </CardContent>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No applications found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Major</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {application.first_name} {application.last_name}
                          </div>
                          {application.github_username && (
                            <div className="text-sm text-muted-foreground">
                              GitHub: {application.github_username}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{application.email}</TableCell>
                      <TableCell>{application.major}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getExperienceLevelColor(application.technical_experience_level)}>
                          {application.technical_experience_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(application.status)}
                          {getStatusBadge(application.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(application.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewApplication(application)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          
                          {application.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => updateApplicationStatus(application.id, 'approved')}
                                disabled={updatingStatus === application.id}
                              >
                                {updatingStatus === application.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                disabled={updatingStatus === application.id}
                              >
                                {updatingStatus === application.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Application Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedApplication && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedApplication.first_name} {selectedApplication.last_name}
                  </DialogTitle>
                  <DialogDescription>
                    Application submitted on {new Date(selectedApplication.created_at).toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Status Management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedApplication.status)}
                        {getStatusBadge(selectedApplication.status)}
                      </div>
                      
                      {selectedApplication.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              updateApplicationStatus(selectedApplication.id, 'approved')
                              setIsDialogOpen(false)
                            }}
                            disabled={updatingStatus === selectedApplication.id}
                          >
                            {updatingStatus === selectedApplication.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              updateApplicationStatus(selectedApplication.id, 'rejected')
                              setIsDialogOpen(false)
                            }}
                            disabled={updatingStatus === selectedApplication.id}
                          >
                            {updatingStatus === selectedApplication.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <X className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-sm">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {selectedApplication.email}
                        </p>
                      </div>
                      {selectedApplication.phone && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {selectedApplication.phone}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Preferred Contact</label>
                        <p className="text-sm capitalize">{selectedApplication.preferred_contact_method || 'email'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Academic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Academic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Major</label>
                        <p className="text-sm">{selectedApplication.major}</p>
                      </div>
                      {selectedApplication.graduation_year && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Graduation Year</label>
                          <p className="text-sm flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {selectedApplication.graduation_year}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Technical Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Technical Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Experience Level</label>
                        <Badge className={getExperienceLevelColor(selectedApplication.technical_experience_level)}>
                          {selectedApplication.technical_experience_level}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Areas of Interest</label>
                        <p className="text-sm">{selectedApplication.areas_of_interest}</p>
                      </div>
                      {selectedApplication.goals && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Goals</label>
                          <p className="text-sm">{selectedApplication.goals}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Social Links */}
                  {(selectedApplication.github_username || selectedApplication.linkedin_url) && (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Social Links</h3>
                        <div className="space-y-2">
                          {selectedApplication.github_username && (
                            <div className="flex items-center gap-2">
                              <Github className="h-4 w-4" />
                              <span className="text-sm">{selectedApplication.github_username}</span>
                            </div>
                          )}
                          {selectedApplication.linkedin_url && (
                            <div className="flex items-center gap-2">
                              <Linkedin className="h-4 w-4" />
                              <a 
                                href={selectedApplication.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Application Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Applied on {new Date(selectedApplication.created_at).toLocaleString()}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  return (
    <AdminProtection>
      <ApplicationsContent />
    </AdminProtection>
  )
} 