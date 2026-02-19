"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Users, 
  UserCheck, 
  Clock, 
  BarChart3, 
  Calendar,
  GraduationCap,
  Mail,
  QrCode,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ConferenceStats {
  summary: {
    totalRegistrations: number
    checkedInCount: number
    pendingCheckIn: number
    checkInRate: number
  }
  breakdown: {
    majorStats: Record<string, number>
    participationStats: Record<string, number>
    ageStats: Record<string, number>
    registrationsByDay: Record<string, number>
  }
  recentRegistrations: Array<{
    id: string
    name: string
    email: string
    major: string
    age?: number
    participation: string
    checked_in: boolean
    checked_in_at?: string
    created_at: string
    unique_code: string
  }>
  allRegistrations: Array<{
    id: string
    name: string
    email: string
    major: string
    age?: number
    participation: string
    expectations?: string
    checked_in: boolean
    checked_in_at?: string
    created_at: string
    unique_code: string
  }>
}

export default function ConferenceStats() {
  const [stats, setStats] = useState<ConferenceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setError('Authentication required. Please sign in.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/admin/conference-stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Failed to fetch conference statistics')
      }
    } catch (err) {
      setError('Error loading conference statistics')
      console.error('Error fetching conference stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (uniqueCode: string, registrationId: string) => {
    setCheckingIn(registrationId)
    try {
      const response = await fetch('/api/conference/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: uniqueCode,
          check_in: true
        }),
      })

      if (response.ok) {
        // Refresh stats to update check-in status
        fetchStats()
      } else {
        setError('Failed to check in attendee')
      }
    } catch (err) {
      setError('Error checking in attendee')
      console.error('Error checking in:', err)
    } finally {
      setCheckingIn(null)
    }
  }

  const getStatusBadge = (checkedIn: boolean) => {
    return checkedIn ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Checked In
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const downloadQR = (uniqueCode: string, name: string) => {
    const link = document.createElement('a')
    link.href = `/api/conference/qr?code=${uniqueCode}&download=true`
    link.download = `conference-qr-${name.replace(/\s+/g, '-').toLowerCase()}.png`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading conference statistics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!stats) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No conference data available
      </div>
    )
  }

  return (
    <div className="space-y-12 p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Registrations", value: stats.summary.totalRegistrations, icon: Users, color: "text-blue-400" },
          { label: "Checked In", value: stats.summary.checkedInCount, icon: UserCheck, color: "text-emerald-400" },
          { label: "Pending Check-in", value: stats.summary.pendingCheckIn, icon: Clock, color: "text-amber-400" },
          { label: "Check-in Rate", value: `${stats.summary.checkInRate}%`, icon: BarChart3, color: "text-purple-400" }
        ].map((item, i) => (
          <div key={i} className="group relative bg-[#0a0a0a]/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] hover:bg-[#0d0d0d]/60 transition-all duration-500 hover:border-white/10 overflow-hidden">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors`}>
                <item.icon className={`size-5 ${item.color}`} />
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-1 font-outfit tracking-tighter relative z-10">{item.value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed relative z-10">{item.label}</p>
            <div className={`absolute -bottom-2 -right-2 size-24 blur-[60px] opacity-10 rounded-full bg-current pointer-events-none ${item.color}`} />
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-10">
        <div className="flex justify-start">
          <TabsList className="bg-[#0a0a0a]/60 border border-white/5 h-11 p-1 rounded-xl backdrop-blur-xl gap-1">
            <TabsTrigger value="overview" className="rounded-lg px-6 text-[10px] font-black uppercase tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:text-black transition-all">Overview</TabsTrigger>
            <TabsTrigger value="attendees" className="rounded-lg px-6 text-[10px] font-black uppercase tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:text-black transition-all">All Attendees</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg px-6 text-[10px] font-black uppercase tracking-[0.1em] data-[state=active]:bg-white data-[state=active]:text-black transition-all">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Recent Registrations */}
            <div className="lg:col-span-12">
               <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-xl font-bold font-outfit tracking-tight text-white mb-1">Live Feed</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Latest 10 Inbound Registrations</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-3 py-1">Active Monitoring</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {stats.recentRegistrations.map((registration) => (
                    <div key={registration.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all group flex flex-col justify-between h-56">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                           <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center font-bold text-slate-300 text-xs">
                             {registration.name[0].toUpperCase()}
                           </div>
                           {registration.checked_in ? (
                             <UserCheck className="size-4 text-emerald-500" />
                           ) : (
                             <Clock className="size-4 text-slate-600" />
                           )}
                        </div>
                        <p className="font-bold text-slate-100 text-sm font-outfit tracking-tight line-clamp-1">{registration.name}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1 mb-3 line-clamp-1">{registration.major}</p>
                      </div>
                      
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{new Date(registration.created_at).toLocaleDateString()}</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="size-8 p-0 rounded-lg hover:bg-white hover:text-black transition-all">
                              <Eye className="size-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0d0d0d] border-white/10 p-10 rounded-[2.5rem]">
                            <DialogHeader className="mb-8">
                              <DialogTitle className="text-xl font-bold font-outfit text-white uppercase tracking-wider">{registration.name}</DialogTitle>
                              <DialogDescription className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Operator Identity Matrix</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {[
                                { label: "Identifier", val: registration.email },
                                { label: "Discipline", val: registration.major },
                                { label: "Epoch", val: registration.age || 'Not specified' },
                                { label: "Engagement", val: registration.participation },
                                { label: "Validation", val: registration.checked_in ? "Verified" : "Pending" },
                                { label: "Nexus Code", val: registration.unique_code },
                              ].map((field, idx) => (
                                <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{field.label}</span>
                                  <span className="text-xs font-bold text-slate-200">{field.val}</span>
                                </div>
                              ))}
                              {registration.checked_in_at && (
                                <div className="flex justify-between items-center py-3 border-b border-white/5">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Sync Time</span>
                                  <span className="text-xs font-bold text-emerald-500">{new Date(registration.checked_in_at).toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Major Distribution */}
            <div className="lg:col-span-12">
              <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                <div className="mb-10">
                    <h3 className="text-xl font-bold font-outfit tracking-tight text-white mb-1">Discipline Breakdown</h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Population Distribution by Major</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {Object.entries(stats.breakdown.majorStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([major, count]) => (
                    <div key={major} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px] truncate">{major}</span>
                        <span className="text-sm font-bold text-white font-outfit">{count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)] rounded-full transition-all duration-1000" 
                          style={{ width: `${(count / stats.summary.totalRegistrations) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="attendees" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-white/5">
               <h3 className="text-xl font-bold font-outfit text-white mb-1">Personnel Ledger</h3>
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Comprehensive registration matrix ({stats.summary.totalRegistrations} entries)</p>
            </div>
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 h-20 px-10">Operator</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 h-20">Discipline</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 h-20 text-center">Epoch</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 h-20">Status</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 h-20 px-10 text-right">Tactical</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.allRegistrations.map((registration) => (
                  <TableRow key={registration.id} className="border-white/5 hover:bg-white/[0.03] transition-all group h-24">
                    <TableCell className="px-10 font-medium">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-100 font-outfit tracking-tight">{registration.name}</p>
                        <p className="text-[10px] font-medium text-slate-600 tracking-tight">{registration.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-400 uppercase tracking-tight">{registration.major}</TableCell>
                    <TableCell className="text-center font-bold text-slate-200 text-xs font-outfit">{registration.age || '-'}</TableCell>
                    <TableCell>
                      <Badge className={`${registration.checked_in ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-slate-500 border-white/10'} text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg`}>
                        {registration.checked_in ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-10 text-right">
                      <div className="flex justify-end gap-3">
                        {!registration.checked_in && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-10 p-0 rounded-xl bg-emerald-500/5 hover:bg-emerald-500 hover:text-white text-emerald-500 border border-emerald-500/10 transition-all"
                            onClick={() => handleCheckIn(registration.unique_code, registration.id)}
                            disabled={checkingIn === registration.id}
                          >
                            {checkingIn === registration.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-10 p-0 rounded-xl bg-white/5 hover:bg-white hover:text-black border border-white/10 transition-all"
                          onClick={() => downloadQR(registration.unique_code, registration.name)}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="size-10 p-0 rounded-xl bg-white/5 hover:bg-white hover:text-black border border-white/10 transition-all">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0d0d0d] border-white/10 p-10 rounded-[2.5rem]">
                            <div className="space-y-6">
                              {/* Reuse the same detail view from overview */}
                               <div className="flex justify-between items-center py-3 border-b border-white/5">
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Identity</span>
                                 <span className="text-xs font-bold text-slate-200">{registration.name}</span>
                               </div>
                               <div className="flex justify-between items-center py-3 border-b border-white/5">
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact</span>
                                 <span className="text-xs font-bold text-slate-200">{registration.email}</span>
                               </div>
                               {/* ... other fields ... */}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                 <h3 className="text-lg font-bold font-outfit text-white mb-8">Age Demographics</h3>
                 <div className="space-y-6">
                    {Object.entries(stats.breakdown.ageStats).map(([ageGroup, count]) => (
                      <div key={ageGroup} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{ageGroup}</span>
                          <span className="text-xs font-bold text-slate-300 font-outfit">{count} Operators</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500/40 rounded-full transition-all duration-1000" 
                            style={{ width: `${(count / stats.summary.totalRegistrations) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-[#0a0a0a]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                 <h3 className="text-lg font-bold font-outfit text-white mb-8">Participation Vectors</h3>
                 <div className="space-y-6">
                    {Object.entries(stats.breakdown.participationStats).map(([type, count]) => (
                      <div key={type} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{type}</span>
                          <span className="text-xs font-bold text-slate-300 font-outfit">{Math.round((count / stats.summary.totalRegistrations) * 100)}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500/40 rounded-full transition-all duration-1000" 
                            style={{ width: `${(count / stats.summary.totalRegistrations) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
