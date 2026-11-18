"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase"
import { Users, Mail, Calendar, User, Building, GraduationCap, Target, CheckCircle } from "lucide-react"

interface ProjectMember {
  id: string
  project_id: string
  user_email: string
  user_name: string
  user_major?: string
  user_year?: string
  joined_at: string
  role?: string
  projects: {
    id: string
    title: string
    description: string
    technologies: string[]
  }
}

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  member_count: number
}

export function ProjectMembersManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showMembersDialog, setShowMembersDialog] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      // Get the session to access the token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('No active session found')
        return
      }

      const token = session.access_token
      const response = await fetch('/api/admin/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setProjects(result.data || [])
      } else {
        console.error('Failed to load projects')
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProjectMembers = async (projectId: string) => {
    try {
      // Get the session to access the token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('No active session found')
        return
      }

      const token = session.access_token
      const response = await fetch(`/api/admin/project-members?project_id=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        setProjectMembers(result.data || [])
      } else {
        console.error('Failed to load project members')
      }
    } catch (error) {
      console.error('Error loading project members:', error)
    }
  }

  const handleViewMembers = async (project: Project) => {
    setSelectedProject(project)
    setShowMembersDialog(true)
    await loadProjectMembers(project.id)
  }

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
        <h2 className="text-2xl font-bold">Project Members</h2>
        <Button onClick={loadProjects} variant="outline">
          Refresh
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No projects found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Projects will appear here once they are created and have members.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{project.member_count || 0}</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                    <Button 
                      onClick={() => handleViewMembers(project)}
                      variant="outline"
                      size="sm"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Members
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Project Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {selectedProject?.title} - Team Members
            </DialogTitle>
            <DialogDescription>
              View all members participating in this project
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {projectMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No members found for this project</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Members will appear here once they are approved to join the project.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {projectMembers.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">{member.user_name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              Member
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span>{member.user_email}</span>
                              </div>
                              
                              {member.user_major && (
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-3 w-3 text-muted-foreground" />
                                  <span>{member.user_major}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {member.user_year && (
                                <div className="flex items-center gap-2">
                                  <Target className="h-3 w-3 text-muted-foreground" />
                                  <span>{member.user_year}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs text-green-600">Active</span>
                        </div>
                      </div>
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
