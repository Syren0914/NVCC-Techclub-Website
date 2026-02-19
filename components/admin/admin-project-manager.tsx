"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Plus, Edit, Trash2, Github, ExternalLink, Eye, Code, Users, CheckCircle, XCircle, Clock, Shield } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  github_url?: string
  live_url?: string
  image_url?: string
  status: string
  team_members: string[]
  created_at: string
}

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
}

export default function AdminProjectManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    github_url: "",
    live_url: "",
    image_url: "",
    status: "active",
    team_members: ""
  })
  const [submitting, setSubmitting] = useState(false)
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isApplicationsDialogOpen, setIsApplicationsDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [processingApplication, setProcessingApplication] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/projects', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setProjects(result.data)
        } else {
          setProjects([])
        }
      } else {
        setError('Failed to fetch projects')
      }
    } catch (err) {
      setError('Error loading projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Authentication required')
        setSubmitting(false)
        return
      }

      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
          team_members: formData.team_members.split(',').map(member => member.trim()).filter(member => member)
        })
      })

      if (response.ok) {
        const newProject = await response.json()
        setProjects(prev => [newProject, ...prev])
        toast({
          title: "Success",
          description: "Project created successfully",
        })
        handleCloseDialog()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create project')
      }
    } catch (err) {
      setError('Error creating project')
      console.error('Error creating project:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(', '),
      github_url: project.github_url || "",
      live_url: project.live_url || "",
      image_url: project.image_url || "",
      status: project.status,
      team_members: project.team_members.join(', ')
    })
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsEditing(false)
    setEditingProject(null)
    setFormData({
      title: "",
      description: "",
      technologies: "",
      github_url: "",
      live_url: "",
      image_url: "",
      status: "active",
      team_members: ""
    })
  }

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const loadProjectApplications = async (projectId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/admin/project-applications', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Filter applications for this specific project
          const projectApplications = result.data.filter((app: ProjectApplication) => app.project_id === projectId)
          setApplications(projectApplications)
        } else {
          setApplications([])
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load applications",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading applications:', error)
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      })
    }
  }

  const handleViewApplications = async (project: Project) => {
    setSelectedProject(project)
    setIsApplicationsDialogOpen(true)
    await loadProjectApplications(project.id)
  }

  const handleApplicationStatusUpdate = async (applicationId: string, status: 'approved' | 'rejected') => {
    setProcessingApplication(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No active session found')
      }

      const response = await fetch('/api/admin/project-applications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
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
        
        // Reload applications for this project
        if (selectedProject) {
          await loadProjectApplications(selectedProject.id)
        }
        
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
      setProcessingApplication(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-12 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-outfit tracking-tight text-white mb-1">Ventures Portfolio</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Club Research & Development Initiatives</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-white text-black font-bold text-[11px] uppercase tracking-[0.1em] rounded-xl h-11 px-8 hover:bg-slate-200 transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Initialize Venture
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-[#0d0d0d] border-white/10 p-12 rounded-[2.5rem] shadow-3xl">
            <DialogHeader className="mb-10">
              <DialogTitle className="text-2xl font-bold font-outfit tracking-tight text-white uppercase tracking-[0.1em]">
                {isEditing ? "Modify Venture" : "Initialize Venture"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] mt-2">
                {isEditing ? "Adjusting mission parameters for project deployment" : "Defining new venture parameters for club R&D pipeline"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Designation</label>
                  <Input
                    className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5 placeholder:text-slate-700"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Project identifier"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Lifecycle State</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10 rounded-xl">
                      <SelectItem value="active" className="text-sm">Active Deployment</SelectItem>
                      <SelectItem value="completed" className="text-sm">Manifest Completed</SelectItem>
                      <SelectItem value="on-hold" className="text-sm">Protocol On-Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Mission briefing</label>
                <Textarea
                  className="bg-white/[0.03] border-white/10 rounded-2xl min-h-[140px] text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all p-5 placeholder:text-slate-700"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Full scope and objectives of the venture"
                  required
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Tech Stack Architecture (comma-separated)</label>
                <Input
                  className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5 placeholder:text-slate-700"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="React, Primordial-AI, Neural-Core..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Source Repository</label>
                  <Input
                    className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5 placeholder:text-slate-700"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/source..."
                    type="url"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Deployment Endpoint</label>
                  <Input
                    className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5 placeholder:text-slate-700"
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                    placeholder="https://nexus.live..."
                    type="url"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Team Aggregation (comma-separated)</label>
                <Input
                  className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5 placeholder:text-slate-700"
                  value={formData.team_members}
                  onChange={(e) => setFormData({ ...formData, team_members: e.target.value })}
                  placeholder="Operator IDs/Names"
                />
              </div>
              
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                label="Venture Interface Visual"
                placeholder="Interface snapshot URL or upload"
              />
              
              <div className="flex justify-end gap-4 pt-10 border-t border-white/5">
                <Button type="button" variant="ghost" className="text-[11px] font-bold uppercase tracking-[0.1em] h-12 px-8 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all" onClick={handleCloseDialog}>
                  Terminate
                </Button>
                <Button type="submit" disabled={submitting} className="bg-white text-black font-bold text-[11px] uppercase tracking-[0.1em] rounded-xl h-12 px-10 hover:bg-slate-200 shadow-lg transition-all">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? "Update Venture" : "Initialize Manifest"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert className="bg-red-500/5 border-red-500/10 rounded-2xl border-l-4 border-l-red-500">
          <AlertDescription className="text-[11px] font-bold uppercase tracking-widest text-red-500">Critical Error: {error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-3xl">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20 px-10">Venture Payload</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20">Architecture</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20">Lifecycle</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20">Personnel</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20">Interfaces</TableHead>
              <TableHead className="text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20 px-10">Tactical</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects && projects.length > 0 ? projects.map((project) => (
              <TableRow key={project.id} className="border-white/5 hover:bg-white/[0.03] transition-all group h-28">
                <TableCell className="px-10">
                  <div>
                    <h4 className="font-bold text-slate-100 text-base font-outfit tracking-tight">{project.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 max-w-md line-clamp-1 font-medium leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <Badge key={index} variant="outline" className="text-[9px] font-bold uppercase tracking-[0.1em] bg-white/5 border-white/10 rounded-lg px-2.5 py-0.5">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-[0.1em] bg-white/5 border-white/10 rounded-lg px-2.5 py-0.5">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getProjectStatusColor(project.status).replace('bg-green-100 text-green-800', 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20')} border-[0.5px] text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-lg`}>
                    {project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-slate-300 font-outfit">
                      {project.team_members.slice(0, 2).join(', ')}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      {project.team_members.length > 2 ? `+ ${project.team_members.length - 2} OPERATORS` : 'OPERATORS'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {project.github_url && (
                      <Button variant="ghost" size="sm" className="size-10 p-0 rounded-xl bg-white/5 border border-white/5 hover:bg-white hover:text-black transition-all duration-300" asChild>
                        <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4.5 w-4.5" />
                        </a>
                      </Button>
                    )}
                    {project.live_url && (
                      <Button variant="ghost" size="sm" className="size-10 p-0 rounded-xl bg-white/5 border border-white/5 hover:bg-white hover:text-black transition-all duration-300" asChild>
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4.5 w-4.5" />
                        </a>
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-10 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Button 
                      variant="ghost" 
                      className="size-11 p-0 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white hover:text-black transition-all duration-300"
                      onClick={() => handleViewApplications(project)}
                    >
                      <Users className="size-4.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="size-11 p-0 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white hover:text-black transition-all duration-300"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="size-4.5" />
                    </Button>
                    <Button variant="ghost" className="size-11 p-0 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all duration-300">
                      <Trash2 className="size-4.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : null}
          </TableBody>
        </Table>
      </div>

      {/* Applications Dialog */}
      <Dialog open={isApplicationsDialogOpen} onOpenChange={setIsApplicationsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Project Applications - {selectedProject?.title}
            </DialogTitle>
            <DialogDescription>
              Review and manage applications for this project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No applications found for this project
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Card key={application.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{application.user_name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{application.user_email}</p>
                        </div>
                        <Badge 
                          variant={
                            application.status === 'approved' ? 'default' : 
                            application.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {application.status}
                        </Badge>
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
                        <Clock className="size-3" />
                        Applied on {new Date(application.created_at).toLocaleDateString()}
                      </div>

                      {application.status === 'pending' && (
                        <div className="space-y-3 pt-4 border-t">
                          <div>
                            <label className="text-sm font-medium">Admin Notes (optional)</label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add any notes about this application..."
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApplicationStatusUpdate(application.id, 'approved')}
                              disabled={processingApplication}
                              className="flex-1"
                            >
                              <CheckCircle className="size-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleApplicationStatusUpdate(application.id, 'rejected')}
                              disabled={processingApplication}
                              variant="destructive"
                              className="flex-1"
                            >
                              <XCircle className="size-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {application.status !== 'pending' && (
                        <div className="text-sm text-muted-foreground pt-2 border-t">
                          {application.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                          {application.updated_at ? 
                            new Date(application.updated_at).toLocaleDateString() : 
                            new Date(application.created_at).toLocaleDateString()
                          }
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
 