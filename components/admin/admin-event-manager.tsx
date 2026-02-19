"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Loader2 as LucideLoader2, 
  Plus as LucidePlus, 
  Edit as LucideEdit, 
  Trash2 as LucideTrash2, 
  Calendar as LucideCalendar, 
  MapPin as LucideMapPin, 
  Users as LucideUsers, 
  Eye as LucideEye, 
  Shield as LucideShield, 
  Clock as LucideClock, 
  AlertTriangle as LucideAlertTriangle 
} from "lucide-react"

const Loader2 = LucideLoader2 as any
const Plus = LucidePlus as any
const Edit = LucideEdit as any
const Trash2 = LucideTrash2 as any
const Calendar = LucideCalendar as any
const MapPin = LucideMapPin as any
const Users = LucideUsers as any
const Eye = LucideEye as any
const Shield = LucideShield as any
const Clock = LucideClock as any
const AlertTriangle = LucideAlertTriangle as any
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import ImageUpload from "@/components/image-upload"
import { motion, AnimatePresence } from "framer-motion"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location?: string
  type: string
  max_participants?: number
  image_url?: string
  created_at: string
}

export default function AdminEventManager() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    type: "general",
    max_participants: "",
    image_url: ""
  })
  const [submitting, setSubmitting] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else {
        setError('Failed to fetch events')
      }
    } catch (err) {
      setError('Error loading events')
      console.error('Error fetching events:', err)
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

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ...formData,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
        })
      })

      if (response.ok) {
        const newEvent = await response.json()
        setEvents(prev => [newEvent, ...prev])
        toast({
          title: "Success",
          description: "Event created successfully",
        })
        handleCloseDialog()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create event')
      }
    } catch (err) {
      setError('Error creating event')
      console.error('Error creating event:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      location: event.location || "",
      type: event.type,
      max_participants: event.max_participants?.toString() || "",
      image_url: event.image_url || ""
    })
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsEditing(false)
    setEditingEvent(null)
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      type: "general",
      max_participants: "",
      image_url: ""
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'workshop':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'hackathon':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'meeting':
        return 'bg-green-500/10 text-green-400 border-green-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
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
    <div className="flex flex-col h-full bg-[#050505]/40 backdrop-blur-3xl min-h-[600px]">
      <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white shadow-2xl">
              <Calendar className="size-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black font-outfit tracking-tight text-white">Engagements</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Deployment Manifest & Event Logistics</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl px-8 hover:bg-slate-200 transition-all shadow-xl shadow-white/5 group">
                <Plus className="size-4 mr-2 group-hover:rotate-90 transition-transform" />
                Initialize Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-black/95 backdrop-blur-3xl border border-white/5 p-10 rounded-[2.5rem] shadow-3xl">
              <DialogHeader className="mb-10">
                <DialogTitle className="text-2xl font-bold font-outfit text-white">
                  {isEditing ? "Modify Deployment" : "Initialize Entry"}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {isEditing ? "ADJUSTING EXISTING PARAMETERS" : "DEFINING NEW ENGAGEMENT PARAMETERS"}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Designation</Label>
                      <Input
                        className="bg-white/[0.03] border-white/10 rounded-xl h-12 text-xs font-bold focus:border-white/20 transition-all placeholder:text-slate-700"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Event identifier"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Classification</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: string) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger className="bg-white/[0.03] border-white/10 rounded-xl h-12 text-xs font-bold focus:ring-0 focus:border-white/20 transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 backdrop-blur-3xl border-white/10 rounded-xl">
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="hackathon">Hackathon</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Detailed Analytics</Label>
                    <Textarea
                      className="bg-white/[0.03] border-white/10 rounded-2xl min-h-[120px] text-xs font-bold focus:border-white/20 transition-all p-4 placeholder:text-slate-700"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Full engagement specifications"
                      required
                    />
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Timestamp</Label>
                      <Input
                        type="datetime-local"
                        className="bg-white/[0.03] border-white/10 rounded-xl h-12 text-xs font-bold focus:border-white/20 transition-all invert brightness-200"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Coordinates</Label>
                      <Input
                        className="bg-white/[0.03] border-white/10 rounded-xl h-12 text-xs font-bold focus:border-white/20 transition-all placeholder:text-slate-700"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Physical or digital locale"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Capacity Limit</Label>
                      <Input
                        type="number"
                        className="bg-white/[0.03] border-white/10 rounded-xl h-12 text-xs font-bold focus:border-white/20 transition-all placeholder:text-slate-700"
                        value={formData.max_participants}
                        onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                        placeholder="Unlimited if null"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 mb-4 block">Visual Artifact</Label>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    label=""
                    placeholder="Source URL or Direct Upload"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-[10px] font-black uppercase tracking-widest h-14 px-8 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl"
                    onClick={handleCloseDialog}
                  >
                    Terminate
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl h-14 px-10 hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        {isEditing ? "Execute Update" : "Confirm Entry"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold"
            >
              <AlertTriangle className="size-4 shrink-0" />
              CRITICAL ERROR: {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
              >
                {event.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image_url} 
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Active</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold font-outfit text-white mb-2 group-hover:text-white transition-colors">
                    {event.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-6 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="mt-auto space-y-3">
                    <div className="flex items-center gap-3 text-slate-400">
                      <Calendar className="size-3.5 text-slate-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <Clock className="size-3.5 text-slate-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-3 text-slate-400">
                        <MapPin className="size-3.5 text-slate-600" />
                        <span className="text-[10px] font-bold uppercase tracking-widest truncate">{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-400">
                      <Users className="size-3.5 text-slate-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {event.max_participants ? `0 / ${event.max_participants} Nodes` : 'Open Matrix'}
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="size-9 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:bg-white hover:text-black transition-all"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="size-9 rounded-xl bg-rose-500/20 backdrop-blur-md border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {events.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[3rem]">
                <Calendar className="size-20 text-slate-900 mx-auto mb-6" />
                <h4 className="text-xl font-bold font-outfit text-white/20 mb-2 uppercase tracking-[0.2em]">Matrix Empty</h4>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Awaiting engagement initialization</p>
              </div>
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}
 