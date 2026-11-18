"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Filter,
  Search,
  Tag,
  Users,
  ArrowRight,
  Video,
  Trophy,
  Laptop,
  Coffee,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Header from "@/components/Header"
import { getAllEvents } from "@/lib/database"
import { Event } from "@/lib/supabase"

export default function EventsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<UIEvent | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [dbStatus, setDbStatus] = useState<{ status: 'loading' | 'success' | 'error'; message: string }>({ status: 'loading', message: 'Checking database connection...' })

  useEffect(() => {
    setMounted(true)
    // checkDatabaseStatus()
    loadEvents()
  }, [])

  // const checkDatabaseStatus = async () => {
  //   try {
  //     const response = await fetch('/api/test-db')
  //     const data = await response.json()
      
  //     if (data.success) {
  //       setDbStatus({ status: 'success', message: `Database connected! Found ${data.eventsCount} events.` })
  //     } else {
  //       setDbStatus({ status: 'error', message: data.error || 'Database connection failed' })
  //     }
  //   } catch (error) {
  //     setDbStatus({ status: 'error', message: 'Failed to test database connection' })
  //   }
  // }

  const loadEvents = async () => {
    try {
      setLoading(true)
      console.log('Loading events...')
      const eventsData = await getAllEvents()
      console.log('Events loaded:', eventsData)
      console.log('Raw event data structure:', eventsData?.[0])
      
      // If no events from database, use fallback data
      if (!eventsData || eventsData.length === 0) {
        console.log('No events found in database, using fallback data')
        const fallbackEvents: Event[] = [
          {
            id: 'fallback-1',
            title: 'Welcome to TechClub!',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Join us for our first meeting of the semester!',
            event_type: 'meeting',
            type: 'Meeting',
            is_online: false,
            location: 'Room 123, Tech Building',
            start_time: '18:00:00',
            image_url: '/tech.jpg',
            created_at: new Date().toISOString()
          },
          {
            id: 'fallback-2',
            title: 'Web Development Workshop',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Learn the basics of HTML, CSS, and JavaScript',
            event_type: 'workshop',
            type: 'Workshop',
            is_online: false,
            location: 'Computer Lab A',
            start_time: '14:00:00',
            image_url: '/web.png',
            created_at: new Date().toISOString()
          }
        ]
        setEvents(fallbackEvents)
      } else {
        setEvents(eventsData)
      }
    } catch (error) {
      console.error('Error loading events:', error)
      // Set empty array to prevent undefined errors
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const eventTypes = ["Workshop", "Hackathon", "Meeting", "Field Trip", "Competition", "Social", "Conference"]

  const locations = ["All Locations", "Tech Building", "Online", "Innovation Hub", "Main Campus", "Off Campus"]

  // Normalize backend events for the UI
  type UIEvent = {
    id: string // Changed from number to string to match database
    title: string
    date: string
    dateObj: Date
    time: string
    location: string
    description: string
    type: string
    isOnline: boolean
    image_url: string
    capacity: number
    registered: number
    tags: string[]
    host: string
    is_featured?: boolean
  }

  const normalizedEvents: UIEvent[] = useMemo(() => {
    console.log('Normalizing events:', events)
    const toDisplayDate = (isoOrDate: string | null | undefined) => {
      if (!isoOrDate) return ""
      const d = new Date(isoOrDate)
      if (isNaN(d.getTime())) return String(isoOrDate)
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    }

    const pickFallbackImage = (type?: string, isOnline?: boolean) => {
      const t = (type || '').toLowerCase()
      if (t.includes('hackathon') || t.includes('competition')) return '/hackathon.jpg'
      if (t.includes('workshop')) return '/web.png'
      if (t.includes('field')) return '/data.png'
      if (t.includes('meeting')) return '/tech.jpg'
      if (t.includes('social')) return '/creative.png'
      if (t.includes('conference') || t.includes('talk')) return '/resources.jpg'
      return isOnline ? '/fullstack.avif' : '/tech.jpg'
    }

    return (events || []).map((e) => {
      const dateObj = e.date ? new Date(e.date) : new Date()
      const anyEvent = e as any
      const dbImage = anyEvent?.image_url || anyEvent?.image
      const imageUrl = typeof dbImage === 'string' && dbImage.length > 0
        ? dbImage
        : pickFallbackImage(e.type, e.is_online)
      
      const normalizedEvent = {
        id: e.id,
        title: e.title,
        date: toDisplayDate(e.date),
        dateObj,
        time: e.time || '',
        location: e.location || 'TBA',
        description: e.description || '',
        type: e.type || 'General',
        isOnline: !!e.is_online,
        image_url: imageUrl,
        capacity: e.capacity || e.max_attendees || 0,
        registered: e.registered || e.current_attendees || 0,
        tags: [e.type || 'General'],
        host: e.host || 'TechClub',
        is_featured: anyEvent?.is_featured || false,
      }
      
      console.log(`Normalizing event "${e.title}":`, {
        original: e,
        normalized: normalizedEvent,
        is_featured: anyEvent?.is_featured
      })
      
      return normalizedEvent
    })
  }, [events])



  const upcomingEvents = useMemo(() => {
    console.log('Filtering upcoming events. Normalized events:', normalizedEvents)
    const filtered = normalizedEvents
      .filter(ev => {
        // Get the current date in local timezone
        const now = new Date()
        const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        // Get the event date in local timezone
        const eventDate = new Date(ev.dateObj)
        const eventLocalDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
        
        const isUpcoming = eventLocalDate >= currentDate
        console.log(`Event "${ev.title}" date: ${ev.dateObj}, eventLocalDate: ${eventLocalDate}, currentDate: ${currentDate}, isUpcoming: ${isUpcoming}`)
        return isUpcoming
      })
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
    console.log('Filtered upcoming events:', filtered)
    return filtered
  }, [normalizedEvents])

  const pastEvents = [
    {
      title: "Spring Hackathon",
      date: "April 10-12, 2025",
      location: "Innovation Hub",
      description: "Our annual 48-hour hackathon with over 100 participants from universities across the region.",
      type: "Hackathon",
      image: "/placeholder.svg?height=300&width=500",
      tags: ["Competition", "All Skills"],
      highlights: "15 projects completed, 3 industry sponsors",
    },
    {
      title: "Intro to Docker Workshop",
      date: "April 5, 2025",
      location: "Tech Building, Room 302",
      description: "Hands-on workshop covering Docker basics, containers, and deployment strategies.",
      type: "Workshop",
      image: "/placeholder.svg?height=300&width=500",
      tags: ["DevOps", "Intermediate"],
      highlights: "35 attendees, 100% positive feedback",
    },
    {
      title: "Tech Talk: Future of AI",
      date: "March 28, 2025",
      location: "Online (Zoom)",
      description:
        "Guest lecture from Dr. Sarah Chen, AI Research Lead at TechCorp, discussing the future of artificial intelligence.",
      type: "Conference",
      image: "/placeholder.svg?height=300&width=500",
      tags: ["AI/ML", "All Levels"],
      highlights: "75 attendees, recording available in resources",
    },
    {
      title: "Game Development Workshop Series",
      date: "March 1-22, 2025",
      location: "Tech Building, Room 304",
      description: "Four-week workshop series covering Unity game development from basics to advanced topics.",
      type: "Workshop",
      image: "/placeholder.svg?height=300&width=500",
      tags: ["Game Development", "All Levels"],
      highlights: "40 participants, 12 games created",
    },
  ]

  // Filter events based on search query and filters
  const filteredEvents = upcomingEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(event.type)

    const matchesLocation =
      selectedLocation === "" ||
      selectedLocation === "All Locations" ||
      (selectedLocation === "Online" && event.isOnline) ||
      (!event.isOnline && event.location.includes(selectedLocation))

    return matchesSearch && matchesType && matchesLocation
  })

  const toggleEventType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const featuredEvents = upcomingEvents.filter(event => event.is_featured).slice(0, 3)
  console.log('Featured events:', featuredEvents, 'from upcoming events:', upcomingEvents)

  return (
    <>
      {/* <Header /> */}
      <main className="flex-1">
        {/* Debug Status Banner */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className={`p-4 text-sm font-mono ${
            dbStatus.status === 'success' ? 'bg-green-100 text-green-800 border-b border-green-200' :
            dbStatus.status === 'error' ? 'bg-red-100 text-red-800 border-b border-red-200' :
            'bg-yellow-100 text-yellow-800 border-b border-yellow-200'
          }`}>
            <strong>DB Status:</strong> {dbStatus.message}
            {dbStatus.status === 'error' && (
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkDatabaseStatus}
                  className="mr-2"
                >
                  Retry Connection
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('/admin/database-setup', '_blank')}
                >
                  Database Setup
                </Button>
              </div>
            )}
          </div>
        )} */}

        {/* Hero Section */}
        <section className="w-full py-20 md:py-28 overflow-hidden bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                  Events & Meetings
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Join Us In Person & Online</h1>
                <p className="text-lg text-muted-foreground">
                  Discover workshops, hackathons, field trips, and social events. Connect with fellow tech enthusiasts
                  and expand your skills.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="rounded-full">
                    View Calendar
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                  <Button variant="outline" className="rounded-full">
                    Submit Event Idea
                  </Button>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-border/40">
                  <Image
                    src="https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    width={800}
                    height={600}
                    alt="TechClub workshop in progress"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Events</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Don't miss these upcoming highlights from our event calendar.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {loading ? (
                // Loading skeleton for featured events
                Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                      <div className="relative h-48 overflow-hidden bg-muted animate-pulse"></div>
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="mb-4">
                          <div className="h-6 bg-muted rounded mb-2 animate-pulse"></div>
                          <div className="h-6 bg-muted rounded mb-2 animate-pulse"></div>
                          <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
                          <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
                          <div className="h-4 bg-muted rounded mb-4 animate-pulse"></div>
                        </div>
                        <div className="h-16 bg-muted rounded mb-6 animate-pulse"></div>
                        <div className="flex gap-2 mb-4">
                          <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                          <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                          <div className="flex gap-2">
                            <div className="h-9 w-20 bg-muted rounded animate-pulse"></div>
                            <div className="h-9 w-16 bg-muted rounded animate-pulse"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : featuredEvents.length > 0 ? (
                featuredEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={event.image_url || "/placeholder.svg"}
                          alt={event.title}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant={event.isOnline ? "outline" : "secondary"} className="rounded-full">
                            {event.isOnline ? "Online" : "In Person"}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="mb-4">
                          <Badge variant="default" className="rounded-full mb-2">
                            {event.type}
                          </Badge>
                          <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Calendar className="size-4 mr-2" />
                            {event.date}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Clock className="size-4 mr-2" />
                            {event.time}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mb-4">
                            <MapPin className="size-4 mr-2" />
                            {event.location}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 flex-grow line-clamp-3">{event.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {event.tags.map((tag, j) => (
                            <Badge key={j} variant="outline" className="rounded-full">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <Users className="size-4 inline mr-1" />
                            {event.registered}/{event.capacity} registered
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="rounded-full"
                              onClick={() => {
                                setSelectedEvent(event)
                                setIsEventModalOpen(true)
                              }}
                            >
                              Learn More
                            </Button>
                            <Button className="rounded-full">RSVP</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 col-span-3">
                  <p className="text-muted-foreground mb-4">No events available at the moment.</p>
                  <Button variant="outline" className="rounded-full">
                    Check Back Later
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* All Events Section */}
        <section className="w-full py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">All Events</h2>
                  <p className="text-muted-foreground">Browse our upcoming events and meetings</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="rounded-full pl-10"
                    />
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={() => setFilterOpen(!filterOpen)}>
                    <Filter className="size-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card border border-border/40 rounded-lg p-4 mb-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <Tag className="size-4 mr-2" />
                        Event Type
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {eventTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={() => toggleEventType(type)}
                            />
                            <Label htmlFor={`type-${type}`} className="text-sm">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <MapPin className="size-4 mr-2" />
                        Location
                      </h3>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="rounded-full">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      className="rounded-full text-sm"
                      onClick={() => {
                        setSelectedTypes([])
                        setSelectedLocation("")
                        setSearchQuery("")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </motion.div>
              )}

              <Tabs defaultValue="upcoming" className="w-full">
                <div className="flex justify-center mb-8">
                  <TabsList className="rounded-full p-1">
                    <TabsTrigger value="upcoming" className="rounded-full px-6">
                      Upcoming Events
                    </TabsTrigger>
                    <TabsTrigger value="past" className="rounded-full px-6">
                      Past Events
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="upcoming">
                  {loading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">Loading events...</p>
                    </div>
                  ) : filteredEvents.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredEvents.map((event, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        >
                          <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                            <CardContent className="p-6 flex flex-col h-full">
                              <div className="flex justify-between items-start mb-4">
                                <Badge variant={event.isOnline ? "outline" : "secondary"} className="rounded-full">
                                  {event.isOnline ? "Online" : "In Person"}
                                </Badge>
                                <Badge variant="default" className="rounded-full">
                                  {event.type}
                                </Badge>
                              </div>
                              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <Calendar className="size-4 mr-2" />
                                {event.date}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <Clock className="size-4 mr-2" />
                                {event.time}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mb-4">
                                <MapPin className="size-4 mr-2" />
                                {event.location}
                              </div>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[3.6em]">
                                {event.description}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {event.tags.map((tag, j) => (
                                  <Badge key={j} variant="outline" className="rounded-full">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                  <Users className="size-4 inline mr-1" />
                                  {event.registered}/{event.capacity}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    className="rounded-full"
                                    onClick={() => {
                                      setSelectedEvent(event)
                                      setIsEventModalOpen(true)
                                    }}
                                  >
                                    Learn More
                                  </Button>
                                  <Button variant="outline" className="rounded-full">
                                    RSVP
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No events available at the moment.</p>
                      <Button variant="outline" className="rounded-full">
                        Check Back Later
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No events found matching your search criteria.</p>
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          setSelectedTypes([])
                          setSelectedLocation("")
                          setSearchQuery("")
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="past">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {pastEvents.map((event, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                      >
                        <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                          <div className="relative h-40 overflow-hidden">
                            <Image
                              src={event.image || "/placeholder.svg"}
                              alt={event.title}
                              fill
                              className="object-cover transition-transform hover:scale-105 opacity-80"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge variant="outline" className="rounded-full bg-background/80">
                                {event.type}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-4 flex flex-col h-full">
                            <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <Calendar className="size-4 mr-2" />
                              {event.date}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                              <MapPin className="size-4 mr-2" />
                              {event.location}
                            </div>
                            <p className="text-xs text-muted-foreground mb-3 flex-grow line-clamp-2">
                              {event.description}
                            </p>
                            <div className="text-xs font-medium mb-2">Highlights:</div>
                            <p className="text-xs text-muted-foreground">{event.highlights}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>

        {/* Event Types Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">Event Types</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We organize a variety of events to cater to different interests and learning styles.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="size-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                      <Laptop className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Workshops</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Hands-on learning sessions covering specific technical skills, from web development to
                      cybersecurity. Most workshops are beginner-friendly.
                    </p>
                    <Button variant="outline" className="rounded-full mt-auto">
                      View Workshops
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="size-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                      <Trophy className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Hackathons & Competitions</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Intensive events where teams work together to build projects in a limited time. Great for applying
                      skills and networking.
                    </p>
                    <Button variant="outline" className="rounded-full mt-auto">
                      View Competitions
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="size-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                      <Video className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Tech Talks & Conferences</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Presentations from industry professionals, faculty, and student experts on cutting-edge
                      technologies and career insights.
                    </p>
                    <Button variant="outline" className="rounded-full mt-auto">
                      View Tech Talks
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="size-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                      <Coffee className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Social Events & Field Trips</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Networking events, game nights, and visits to tech companies and facilities. Great for building
                      connections and having fun.
                    </p>
                    <Button variant="outline" className="rounded-full mt-auto">
                      View Social Events
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Host an Event Section */}
        <section className="w-full py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold tracking-tight">Host Your Own Event</h2>
                <p className="text-lg text-muted-foreground">
                  Have an idea for a workshop, talk, or activity? We welcome event proposals from all members. We can
                  help with planning, promotion, and resources.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <Calendar className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold">Event Planning Support</h3>
                      <p className="text-muted-foreground">We'll help you schedule, organize, and promote your event</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <MapPin className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold">Venue Arrangements</h3>
                      <p className="text-muted-foreground">Access to campus rooms and online meeting platforms</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <Users className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold">Audience Building</h3>
                      <p className="text-muted-foreground">
                        Reach our community of tech enthusiasts interested in your topic
                      </p>
                    </div>
                  </div>
                </div>
                <Button className="rounded-full">
                  Submit Event Proposal
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-border/40">
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    width={800}
                    height={600}
                    alt="TechClub member presenting at a workshop"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Never Miss an Event</h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Join our mailing list to receive weekly updates about upcoming events, workshops, and opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="rounded-full">
                  Subscribe to Updates
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full bg-transparent border-white text-white hover:bg-white/10"
                >
                  Add to Calendar
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title || 'Event Details'}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.type} • {selectedEvent?.isOnline ? 'Online' : 'In Person'}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="relative w-full h-56 overflow-hidden rounded-md border">
                <Image
                  src={selectedEvent.image_url || '/placeholder.svg'}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-muted-foreground"><Calendar className="size-4 mr-2" /> {selectedEvent.date}</div>
                <div className="flex items-center text-muted-foreground"><Clock className="size-4 mr-2" /> {selectedEvent.time || 'TBA'}</div>
                <div className="flex items-center text-muted-foreground md:col-span-2"><MapPin className="size-4 mr-2" /> {selectedEvent.location}</div>
              </div>
              <p className="text-sm leading-6">{selectedEvent.description || 'No description provided.'}</p>
              {selectedEvent.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedEvent.tags.map((t, idx) => (
                    <Badge key={idx} variant="outline" className="rounded-full">{t}</Badge>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEventModalOpen(false)
                    setSelectedEvent(null)
                  }}
                  className="rounded-full"
                >
                  Close
                </Button>
                <Button className="rounded-full">RSVP</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </>
  )
}

