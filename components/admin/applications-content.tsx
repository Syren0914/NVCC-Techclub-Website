"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Loader2, Eye, CheckCircle, XCircle, Clock, Mail, Phone, Github, Linkedin, Calendar, User, GraduationCap, Check, X, Search, Filter, MoreHorizontal, Download, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

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

export function ApplicationsContent() {
  const [applications, setApplications] = useState<MembershipApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<MembershipApplication | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    fetchApplications()
  }, [])
  const router = useRouter()

  const fetchApplications = async () => {
    try {
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
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId
              ? { ...app, status: newStatus }
              : app
          )
        )

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
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('Authentication required. Please sign in.')
        setSendingEmail(false)
        return
      }

      const response = await fetch('/api/admin/send-approval-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ applicationId }),
      })

      if (!response.ok) {
        console.error('Failed to send approval email. Status:', response.status)
      }
    } catch (err) {
      console.error('Error sending approval email:', err)
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
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved':
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case 'rejected':
        return "bg-rose-500/10 text-rose-500 border-rose-500/20"
      default:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
    }
  }

  const handleViewApplication = (application: MembershipApplication) => {
    setSelectedApplication(application)
    setIsDialogOpen(true)
  }

  const getExperienceLevelStyles = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'intermediate':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20'
      case 'advanced':
        return 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = `${app.first_name} ${app.last_name} ${app.email}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-white/20" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">Synchronizing Terminal Data</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filters Header */}
      <div className="p-8 border-b border-white/5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold font-outfit tracking-tight text-white">Membership Applications</h2>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">{applications.length} TOTAL NODES DETECTED</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all"
              onClick={() => router.push("/admin/import-csv")}
            >
              <Download className="size-4 mr-2" />
              Import CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-white transition-colors" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              className="w-full h-12 bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-xl">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === filter 
                    ? "bg-white text-black shadow-lg" 
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 pt-0">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold"
          >
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredApplications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white/[0.02] border border-dashed border-white/5 rounded-[2.5rem]"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">No matching applications found</p>
              </motion.div>
            ) : (
              filteredApplications.map((application, index) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="size-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-2xl font-bold font-outfit text-white/20 group-hover:text-white/40 transition-colors">
                        {application.first_name[0]}{application.last_name[0]}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold font-outfit tracking-tight text-white leading-none">
                            {application.first_name} {application.last_name}
                          </h3>
                          <Badge variant="outline" className={`h-6 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyles(application.status)}`}>
                            {application.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1.5"><Mail className="size-3 text-slate-600" />{application.email}</span>
                          <span className="flex items-center gap-1.5"><GraduationCap className="size-3 text-slate-600" />{application.major}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="size-3 text-slate-600" />{new Date(application.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${getExperienceLevelStyles(application.technical_experience_level)}`}>
                        {application.technical_experience_level}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-11 rounded-xl bg-white/5 border border-white/5 hover:bg-white hover:text-black transition-all"
                          onClick={() => handleViewApplication(application)}
                        >
                          <Eye className="size-4" />
                        </Button>

                        {application.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20"
                              onClick={() => updateApplicationStatus(application.id, 'approved')}
                              disabled={updatingStatus === application.id}
                            >
                              {updatingStatus === application.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Check className="size-5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/0 hover:shadow-rose-500/20"
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              disabled={updatingStatus === application.id}
                            >
                              {updatingStatus === application.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <X className="size-5" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl bg-black/95 backdrop-blur-3xl border border-white/5 p-0 rounded-[2.5rem] shadow-3xl overflow-hidden">
            {selectedApplication && (
              <div className="flex flex-col max-h-[90vh]">
                <div className="p-10 pb-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                      <div className="size-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-bold font-outfit text-white/40">
                        {selectedApplication.first_name[0]}{selectedApplication.last_name[0]}
                      </div>
                      <div className="space-y-1">
                        <DialogTitle className="text-3xl font-bold font-outfit tracking-tight text-white leading-none capitalize">
                          {selectedApplication.first_name} {selectedApplication.last_name}
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                          PENDING ADMISSION GATEWAY
                        </DialogDescription>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className={`h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest ${getStatusStyles(selectedApplication.status)}`}>
                      {selectedApplication.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Email Terminal</p>
                      <p className="text-sm font-medium text-white">{selectedApplication.email}</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Faculty Major</p>
                      <p className="text-sm font-medium text-white">{selectedApplication.major}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                  {/* Status Management */}
                  {selectedApplication.status === 'pending' && (
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">Decision Required</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500">Approve or reject this node profile</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 font-black text-[10px] uppercase tracking-widest px-6 h-12 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20"
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
                          Approve Profile
                        </Button>
                        <Button
                          variant="ghost"
                          className="text-rose-500 font-black text-[10px] uppercase tracking-widest px-6 h-12 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/0 hover:shadow-rose-500/20"
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
                    </div>
                  )}

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Genetic Metadata</h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Frequency</label>
                        <p className="text-sm font-medium text-white capitalize">{selectedApplication.preferred_contact_method || 'email-primary'}</p>
                      </div>
                      {selectedApplication.phone && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Tele-Comms</label>
                          <p className="text-sm font-medium text-white">{selectedApplication.phone}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Class Vector</label>
                        <p className="text-sm font-medium text-white">{selectedApplication.graduation_year || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Experience Index</label>
                        <div className={`w-fit px-3 h-6 rounded-lg text-[9px] font-black uppercase tracking-widest border mt-1 ${getExperienceLevelStyles(selectedApplication.technical_experience_level)}`}>
                          {selectedApplication.technical_experience_level}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical Information */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Cerebral Objectives</h3>
                    <div className="space-y-6">
                      <div className="bg-white/5 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                          <GraduationCap className="size-10" />
                        </div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3">Nodes of Interest</label>
                        <p className="text-sm leading-relaxed text-slate-300 italic font-serif">"{selectedApplication.areas_of_interest}"</p>
                      </div>
                      {selectedApplication.goals && (
                        <div className="bg-white/5 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MoreHorizontal className="size-10" />
                          </div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-3">Strategic Goals</label>
                          <p className="text-sm leading-relaxed text-slate-300 italic font-serif">"{selectedApplication.goals}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  {(selectedApplication.github_username || selectedApplication.linkedin_url) && (
                    <div className="space-y-4 pb-10">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Digital Footprints</h3>
                      <div className="flex gap-4">
                        {selectedApplication.github_username && (
                          <a 
                            href={`https://github.com/${selectedApplication.github_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 h-14 bg-white/5 border border-white/5 rounded-2xl hover:bg-white hover:text-black hover:border-white transition-all group"
                          >
                            <Github className="size-5 opacity-50 group-hover:opacity-100" />
                            <div className="text-left">
                              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">GitHub</p>
                              <p className="text-sm font-bold tracking-tight">{selectedApplication.github_username}</p>
                            </div>
                          </a>
                        )}
                        {selectedApplication.linkedin_url && (
                          <a 
                            href={selectedApplication.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-6 h-14 bg-[#0077b5]/10 border border-[#0077b5]/20 text-[#0077b5] rounded-2xl hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all group"
                          >
                            <Linkedin className="size-5" />
                            <div className="text-left">
                              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">LinkedIn</p>
                              <p className="text-sm font-bold tracking-tight">Access Profile</p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="size-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">Record Created: {new Date(selectedApplication.created_at).toLocaleString()}</span>
                  </div>
                  <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest hover:bg-white/5" onClick={() => setIsDialogOpen(false)}>
                    Close Terminal
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  )
}
