"use client"

import { useState, useEffect } from "react"
import { AdminProtection } from "@/components/admin-protection"
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Loader2, 
  Send, 
  Save, 
  Mail, 
  Users, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Trash2,
  Plus,
  BarChart3,
  Filter,
  Edit,
  RefreshCw,
  X
} from "lucide-react"
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

function AnnouncementsContent() {
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

      // Fetch announcements
      const announcementsResponse = await fetch('/api/admin/announcements', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json()
        setAnnouncements(announcementsData)
      }

      // Fetch approved members
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

      // Prepare recipient emails
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
        // Clear form
        setTitle('')
        setMessage('')
        setSelectedEmails([])
        setCustomEmails('')
        setPriority('normal')
        // Refresh data
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

      // Prepare recipient emails
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
        // Clear form
        setTitle('')
        setMessage('')
        setSelectedEmails([])
        setCustomEmails('')
        setPriority('normal')
        // Refresh data
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
        fetchData() // Refresh data
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
        fetchData() // Refresh data
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
    setResendOptions('failed') // Default to failed
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

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      normal: 'bg-gray-100 text-gray-800', 
      high: 'bg-yellow-100 text-yellow-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return (
      <Badge className={colors[priority as keyof typeof colors] || colors.normal}>
        {priority}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Sent</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
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

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case 'failed':
      case 'bounced':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading announcements...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Announcements</h1>
          <p className="text-muted-foreground">
            Send announcements to all approved members or specific individuals
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="send" className="space-y-6">
          <TabsList>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Announcement
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Delivery Tracking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                    </CardTitle>
                    <CardDescription>
                      {editingAnnouncement 
                        ? 'Update and resend your announcement'
                        : 'Send announcements to your tech club members'
                      }
                    </CardDescription>
                  </div>
                  {editingAnnouncement && (
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Announcement title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Your announcement message... (HTML supported)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    You can use HTML tags like &lt;b&gt;, &lt;i&gt;, &lt;p&gt;, &lt;br&gt;, etc.
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>Recipients</Label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all-members"
                        checked={recipientType === 'all'}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setRecipientType('all')
                            setSelectedEmails([])
                            setCustomEmails('')
                          }
                        }}
                      />
                      <Label htmlFor="all-members" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        All approved members ({members.length} members)
                        {members.length > 10 && (
                          <span className="text-xs text-yellow-600 ml-2">
                            (Large batch - will take ~{Math.ceil(members.length / 2)} seconds)
                          </span>
                        )}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="specific-members"
                        checked={recipientType === 'specific'}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setRecipientType('specific')
                          }
                        }}
                      />
                      <Label htmlFor="specific-members" className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Specific members
                      </Label>
                    </div>

                    {recipientType === 'specific' && (
                      <div className="ml-6 space-y-4">
                        <div className="space-y-2">
                          <Label>Select from approved members:</Label>
                          <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                            {members.map((member) => (
                              <div key={member.email} className="flex items-center space-x-2">
                                <Checkbox
                                  id={member.email}
                                  checked={selectedEmails.includes(member.email)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedEmails([...selectedEmails, member.email])
                                    } else {
                                      setSelectedEmails(selectedEmails.filter(e => e !== member.email))
                                    }
                                  }}
                                />
                                <Label htmlFor={member.email} className="text-sm">
                                  {member.first_name} {member.last_name} ({member.email})
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="custom-emails">Or enter custom emails:</Label>
                          <Textarea
                            id="custom-emails"
                            placeholder="Enter email addresses separated by commas or new lines..."
                            value={customEmails}
                            onChange={(e) => setCustomEmails(e.target.value)}
                            className="min-h-[80px]"
                          />
                        </div>

                        {(selectedEmails.length > 0 || customEmails.trim()) && (
                          <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">
                              Selected: {selectedEmails.length} members
                              {customEmails.trim() && ` + custom emails`}
                            </div>
                            {(selectedEmails.length > 10 || (recipientType === 'all' && members.length > 10)) && (
                              <Alert className="border-yellow-200 bg-yellow-50">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  <strong>Large batch detected:</strong> Sending to {recipientType === 'all' ? members.length : selectedEmails.length}+ recipients will take some time due to email rate limits (2 emails per second).
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  {editingAnnouncement ? (
                    <>
                      <Button 
                        onClick={() => handleUpdateAnnouncement(true)}
                        disabled={sending}
                        className="flex items-center gap-2"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Update & Send
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleUpdateAnnouncement(false)}
                        disabled={sending}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Update Draft
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={() => handleSendAnnouncement(false)}
                        disabled={sending}
                        className="flex items-center gap-2"
                      >
                        {sending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Now
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleSendAnnouncement(true)}
                        disabled={sending}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save as Draft
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Announcement History</CardTitle>
                <CardDescription>
                  View all sent and draft announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No announcements found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Sender</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {announcements.map((announcement) => {
                        const stats = getDeliveryStats(announcement)
                        return (
                          <TableRow key={announcement.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{announcement.title}</div>
                                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {announcement.message.replace(/<[^>]*>/g, '')}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{announcement.sender_name}</TableCell>
                            <TableCell>
                              {announcement.recipient_type === 'all' ? (
                                <Badge variant="outline">All Members</Badge>
                              ) : (
                                <Badge variant="outline">
                                  {announcement.recipient_emails?.length || 0} Specific
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{getPriorityBadge(announcement.priority)}</TableCell>
                            <TableCell>{getStatusBadge(announcement.status)}</TableCell>
                            <TableCell>
                              {stats && (
                                <div className="text-sm">
                                  <div className="text-green-600">{stats.sent} sent</div>
                                  {stats.failed > 0 && (
                                    <div className="text-red-600">{stats.failed} failed</div>
                                  )}
                                  {stats.pending > 0 && (
                                    <div className="text-yellow-600">{stats.pending} pending</div>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {announcement.sent_at 
                                  ? new Date(announcement.sent_at).toLocaleDateString()
                                  : new Date(announcement.created_at).toLocaleDateString()
                                }
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" title="View Message">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>{announcement.title}</DialogTitle>
                                      <DialogDescription>
                                        Sent by {announcement.sender_name} on{' '}
                                        {announcement.sent_at 
                                          ? new Date(announcement.sent_at).toLocaleString()
                                          : new Date(announcement.created_at).toLocaleString()
                                        }
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Message:</h4>
                                        <div 
                                          className="border rounded p-3 bg-muted"
                                          dangerouslySetInnerHTML={{ __html: announcement.message }}
                                        />
                                      </div>
                                      {stats && (
                                        <div>
                                          <h4 className="font-semibold mb-2">Delivery Stats:</h4>
                                          <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div className="text-green-600">✓ {stats.sent} Sent</div>
                                            <div className="text-red-600">✗ {stats.failed} Failed</div>
                                            <div className="text-yellow-600">⏳ {stats.pending} Pending</div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  title="Edit Announcement"
                                  onClick={() => handleEditAnnouncement(announcement)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {announcement.status === 'sent' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="Resend Announcement"
                                    onClick={() => openResendDialog(announcement)}
                                    disabled={resending}
                                  >
                                    {resending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                {announcement.announcement_deliveries && announcement.announcement_deliveries.some(d => d.status === 'failed' || d.status === 'bounced') && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="Resend to Failed Recipients Only"
                                    onClick={() => handleResendToFailed(announcement)}
                                    disabled={resending}
                                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                  >
                                    {resending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                {announcement.announcement_deliveries && announcement.announcement_deliveries.length > 0 && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    title="View Delivery Details"
                                    onClick={() => setSelectedAnnouncement(announcement)}
                                  >
                                    <BarChart3 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Tracking</CardTitle>
                <CardDescription>
                  Detailed delivery status for all announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedAnnouncement ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedAnnouncement.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Sent by {selectedAnnouncement.sender_name} on{' '}
                          {selectedAnnouncement.sent_at 
                            ? new Date(selectedAnnouncement.sent_at).toLocaleString()
                            : new Date(selectedAnnouncement.created_at).toLocaleString()
                          }
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {selectedAnnouncement.status === 'sent' && (
                          <Button 
                            onClick={() => openResendDialog(selectedAnnouncement)}
                            disabled={resending}
                            className="flex items-center gap-2"
                          >
                            {resending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Resending...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4" />
                                Resend All
                              </>
                            )}
                          </Button>
                        )}
                        {selectedAnnouncement.announcement_deliveries && selectedAnnouncement.announcement_deliveries.some(d => d.status === 'failed' || d.status === 'bounced') && (
                          <Button 
                            onClick={() => handleResendToFailed(selectedAnnouncement)}
                            disabled={resending}
                            variant="destructive"
                            className="flex items-center gap-2"
                          >
                            {resending ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Resending...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                Resend Failed
                              </>
                            )}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedAnnouncement(null)}
                        >
                          Back to List
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {selectedAnnouncement.announcement_deliveries && (
                      <>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <Label>Filter by status:</Label>
                          </div>
                          <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All ({selectedAnnouncement.announcement_deliveries.length})</SelectItem>
                              <SelectItem value="sent">
                                Delivered ({selectedAnnouncement.announcement_deliveries.filter(d => d.status === 'sent' || d.status === 'delivered').length})
                              </SelectItem>
                              <SelectItem value="failed">
                                Failed ({selectedAnnouncement.announcement_deliveries.filter(d => d.status === 'failed' || d.status === 'bounced').length})
                              </SelectItem>
                              <SelectItem value="pending">
                                Pending ({selectedAnnouncement.announcement_deliveries.filter(d => d.status === 'pending').length})
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-6">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <div>
                                  <p className="text-2xl font-bold text-green-600">
                                    {selectedAnnouncement.announcement_deliveries.filter(d => d.status === 'sent' || d.status === 'delivered').length}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Delivered</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-5 w-5 text-red-500" />
                                  <div>
                                    <p className="text-2xl font-bold text-red-600">
                                      {selectedAnnouncement.announcement_deliveries.filter(d => d.status === 'failed' || d.status === 'bounced').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                  </div>
                                </div>
                                {selectedAnnouncement.announcement_deliveries.filter(d => d.status === 'failed' || d.status === 'bounced').length > 0 && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleResendToFailed(selectedAnnouncement)}
                                    disabled={resending}
                                    className="text-xs"
                                  >
                                    {resending ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      'Retry'
                                    )}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-yellow-500" />
                                <div>
                                  <p className="text-2xl font-bold text-yellow-600">
                                    {selectedAnnouncement.announcement_deliveries.filter(d => d.status === 'pending').length}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Pending</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-blue-500" />
                                <div>
                                  <p className="text-2xl font-bold text-blue-600">
                                    {selectedAnnouncement.announcement_deliveries.length}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Total</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Recipient</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Sent At</TableHead>
                              <TableHead>Error</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getFilteredDeliveries(selectedAnnouncement.announcement_deliveries).map((delivery) => (
                              <TableRow key={delivery.id}>
                                <TableCell>
                                  {delivery.recipient_name || 'Unknown'}
                                </TableCell>
                                <TableCell>{delivery.recipient_email}</TableCell>
                                <TableCell>{getDeliveryStatusBadge(delivery.status)}</TableCell>
                                <TableCell>
                                  {delivery.sent_at 
                                    ? new Date(delivery.sent_at).toLocaleString()
                                    : '-'
                                  }
                                </TableCell>
                                <TableCell>
                                  {delivery.error_message ? (
                                    <div className="max-w-xs">
                                      <p className="text-sm text-red-600 truncate" title={delivery.error_message}>
                                        {delivery.error_message}
                                      </p>
                                    </div>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground mb-4">
                      Select an announcement from the history tab to view detailed delivery tracking.
                    </p>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold">Recent Announcements with Delivery Data:</h4>
                      {announcements
                        .filter(a => a.announcement_deliveries && a.announcement_deliveries.length > 0)
                        .slice(0, 5)
                        .map((announcement) => {
                          const stats = getDeliveryStats(announcement)
                          return (
                            <Card key={announcement.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedAnnouncement(announcement)}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium">{announcement.title}</h5>
                                    <p className="text-sm text-muted-foreground">
                                      {announcement.sent_at 
                                        ? new Date(announcement.sent_at).toLocaleDateString()
                                        : new Date(announcement.created_at).toLocaleDateString()
                                      }
                                    </p>
                                  </div>
                                  {stats && (
                                    <div className="flex gap-4 text-sm">
                                      <span className="text-green-600">✓ {stats.sent}</span>
                                      <span className="text-red-600">✗ {stats.failed}</span>
                                      <span className="text-yellow-600">⏳ {stats.pending}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      
                      {announcements.filter(a => a.announcement_deliveries && a.announcement_deliveries.length > 0).length === 0 && (
                        <p className="text-center py-8 text-muted-foreground">
                          No announcements with delivery data found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resend Dialog */}
        <Dialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Resend Announcement
              </DialogTitle>
              <DialogDescription>
                Choose how you want to resend "{resendingAnnouncement?.title}"
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="resend-failed"
                    checked={resendOptions === 'failed'}
                    onCheckedChange={(checked) => {
                      if (checked) setResendOptions('failed')
                    }}
                  />
                  <Label htmlFor="resend-failed" className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Resend to failed recipients only
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="resend-all"
                    checked={resendOptions === 'all'}
                    onCheckedChange={(checked) => {
                      if (checked) setResendOptions('all')
                    }}
                  />
                  <Label htmlFor="resend-all" className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    Resend to all recipients
                  </Label>
                </div>
              </div>

              {resendingAnnouncement && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Total recipients:</span>
                      <span className="font-medium">
                        {resendingAnnouncement.announcement_deliveries?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1 text-green-600">
                      <span>Successfully delivered:</span>
                      <span className="font-medium">
                        {resendingAnnouncement.announcement_deliveries?.filter(d => d.status === 'sent' || d.status === 'delivered').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Failed deliveries:</span>
                      <span className="font-medium">
                        {resendingAnnouncement.announcement_deliveries?.filter(d => d.status === 'failed' || d.status === 'bounced').length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setResendDialogOpen(false)}
                  disabled={resending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => resendingAnnouncement && handleResendAnnouncement(resendingAnnouncement, resendOptions)}
                  disabled={resending}
                  className="flex items-center gap-2"
                >
                  {resending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Resend Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function AnnouncementsPage() {
  return (
    <AdminProtection>
      <AnnouncementsContent />
    </AdminProtection>
  )
}
