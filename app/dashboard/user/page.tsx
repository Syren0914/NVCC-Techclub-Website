"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Code, 
  Trophy,
  BookOpen,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  Target,
  Award,
  CheckCircle,
  Star,
  ExternalLink,
  Zap,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Heart,
  MessageCircle,
  CalendarDays,
  BarChart3,
  Activity,
  Users2,
  BookMarked,
  Lightbulb,
  GitBranch,
  Globe,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Play,
  UserPlus,
  CheckCircle2,
  Clock3,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase, signOut, getCurrentUser, getUserProfile } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import AddProjectModal from "@/components/add-project-modal"
import AddEventModal from "@/components/add-event-modal"
import AddResourceModal from "@/components/add-resource-modal"

interface UserDashboardData {
  userProfile: any
  upcomingEvents: any[]
  upcomingWorkshops: any[]
  userProjects: any[]
  userResources: any[]
  notifications: any[]
  activities: any[]
  quickStats: any
  databaseStatus: any
}

export default function UserDashboardPage() {
  const [data, setData] = useState<UserDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [databaseStatus, setDatabaseStatus] = useState<any>(null)
  
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/database-test')
      const result = await response.json()
      setDatabaseStatus(result.data)
    } catch (error) {
      console.error('Database status check failed:', error)
    }
  }

  const loadDashboardData = async () => {
    try {
      console.log('🔄 Loading user dashboard data...')
      const user = await getCurrentUser()
      console.log('👤 Current user:', user)
      
      if (!user) {
        console.log('❌ No user found, redirecting to login')
        router.push("/login")
        return
      }

      console.log('🔄 Fetching dashboard data from backend...')
      
      // Fetch all dashboard data from backend API
      const response = await fetch(`/api/dashboard?userId=${user.id}`)
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Dashboard data loaded from backend')
        setData(result.data)
      } else {
        console.error('❌ Error loading dashboard data:', result.error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('🚨 Error loading dashboard:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleJoinDiscord = () => {
    window.open("https://discord.gg/pwcdweEwjM", "_blank")
    toast({
      title: "Discord Invitation",
      description: "Opening Discord community invitation...",
    })
  }

  const handleRefreshData = () => {
    loadDashboardData()
    checkDatabaseStatus()
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load dashboard</p>
          <Button onClick={loadDashboardData} className="mt-4">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
              <Code className="size-4" />
            </div>
            <div>
              <span className="font-bold text-lg">My Dashboard</span>
              <p className="text-xs text-muted-foreground">Welcome back, {data.userProfile?.first_name || 'Member'}!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Database Status Indicator */}
            {databaseStatus && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${databaseStatus.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {databaseStatus.status === 'healthy' ? 'Connected' : 'Issues'}
                </span>
              </div>
            )}
            
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                placeholder="Search dashboard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-4" />
              {data.notifications.filter(n => !n.read).length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  {data.notifications.filter(n => !n.read).length}
                </Badge>
              )}
            </Button>
            
            {/* Discord Button */}
            <Button 
              onClick={handleJoinDiscord}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
              size="sm"
            >
              <MessageSquare className="size-4 mr-2" />
              Join Discord
            </Button>
            
            {/* User Menu */}
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarImage src={data.userProfile?.avatar_url} />
                <AvatarFallback>{data.userProfile?.first_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-4 py-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Database Status Alert */}
          {databaseStatus && databaseStatus.status !== 'healthy' && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Some database connections have issues. Some features may not work properly. 
                <Button variant="link" className="p-0 h-auto text-orange-800 underline" onClick={checkDatabaseStatus}>
                  Check again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Quick Stats */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{data.quickStats?.totalMembers || 0}</p>
                    <p className="text-sm text-muted-foreground">Club Members</p>
                    <p className="text-xs text-green-600 mt-1">Active community</p>
                  </div>
                  <Users2 className="size-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{data.userProjects?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">My Projects</p>
                    <p className="text-xs text-blue-600 mt-1">Active development</p>
                  </div>
                  <GitBranch className="size-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{data.upcomingEvents?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Upcoming Events</p>
                    <p className="text-xs text-purple-600 mt-1">Get involved</p>
                  </div>
                  <CalendarDays className="size-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{data.userResources?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Learning Resources</p>
                    <p className="text-xs text-orange-600 mt-1">Keep learning</p>
                  </div>
                  <BookMarked className="size-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content with Enhanced Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="community">Community</TabsTrigger>
                </TabsList>

                {/* Enhanced Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Welcome Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-green-600" />
                        Welcome to TechClub!
                      </CardTitle>
                      <CardDescription>
                        Here's what's happening in your community
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2">Quick Actions</h3>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowEventModal(true)}>
                              <Plus className="size-4 mr-2" />
                              Create Event
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowProjectModal(true)}>
                              <Code className="size-4 mr-2" />
                              Start Project
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setShowResourceModal(true)}>
                              <BookOpen className="size-4 mr-2" />
                              Share Resource
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2">Community</h3>
                          <div className="space-y-2">
                            <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleJoinDiscord}>
                              <MessageSquare className="size-4 mr-2" />
                              Join Discord
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                              <Link href="/community">
                                <Users className="size-4 mr-2" />
                                Community Page
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                              <Link href="/leetcode">
                                <Code className="size-4 mr-2" />
                                Practice Coding
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="size-5" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {data.activities?.length > 0 ? (
                        data.activities.map((activity) => (
                          <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Avatar className="size-8">
                              <AvatarImage src={activity.avatar} />
                              <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.user}</p>
                              <p className="text-xs text-muted-foreground">
                                {activity.action} {activity.target}
                              </p>
                            </div>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="size-12 mx-auto mb-4 opacity-50" />
                          <p>No recent activity</p>
                          <p className="text-sm">Start participating to see activity here!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Upcoming Events Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="size-5" />
                          Upcoming Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {data.upcomingEvents?.length > 0 ? (
                          data.upcomingEvents.map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {event.date} • {event.time}
                                </p>
                                <p className="text-xs text-muted-foreground">{event.attendees} attendees</p>
                              </div>
                              <Badge variant="secondary">{event.type}</Badge>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <p className="text-sm">No upcoming events</p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowEventModal(true)}>
                              Create Event
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="size-5" />
                          My Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {data.userProjects?.length > 0 ? (
                          data.userProjects.map((project) => (
                            <div key={project.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium">{project.name}</p>
                                <Badge variant={project.priority === 'high' ? 'destructive' : 'outline'}>
                                  {project.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{project.progress}%</span>
                                </div>
                                <Progress value={project.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground">Due: {project.deadline}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <p className="text-sm">No projects yet</p>
                            <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowProjectModal(true)}>
                              Start Project
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Events Tab */}
                <TabsContent value="events" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Events & Workshops</h2>
                    <Button onClick={() => setShowEventModal(true)}>
                      <Plus className="size-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="size-5" />
                          Upcoming Workshops
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {data.upcomingWorkshops?.length > 0 ? (
                          data.upcomingWorkshops.map((workshop) => (
                            <div key={workshop.id} className="p-4 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium">{workshop.title}</h3>
                                <Badge variant="outline">{workshop.enrolled}/{workshop.capacity}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {workshop.date} • {workshop.time} • {workshop.duration}min
                              </p>
                              <p className="text-sm text-muted-foreground mb-3">Instructor: {workshop.instructor}</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Enrollment</span>
                                  <span>{Math.round((workshop.enrolled / workshop.capacity) * 100)}%</span>
                                </div>
                                <Progress value={(workshop.enrolled / workshop.capacity) * 100} className="h-2" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <BookOpen className="size-12 mx-auto mb-4 opacity-50" />
                            <p>No upcoming workshops</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="size-5" />
                          Hackathons
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {data.upcomingHackathons?.length > 0 ? (
                          data.upcomingHackathons.map((hackathon) => (
                            <div key={hackathon.id} className="p-4 border rounded-lg">
                              <h3 className="font-medium mb-2">{hackathon.title}</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {hackathon.start_date} - {hackathon.end_date}
                              </p>
                              <p className="text-sm text-muted-foreground mb-3">{hackathon.location}</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Participants</span>
                                  <span>{hackathon.participants}/{hackathon.maxParticipants}</span>
                                </div>
                                <Progress value={(hackathon.participants / hackathon.maxParticipants) * 100} className="h-2" />
                              </div>
                              <div className="mt-3">
                                {hackathon.prizes?.map((prize: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="mr-1">
                                    {prize}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Trophy className="size-12 mx-auto mb-4 opacity-50" />
                            <p>No upcoming hackathons</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">My Projects</h2>
                    <Button onClick={() => setShowProjectModal(true)}>
                      <Plus className="size-4 mr-2" />
                      New Project
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.userProjects?.length > 0 ? (
                      data.userProjects.map((project) => (
                        <Card key={project.id}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>{project.name}</CardTitle>
                              <Badge variant={project.priority === 'high' ? 'destructive' : 'outline'}>
                                {project.priority}
                              </Badge>
                            </div>
                            <CardDescription>{project.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <Progress value={project.progress} className="h-2" />
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Team Members</p>
                              <div className="flex items-center gap-2">
                                {project.team?.map((member: string, index: number) => (
                                  <Avatar key={index} className="size-6">
                                    <AvatarFallback className="text-xs">{member.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Role: {project.role}</span>
                              <span>Due: {project.deadline}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="size-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="size-4 mr-2" />
                                Share
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <Code className="size-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                        <p className="text-muted-foreground mb-4">Start building something amazing!</p>
                        <Button onClick={() => setShowProjectModal(true)}>
                          <Plus className="size-4 mr-2" />
                          Create Your First Project
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Learning Resources</h2>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="size-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowResourceModal(true)}>
                        <Plus className="size-4 mr-2" />
                        Add Resource
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="size-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.userResources?.length > 0 ? (
                      data.userResources.map((resource) => (
                        <Card key={resource.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-medium mb-1">{resource.title}</h3>
                                <p className="text-sm text-muted-foreground mb-2">{resource.category}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{resource.views} views</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="size-3 fill-current text-yellow-400" />
                                    <span>{resource.rating}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline">{resource.category}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Accessed: {resource.accessed_at}</span>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Heart className="size-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <BookMarked className="size-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-12">
                        <BookOpen className="size-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No resources yet</h3>
                        <p className="text-muted-foreground mb-4">Share your knowledge with the community!</p>
                        <Button onClick={() => setShowResourceModal(true)}>
                          <Plus className="size-4 mr-2" />
                          Add Your First Resource
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Community</h2>
                    <Button onClick={handleJoinDiscord}>
                      <MessageSquare className="size-4 mr-2" />
                      Join Discord
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="size-5" />
                          Discord Community
                        </CardTitle>
                        <CardDescription>
                          Join our Discord server for real-time discussions
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2">TechClub Discord</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Connect with fellow developers, share projects, and get help
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Users className="size-4" />
                            <span>215 members online</span>
                          </div>
                          <Button onClick={handleJoinDiscord} className="w-full">
                            <MessageSquare className="size-4 mr-2" />
                            Join Server
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="size-5" />
                          Coding Practice
                        </CardTitle>
                        <CardDescription>
                          Improve your coding skills with LeetCode
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <h3 className="font-medium mb-2">LeetCode Practice</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Solve coding problems and track your progress
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Target className="size-4" />
                            <span>Daily challenges available</span>
                          </div>
                          <Button asChild className="w-full">
                            <Link href="/leetcode">
                              <Play className="size-4 mr-2" />
                              Start Practicing
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="size-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.notifications?.slice(0, 5).map((notification) => (
                    <div key={notification.id} className={`p-3 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="size-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowProjectModal(true)}>
                    <Plus className="size-4 mr-2" />
                    New Project
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowEventModal(true)}>
                    <CalendarDays className="size-4 mr-2" />
                    Create Event
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setShowResourceModal(true)}>
                    <BookOpen className="size-4 mr-2" />
                    Add Resource
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleJoinDiscord}>
                    <MessageSquare className="size-4 mr-2" />
                    Join Discord
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="size-5" />
                    Contact Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="size-4 text-muted-foreground" />
                    <span>techclub@university.edu</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-muted-foreground" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPinIcon className="size-4 text-muted-foreground" />
                    <span>LC Building, Room 302E</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AddProjectModal 
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSuccess={handleRefreshData}
      />
      
      <AddEventModal 
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSuccess={handleRefreshData}
      />
      
      <AddResourceModal 
        isOpen={showResourceModal}
        onClose={() => setShowResourceModal(false)}
        onSuccess={handleRefreshData}
      />
    </div>
  )
} 

