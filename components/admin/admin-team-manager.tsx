"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  UserPlus,
  Mail,
  Github,
  Linkedin,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/auth"

interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  image: string
  year: string
  contact: string
  specialties: string[]
  github: string
  linkedin: string
  created_at: string
}

export default function AdminTeamManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
    year: "",
    contact: "",
    specialties: [] as string[],
    github: "",
    linkedin: ""
  })

  const { toast } = useToast()

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading team members:', error)
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive",
        })
      } else {
        setTeamMembers(data || [])
      }
    } catch (error) {
      console.error('Error loading team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingMember) {
        // Update existing member
        const { error } = await supabase
          .from('team_members')
          .update(formData)
          .eq('id', editingMember.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Team member updated successfully",
        })
      } else {
        // Add new member
        const { error } = await supabase
          .from('team_members')
          .insert([formData])

        if (error) throw error

        toast({
          title: "Success",
          description: "Team member added successfully",
        })
      }

      setShowAddModal(false)
      setEditingMember(null)
      resetForm()
      loadTeamMembers()
    } catch (error) {
      console.error('Error saving team member:', error)
      toast({
        title: "Error",
        description: "Failed to save team member",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team member?')) return

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Team member deleted successfully",
      })
      loadTeamMembers()
    } catch (error) {
      console.error('Error deleting team member:', error)
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image: member.image,
      year: member.year,
      contact: member.contact,
      specialties: member.specialties || [],
      github: member.github,
      linkedin: member.linkedin
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      bio: "",
      image: "",
      year: "",
      contact: "",
      specialties: [],
      github: "",
      linkedin: ""
    })
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-muted-foreground">Manage team members and their information</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="size-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <Avatar className="size-16 mx-auto mb-4">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <Badge variant="secondary">{member.role}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">{member.bio}</p>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {member.specialties?.map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>Year {member.year}</span>
                </div>

                <div className="flex justify-center gap-2">
                  {member.github && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={member.github} target="_blank" rel="noopener noreferrer">
                        <Github className="size-4" />
                      </a>
                    </Button>
                  )}
                  {member.linkedin && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="size-4" />
                      </a>
                    </Button>
                  )}
                  {member.contact && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`mailto:${member.contact}`}>
                        <Mail className="size-4" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="flex justify-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Team Members Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "No members match your search." : "Add your first team member to get started."}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Role</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Year</label>
                <Input
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">GitHub URL</label>
                <Input
                  value={formData.github}
                  onChange={(e) => setFormData({...formData, github: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingMember ? "Update" : "Add"} Member
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingMember(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  UserPlus,
  Mail,
  Github,
  Linkedin,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/auth"

interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  image: string
  year: string
  contact: string
  specialties: string[]
  github: string
  linkedin: string
  created_at: string
}

export default function AdminTeamManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
    year: "",
    contact: "",
    specialties: [] as string[],
    github: "",
    linkedin: ""
  })

  const { toast } = useToast()

  useEffect(() => {
    loadTeamMembers()
  }, [])

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading team members:', error)
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive",
        })
      } else {
        setTeamMembers(data || [])
      }
    } catch (error) {
      console.error('Error loading team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingMember) {
        // Update existing member
        const { error } = await supabase
          .from('team_members')
          .update(formData)
          .eq('id', editingMember.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Team member updated successfully",
        })
      } else {
        // Add new member
        const { error } = await supabase
          .from('team_members')
          .insert([formData])

        if (error) throw error

        toast({
          title: "Success",
          description: "Team member added successfully",
        })
      }

      setShowAddModal(false)
      setEditingMember(null)
      resetForm()
      loadTeamMembers()
    } catch (error) {
      console.error('Error saving team member:', error)
      toast({
        title: "Error",
        description: "Failed to save team member",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team member?')) return

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Team member deleted successfully",
      })
      loadTeamMembers()
    } catch (error) {
      console.error('Error deleting team member:', error)
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio,
      image: member.image,
      year: member.year,
      contact: member.contact,
      specialties: member.specialties || [],
      github: member.github,
      linkedin: member.linkedin
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      bio: "",
      image: "",
      year: "",
      contact: "",
      specialties: [],
      github: "",
      linkedin: ""
    })
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-muted-foreground">Manage team members and their information</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="size-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <Avatar className="size-16 mx-auto mb-4">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <Badge variant="secondary">{member.role}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">{member.bio}</p>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {member.specialties?.map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>Year {member.year}</span>
                </div>

                <div className="flex justify-center gap-2">
                  {member.github && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={member.github} target="_blank" rel="noopener noreferrer">
                        <Github className="size-4" />
                      </a>
                    </Button>
                  )}
                  {member.linkedin && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="size-4" />
                      </a>
                    </Button>
                  )}
                  {member.contact && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`mailto:${member.contact}`}>
                        <Mail className="size-4" />
                      </a>
                    </Button>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="flex justify-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="size-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Team Members Found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? "No members match your search." : "Add your first team member to get started."}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Role</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Year</label>
                <Input
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">GitHub URL</label>
                <Input
                  value={formData.github}
                  onChange={(e) => setFormData({...formData, github: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">LinkedIn URL</label>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingMember ? "Update" : "Add"} Member
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingMember(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 