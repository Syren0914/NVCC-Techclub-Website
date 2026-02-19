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
import { Loader2, Plus, Edit, Trash2, ExternalLink, Eye, BookOpen, Tag } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"

interface Resource {
  id: string
  title: string
  description: string
  url: string
  type: string
  category: string
  tags: string[]
  image_url?: string
  created_at: string
}

export default function AdminResourceManager() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    type: "link",
    category: "general",
    tags: "",
    image_url: ""
  })
  const [submitting, setSubmitting] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/resources', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setResources(data)
      } else {
        setError('Failed to fetch resources')
      }
    } catch (err) {
      setError('Error loading resources')
      console.error('Error fetching resources:', err)
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

      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        })
      })

      if (response.ok) {
        const newResource = await response.json()
        setResources(prev => [newResource, ...prev])
        toast({
          title: "Success",
          description: "Resource created successfully",
        })
        handleCloseDialog()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create resource')
      }
    } catch (err) {
      setError('Error creating resource')
      console.error('Error creating resource:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description,
      url: resource.url,
      type: resource.type,
      category: resource.category,
      tags: resource.tags.join(', '),
      image_url: resource.image_url || ""
    })
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsEditing(false)
    setEditingResource(null)
    setFormData({
      title: "",
      description: "",
      url: "",
      type: "link",
      category: "general",
      tags: "",
      image_url: ""
    })
  }

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'article':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'tutorial':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'documentation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getResourceCategoryColor = (category: string) => {
    switch (category) {
      case 'programming':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'design':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
      case 'tools':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
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
          <h2 className="text-xl font-bold font-outfit tracking-tight text-white mb-1">Knowledge Repository</h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Curated Learning Assets & Network Flux</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-white text-black font-bold text-[11px] uppercase tracking-[0.1em] rounded-xl h-11 px-8 hover:bg-slate-200 transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Inject Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-[#0d0d0d] border-white/10 p-12 rounded-[2.5rem] shadow-3xl">
            <DialogHeader className="mb-10">
              <DialogTitle className="text-2xl font-bold font-outfit tracking-tight text-white uppercase tracking-[0.1em]">
                {isEditing ? "Reconfigure Node" : "Inject Resource"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.15em] mt-2">
                {isEditing ? "Modifying parameters for knowledge node distribution" : "Defining new knowledge vector for club learning pipeline"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Asset Identity</label>
                  <Input
                    className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5 placeholder:text-slate-700"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Resource designation"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Payload Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10 rounded-xl">
                      <SelectItem value="link">Link</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Data Abstract</label>
                <Textarea
                  className="bg-white/[0.03] border-white/10 rounded-2xl min-h-[140px] text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all p-5 placeholder:text-slate-700"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of the knowledge payload"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Endpoint URL</label>
                  <Input
                    className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5 placeholder:text-slate-700"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://resource.nexus..."
                    type="url"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Domain Classification</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10 rounded-xl">
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="tools">Tools</SelectItem>
                      <SelectItem value="frameworks">Frameworks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Metadata Tags (comma-separated)</label>
                <Input
                  className="bg-white/[0.03] border-white/10 rounded-xl h-14 text-sm font-medium focus:ring-1 focus:ring-white/20 transition-all px-5 placeholder:text-slate-700"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="React, Neural, System Architecture"
                />
              </div>
              
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
                  {isEditing ? "Update Node" : "Inject Resource"}
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
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20 px-10">Resource Designation</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20">Protocol</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20">Domain</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20">Metadata</TableHead>
              <TableHead className="text-right text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 h-20 px-10">Tactical</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id} className="border-white/5 hover:bg-white/[0.03] transition-all group h-28">
                <TableCell className="px-10">
                  <div>
                    <h4 className="font-bold text-slate-100 text-base font-outfit tracking-tight">{resource.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1.5 max-w-md line-clamp-1 font-medium leading-relaxed">
                      {resource.description}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getResourceTypeColor(resource.type).replace('bg-blue-100 text-blue-800', 'bg-blue-500/10 text-blue-400 border-blue-500/20')} border-[0.5px] text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-lg`}>
                    {resource.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${getResourceCategoryColor(resource.category).replace('bg-orange-100 text-orange-800', 'bg-orange-500/10 text-orange-400 border-orange-500/20').replace('bg-pink-100 text-pink-800', 'bg-pink-500/10 text-pink-400 border-pink-500/20').replace('bg-indigo-100 text-indigo-800', 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20')} border-[0.5px] text-[10px] font-bold uppercase tracking-[0.1em] px-3 py-1 rounded-lg`}>
                    {resource.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-[9px] font-bold uppercase tracking-[0.1em] bg-white/5 border-white/10 rounded-lg px-2.5 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-[0.1em] bg-white/5 border-white/10 rounded-lg px-2.5 py-0.5">
                        +{resource.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-10 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Button variant="ghost" size="sm" className="size-11 p-0 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white hover:text-black transition-all duration-300" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4.5" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" className="size-11 p-0 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white hover:text-black transition-all duration-300">
                      <Eye className="size-4.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="size-11 p-0 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white hover:text-black transition-all duration-300"
                      onClick={() => handleEdit(resource)}
                    >
                      <Edit className="size-4.5" />
                    </Button>
                    <Button variant="ghost" className="size-11 p-0 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all duration-300">
                      <Trash2 className="size-4.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}