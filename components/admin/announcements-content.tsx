"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Loader2 as LucideLoader2,
  Send as LucideSend,
  Save as LucideSave,
  Mail as LucideMail,
  Users as LucideUsers,
  UserCheck as LucideUserCheck,
  Clock as LucideClock,
  CheckCircle as LucideCheckCircle,
  XCircle as LucideXCircle,
  AlertTriangle as LucideAlertTriangle,
  Eye as LucideEye,
  BarChart3 as LucideBarChart3,
  Filter as LucideFilter,
  Edit as LucideEdit,
  RefreshCw as LucideRefreshCw,
  X as LucideX,
  User as LucideUser,
  Plus as LucidePlus,
  ArrowRight as LucideArrowRight,
  ChevronRight as LucideChevronRight,
  Search as LucideSearch,
  History as LucideHistory,
  Activity as LucideActivity
} from "lucide-react"

const Loader2 = LucideLoader2 as any
const Send = LucideSend as any
const Save = LucideSave as any
const Mail = LucideMail as any
const Users = LucideUsers as any
const UserCheck = LucideUserCheck as any
const Clock = LucideClock as any
const CheckCircle = LucideCheckCircle as any
const XCircle = LucideXCircle as any
const AlertTriangle = LucideAlertTriangle as any
const Eye = LucideEye as any
const BarChart3 = LucideBarChart3 as any
const Filter = LucideFilter as any
const Edit = LucideEdit as any
const RefreshCw = LucideRefreshCw as any
const X = LucideX as any
const User = LucideUser as any
const Plus = LucidePlus as any
const ArrowRight = LucideArrowRight as any
const ChevronRight = LucideChevronRight as any
const Search = LucideSearch as any
const History = LucideHistory as any
const Activity = LucideActivity as any
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"

interface Announcement {
  id: string
  title: string
  message: string
  sender_name: string
  recipient_type: 'all' | 'specific'
  recipient_emails: string[] | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'sent' | 'failed'
  sent_at: string | null
  created_at: string
  announcement_deliveries?: AnnouncementDelivery[]
}

interface AnnouncementDelivery {
  id: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  recipient_email: string
  recipient_name?: string
  email_id?: string
  sent_at?: string
  delivered_at?: string
  error_message?: string
  created_at: string
}

interface Member {
  email: string
  first_name: string
  last_name: string
}

export function AnnouncementsContent() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all')
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [resendingAnnouncement, setResendingAnnouncement] = useState<Announcement | null>(null)
  const [resending, setResending] = useState(false)
  const [resendDialogOpen, setResendDialogOpen] = useState(false)
  const [resendOptions, setResendOptions] = useState<'all' | 'failed' | 'specific'>('failed')

  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all')
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [customEmails, setCustomEmails] = useState('')
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required. Please sign in.')
        setLoading(false)
        return
      }

      const announcementsResponse = await fetch('/api/admin/announcements', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json()
        setAnnouncements(announcementsData)
      }

      const { data: membersData, error: membersError } = await supabase
        .from('membership_applications')
        .select('email, first_name, last_name')
        .eq('status', 'approved')
        .order('first_name')

      if (!membersError && membersData) {
        setMembers(membersData)
      }

    } catch (err) {
      setError('Error loading data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendAnnouncement = async (saveAsDraft = false) => {
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required')
      return
    }

    if (recipientType === 'specific' && selectedEmails.length === 0 && !customEmails.trim()) {
      setError('Please select recipients or enter email addresses')
      return
    }

    setSending(true)
    setError('')
    setSuccess('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required. Please sign in.')
        setSending(false)
        return
      }

      let finalEmails = selectedEmails
      if (customEmails.trim()) {
        const customEmailList = customEmails
          .split(/[,\n]/)
          .map(email => email.trim())
          .filter(email => email && email.includes('@'))
        finalEmails = [...new Set([...finalEmails, ...customEmailList])]
      }

      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          recipientType,
          specificEmails: recipientType === 'specific' ? finalEmails : [],
          priority,
          sendImmediately: !saveAsDraft
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setTitle('')
        setMessage('')
        setSelectedEmails([])
        setCustomEmails('')
        setPriority('normal')
        fetchData()
      } else {
        setError(data.error || 'Failed to send announcement')
      }

    } catch (err) {
      setError('Error sending announcement')
      console.error('Error sending announcement:', err)
    } finally {
      setSending(false)
    }
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setTitle(announcement.title)
    setMessage(announcement.message)
    setRecipientType(announcement.recipient_type)
    setPriority(announcement.priority)
    if (announcement.recipient_type === 'specific' && announcement.recipient_emails) {
      setSelectedEmails(announcement.recipient_emails)
    }
    setError('')
    setSuccess('')
  }

  const handleUpdateAnnouncement = async (sendImmediately = false) => {
    if (!editingAnnouncement) return

    if (!title.trim() || !message.trim()) {
      setError('Title and message are required')
      return
    }

    if (recipientType === 'specific' && selectedEmails.length === 0 && !customEmails.trim()) {
      setError('Please select recipients or enter email addresses')
      return
    }

    setSending(true)
    setError('')
    setSuccess('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required. Please sign in.')
        setSending(false)
        return
      }

      let finalEmails = selectedEmails
      if (customEmails.trim()) {
        const customEmailList = customEmails
          .split(/[,\n]/)
          .map(email => email.trim())
          .filter(email => email && email.includes('@'))
        finalEmails = [...new Set([...finalEmails, ...customEmailList])]
      }

      const response = await fetch(`/api/admin/announcements/${editingAnnouncement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          recipientType,
          specificEmails: recipientType === 'specific' ? finalEmails : [],
          priority,
          sendImmediately
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setEditingAnnouncement(null)
        setTitle('')
        setMessage('')
        setSelectedEmails([])
        setCustomEmails('')
        setPriority('normal')
        fetchData()
      } else {
        setError(data.error || 'Failed to update announcement')
      }

    } catch (err) {
      setError('Error updating announcement')
      console.error('Error updating announcement:', err)
    } finally {
      setSending(false)
    }
  }

  const handleResendToFailed = async (announcement: Announcement) => {
    if (!announcement.announcement_deliveries) return

    const failedDeliveries = announcement.announcement_deliveries.filter(
      d => d.status === 'failed' || d.status === 'bounced'
    )

    if (failedDeliveries.length === 0) {
      setError('No failed deliveries to resend')
      return
    }

    setResending(true)
    setError('')
    setSuccess('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required. Please sign in.')
        setResending(false)
        return
      }

      const response = await fetch(`/api/admin/announcements/${announcement.id}/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          resendType: 'failed'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        fetchData()
      } else {
        setError(data.error || 'Failed to resend announcement')
      }

    } catch (err) {
      setError('Error resending announcement')
      console.error('Error resending announcement:', err)
    } finally {
      setResending(false)
    }
  }

  const handleResendAnnouncement = async (announcement: Announcement, resendType: 'all' | 'failed' | 'specific' = 'failed') => {
    setResending(true)
    setError('')
    setSuccess('')

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required. Please sign in.')
        setResending(false)
        return
      }

      const response = await fetch(`/api/admin/announcements/${announcement.id}/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          resendType
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setResendDialogOpen(false)
        fetchData()
      } else {
        setError(data.error || 'Failed to resend announcement')
      }

    } catch (err) {
      setError('Error resending announcement')
      console.error('Error resending announcement:', err)
    } finally {
      setResending(false)
    }
  }

  const openResendDialog = (announcement: Announcement) => {
    setResendingAnnouncement(announcement)
    setResendDialogOpen(true)
    setResendOptions('failed')
  }

  const cancelEdit = () => {
    setEditingAnnouncement(null)
    setTitle('')
    setMessage('')
    setSelectedEmails([])
    setCustomEmails('')
    setPriority('normal')
    setRecipientType('all')
    setError('')
    setSuccess('')
  }

  const getPriorityBadgeStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'failed':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      default:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  }

  const getDeliveryStats = (announcement: Announcement) => {
    if (!announcement.announcement_deliveries) return null

    const deliveries = announcement.announcement_deliveries
    const sent = deliveries.filter(d => d.status === 'sent' || d.status === 'delivered').length
    const failed = deliveries.filter(d => d.status === 'failed' || d.status === 'bounced').length
    const pending = deliveries.filter(d => d.status === 'pending').length

    return { sent, failed, pending, total: deliveries.length }
  }

  const getDeliveryStatusStyles = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'failed':
      case 'bounced':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      case 'pending':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default:
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  const getFilteredDeliveries = (deliveries: AnnouncementDelivery[]) => {
    if (deliveryFilter === 'all') return deliveries
    if (deliveryFilter === 'sent') return deliveries.filter(d => d.status === 'sent' || d.status === 'delivered')
    if (deliveryFilter === 'failed') return deliveries.filter(d => d.status === 'failed' || d.status === 'bounced')
    if (deliveryFilter === 'pending') return deliveries.filter(d => d.status === 'pending')
    return deliveries
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-white/20" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Initializing Communications HUB</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="send" className="flex flex-col h-full bg-[#050505]/40 backdrop-blur-3xl">
      <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white shadow-2xl">
              <Mail className="size-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black font-outfit tracking-tight text-white">Broadcast</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Neural Communications Gateway</p>
            </div>
          </div>
          
          <TabsList className="bg-white/[0.03] border border-white/10 p-1 h-12 rounded-xl">
            <TabsTrigger value="send" className="rounded-lg px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black transition-all">
              <Send className="size-3.5 mr-2" />
              Dispatch
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black transition-all">
              <History className="size-3.5 mr-2" />
              Registry
            </TabsTrigger>
            <TabsTrigger value="tracking" className="rounded-lg px-6 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black transition-all">
              <Activity className="size-3.5 mr-2" />
              Telemetry
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        <AnimatePresence>
          {error && (
            <motion.div 
              key="error-alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold"
            >
              <AlertTriangle className="size-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              key="success-alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500 text-xs font-bold"
            >
              <CheckCircle className="size-4 shrink-0" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <TabsContent value="send" className="m-0 focus-visible:outline-none">
          <AnimatePresence mode="wait">
            <motion.div
              key="send-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                        <Plus className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-outfit text-white">Compose Dispatch</h3>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">TRANSMISSION PAYLOAD CONFIGURATION</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Archive Title</Label>
                        <Input
                          id="title"
                          placeholder="Announcement title..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="h-12 bg-white/[0.03] border-white/5 rounded-xl focus:border-white/20 transition-all placeholder:text-slate-700"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Priority Vector</Label>
                        <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                          <SelectTrigger className="h-12 bg-white/[0.03] border-white/5 rounded-xl focus:ring-0 focus:border-white/20 transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 backdrop-blur-3xl border-white/10 rounded-xl">
                            <SelectItem value="low">Low Intensity</SelectItem>
                            <SelectItem value="normal">Standard</SelectItem>
                            <SelectItem value="high">High Alert</SelectItem>
                            <SelectItem value="urgent">Critical Path</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2 mb-8">
                      <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Signal Payload (HTML Supported)</Label>
                      <Textarea
                        id="message"
                        placeholder="Your announcement message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[240px] bg-white/[0.02] border-white/5 rounded-2xl focus:border-white/20 transition-all p-6 text-sm leading-relaxed placeholder:text-slate-700"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => (editingAnnouncement ? handleUpdateAnnouncement(true) : handleSendAnnouncement(false))}
                        disabled={sending}
                        className="flex-1 h-14 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-xl shadow-white/5 group"
                      >
                        {sending ? (
                          <Loader2 className="size-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="size-4 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            {editingAnnouncement ? 'Commit & Broadcast' : 'Execute Dispatch'}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => (editingAnnouncement ? handleUpdateAnnouncement(false) : handleSendAnnouncement(true))}
                        disabled={sending}
                        className="px-8 h-14 rounded-2xl border border-white/5 bg-white/5 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                      >
                        <Save className="size-4 mr-2" />
                        {editingAnnouncement ? 'Update Cache' : 'Save Fragment'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-24 -right-24 size-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700" />
                    
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                      <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                        <Users className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold font-outfit text-white">Targeting</h3>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">RECIPIENT NODE CONTROL</p>
                      </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                      <div 
                        className={`p-5 rounded-2xl border transition-all cursor-pointer group/item ${
                          recipientType === 'all' 
                            ? "bg-white/10 border-white/20" 
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        }`}
                        onClick={() => {
                          setRecipientType('all')
                          setSelectedEmails([])
                          setCustomEmails('')
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Full Broadcast</span>
                          <div className={`size-4 rounded-full border flex items-center justify-center transition-all ${
                            recipientType === 'all' ? "border-white bg-white" : "border-white/20"
                          }`}>
                            {recipientType === 'all' && <div className="size-1.5 rounded-full bg-black" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Send to all {members.length} verified network nodes.</p>
                      </div>

                      <div 
                        className={`p-5 rounded-2xl border transition-all cursor-pointer group/item ${
                          recipientType === 'specific' 
                            ? "bg-white/10 border-white/20" 
                            : "bg-white/[0.02] border-white/5 hover:border-white/10"
                        }`}
                        onClick={() => setRecipientType('specific')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">Targeted Signal</span>
                          <div className={`size-4 rounded-full border flex items-center justify-center transition-all ${
                            recipientType === 'specific' ? "border-white bg-white" : "border-white/20"
                          }`}>
                            {recipientType === 'specific' && <div className="size-1.5 rounded-full bg-black" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Select specific coordinates for transmission.</p>
                      </div>

                      <AnimatePresence>
                        {recipientType === 'specific' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-4"
                          >
                            <div className="space-y-3">
                              <Label className="text-[9px] font-black uppercase tracking-widest text-slate-600 block pl-1">Network Directory</Label>
                              <div className="max-h-52 overflow-y-auto border border-white/10 rounded-2xl p-4 space-y-2 bg-black/40 custom-scrollbar">
                                {members.map((member) => (
                                  <div key={member.email} className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all group/member">
                                    <Checkbox
                                      id={member.email}
                                      checked={selectedEmails.includes(member.email)}
                                      onCheckedChange={(checked: any) => {
                                        if (checked === true) {
                                          setSelectedEmails([...selectedEmails, member.email])
                                        } else {
                                          setSelectedEmails(selectedEmails.filter(e => e !== member.email))
                                        }
                                      }}
                                      className="rounded-md border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                    />
                                    <Label htmlFor={member.email} className="text-xs font-medium text-slate-400 group-hover/member:text-white transition-colors cursor-pointer truncate">
                                      {member.first_name} {member.last_name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="custom-emails" className="text-[9px] font-black uppercase tracking-widest text-slate-600 block pl-1">Manual Coordinates</Label>
                              <Textarea
                                id="custom-emails"
                                placeholder="Enter email addresses..."
                                value={customEmails}
                                onChange={(e) => setCustomEmails(e.target.value)}
                                className="min-h-[100px] bg-white/[0.02] border-white/5 rounded-2xl focus:border-white/20 transition-all p-4 text-xs placeholder:text-slate-700"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {(members.length > 50 || (recipientType === 'all' && members.length > 50)) && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                          <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-amber-500/80 font-medium leading-relaxed">
                            HIGH VOLUME DETECTED. TRANSMISSION WILL BE SEQUENTIAL TO AVOID BUFFER OVERFLOW.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="history" className="m-0 focus-visible:outline-none">
          <AnimatePresence mode="wait">
            <motion.div
              key="history-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {announcements.length === 0 ? (
                <div className="text-center py-24 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
                  <div className="size-16 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-6">
                    <History className="size-8 text-slate-700" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Archive cluster empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {announcements.map((announcement, index) => {
                    const stats = getDeliveryStats(announcement)
                    return (
                      <motion.div
                        key={announcement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-bold font-outfit text-white group-hover:text-white transition-colors truncate">
                                {announcement.title}
                              </h4>
                              <Badge variant="outline" className={`h-6 rounded-lg text-[9px] font-black uppercase tracking-widest ${getPriorityBadgeStyles(announcement.priority)}`}>
                                {announcement.priority}
                              </Badge>
                              <Badge variant="outline" className={`h-6 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyles(announcement.status)}`}>
                                {announcement.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 font-medium line-clamp-1 opacity-70">
                              {announcement.message.replace(/<[^>]*>/g, '')}
                            </p>
                            <div className="flex flex-wrap items-center gap-5 pt-1">
                              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                <User className="size-3" /> {announcement.sender_name}
                              </span>
                              <span className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                <Clock className="size-3" /> {new Date(announcement.created_at).toLocaleDateString()}
                              </span>
                              {announcement.recipient_type === 'all' ? (
                                <span className="flex items-center gap-2 text-[10px] font-bold text-blue-500 inline-flex uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                                  <Users className="size-3" /> Full Broadcast
                                </span>
                              ) : (
                                <span className="flex items-center gap-2 text-[10px] font-bold text-violet-500 inline-flex uppercase tracking-widest bg-violet-500/5 px-2 py-0.5 rounded border border-violet-500/10">
                                  <UserCheck className="size-3" /> {announcement.recipient_emails?.length || 0} Targeted
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {stats && (
                              <div className="flex items-center h-12 bg-white/[0.03] border border-white/5 rounded-xl px-4 gap-6 mr-2">
                                <div className="text-center">
                                  <p className="text-[9px] font-black text-slate-600 uppercase">Sent</p>
                                  <p className="text-xs font-bold text-emerald-500">{stats.sent}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[9px] font-black text-slate-600 uppercase">Fail</p>
                                  <p className="text-xs font-bold text-rose-500">{stats.failed}</p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-11 rounded-xl bg-white/5 border border-white/5 hover:bg-white hover:text-black transition-all"
                                onClick={() => handleEditAnnouncement(announcement)}
                              >
                                <Edit className="size-4" />
                              </Button>
                              {announcement.status === 'failed' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-11 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-orange-500/0 hover:shadow-orange-500/20"
                                  onClick={() => handleResendToFailed(announcement)}
                                >
                                  <RefreshCw className="size-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="tracking" className="m-0 focus-visible:outline-none">
          <AnimatePresence mode="wait">
            <motion.div
              key="tracking-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Archive Selection</Label>
                  <Select value={selectedAnnouncement?.id} onValueChange={(value: string) => setSelectedAnnouncement(announcements.find(a => a.id === value) || null)}>
                    <SelectTrigger className="w-full md:w-[400px] h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-0 text-white font-bold font-outfit">
                      <SelectValue placeholder="Select announcement to track telemetry..." />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-2xl max-h-[400px]">
                      {announcements.filter(a => a.status !== 'draft').map((a) => (
                        <SelectItem key={a.id} value={a.id} className="focus:bg-white/10 transition-colors">
                          <div className="flex flex-col py-1">
                            <span className="font-bold text-white uppercase text-[10px] tracking-widest mb-0.5">{a.title}</span>
                            <span className="text-[9px] text-slate-500">{new Date(a.created_at).toLocaleString()} — {a.recipient_type}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedAnnouncement && (
                  <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-xl">
                    {(['all', 'sent', 'failed', 'pending'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setDeliveryFilter(filter)}
                        className={`px-5 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                          deliveryFilter === filter 
                            ? "bg-white text-black shadow-lg shadow-white/5" 
                            : "text-slate-500 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!selectedAnnouncement ? (
                <div className="text-center py-24 bg-white/[0.01] border border-dashed border-white/5 rounded-[2.5rem]">
                  <div className="size-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="size-10 text-slate-800" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Awaiting telemetry target selection</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      const stats = getDeliveryStats(selectedAnnouncement)
                      if (!stats) return null
                      return (
                        <>
                          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total Payload</p>
                            <p className="text-2xl font-bold font-outfit text-white">{stats.total}</p>
                          </div>
                          <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl p-6 text-center">
                            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest mb-1">Delivered</p>
                            <p className="text-2xl font-bold font-outfit text-emerald-500">{stats.sent}</p>
                          </div>
                          <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-2xl p-6 text-center">
                            <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest mb-1">Failed</p>
                            <p className="text-2xl font-bold font-outfit text-rose-500">{stats.failed}</p>
                          </div>
                          <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl p-6 text-center">
                            <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest mb-1">In Transit</p>
                            <p className="text-2xl font-bold font-outfit text-amber-500">{stats.pending}</p>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[9px] font-black text-slate-600 uppercase py-6 pl-8">Recipient Signature</TableHead>
                            <TableHead className="text-[9px] font-black text-slate-600 uppercase py-6">Status</TableHead>
                            <TableHead className="text-[9px] font-black text-slate-600 uppercase py-6">Timestamp</TableHead>
                            <TableHead className="text-[9px] font-black text-slate-600 uppercase py-6 pr-8">Diagnostic Report</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedAnnouncement.announcement_deliveries && getFilteredDeliveries(selectedAnnouncement.announcement_deliveries).length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-20 text-[10px] font-bold text-slate-700 uppercase tracking-widest italic">
                                No delivery nodes matching current filter
                              </TableCell>
                            </TableRow>
                          ) : (
                            getFilteredDeliveries(selectedAnnouncement.announcement_deliveries || []).map((delivery) => (
                              <TableRow key={delivery.id} className="border-white/5 hover:bg-white/[0.02] group transition-colors">
                                <TableCell className="py-5 pl-8">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">{delivery.recipient_name || 'Anonymous Node'}</span>
                                    <span className="text-[10px] font-medium text-slate-500">{delivery.recipient_email}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`h-6 rounded-lg text-[9px] font-black uppercase tracking-widest ${getDeliveryStatusStyles(delivery.status)}`}>
                                    {delivery.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-slate-500 font-medium">
                                  {delivery.sent_at ? new Date(delivery.sent_at).toLocaleString() : 'PENDING TRANSMISSION'}
                                </TableCell>
                                <TableCell className="pr-8">
                                  {delivery.error_message ? (
                                    <div className="flex items-center gap-2 text-rose-500/70">
                                      <AlertTriangle className="size-3 shrink-0" />
                                      <span className="text-[10px] font-bold uppercase truncate max-w-[200px]">{delivery.error_message}</span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">— SYSTEM OPTIMAL</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </div>

      <Dialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
        <DialogContent className="max-w-md bg-black/95 backdrop-blur-3xl border border-white/5 p-8 rounded-[2rem] shadow-3xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold font-outfit text-white">Resend Dispatch</DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              RE-ENGAGE TRANSMISSION GATEWAY
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Strategy Selection</Label>
              <Select value={resendOptions} onValueChange={(value: 'all' | 'failed' | 'specific') => setResendOptions(value)}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-0 text-white font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-3xl border-white/10 rounded-xl">
                  <SelectItem value="failed">Retry Failed Nodes Only</SelectItem>
                  <SelectItem value="all">Full Synchronizer (Unique Nodes Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {resendingAnnouncement && (
              <div className="p-4 bg-white/[0.03] border border-white/5 rounded-xl space-y-1">
                <p className="text-[9px] font-black text-slate-600 uppercase">Target Archive</p>
                <p className="text-sm font-bold text-white truncate">{resendingAnnouncement.title}</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-8 gap-3 sm:justify-start">
            <Button
              onClick={() => resendingAnnouncement && handleResendAnnouncement(resendingAnnouncement, resendOptions)}
              disabled={resending}
              className="flex-1 h-12 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              {resending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Confirm Resync'
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setResendDialogOpen(false)}
              className="px-6 h-12 rounded-xl border border-white/5 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
            >
              Abort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}
