"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Check,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Calendar,
  Code,
  Shield,
  Gamepad,
  Cpu,
  Users,
  MessageSquare,
  Github,
  ExternalLink,
  MapPin,
  Clock,
  Video,
  Server,
  FileCode,
  Terminal,
  Laptop,
  Coffee,
  Zap,
  Mail,
  Bot,
  CalendarFold,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getTeamMembers, getUpcomingEvents, getFeaturedEvent, getProjectsByCategory } from "@/lib/database"
import { useMembership } from "@/hooks/use-membership"
import { TeamMember, Event, Project } from "@/lib/supabase"
import { validateEmailDomain, getEmailDomainError } from "@/lib/auth"
import Header from "@/components/Header"
import DarkVeil from "./components/DarkVeil/DarkVeil"
import LightRays from "./components/LightRays/LightRays"

export default function ClubHomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  
  // Database state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Support form state
  const [supportFormData, setSupportFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [supportStatus, setSupportStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [supportMessage, setSupportMessage] = useState('')

  const getEventImage = (type?: string, isOnline?: boolean) => {
    const t = (type || '').toLowerCase()
    if (t.includes('hackathon') || t.includes('competition')) return '/hackathon.jpg'
    if (t.includes('workshop')) return '/web.png'
    if (t.includes('field')) return '/data.png'
    if (t.includes('meeting')) return '/tech.jpg'
    if (t.includes('social')) return '/creative.png'
    if (t.includes('conference') || t.includes('talk')) return '/resources.jpg'
    return isOnline ? '/fullstack.avif' : '/tech.jpg'
  }

  const getEventImageFromRecord = (ev: Event) => {
    const anyEv = ev as any
    const dbImage = anyEv?.image_url || anyEv?.image
    if (typeof dbImage === 'string' && dbImage.length > 0) return dbImage
    return getEventImage(ev.type, (ev as any)?.is_online)
  }
  
  // Membership form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    major: '',
    areas_of_interest: ''
  })
  
  const { isSubmitting, submitStatus, errorMessage, submitApplication, resetStatus } = useMembership()

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSupportStatus('submitting')
    setSupportMessage('')

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supportFormData),
      })

      const data = await response.json()

      if (response.ok) {
        setSupportStatus('success')
        setSupportMessage('Thank you! Your message has been sent successfully.')
        setSupportFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setSupportStatus('error')
        setSupportMessage(data.error || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      setSupportStatus('error')
      setSupportMessage('Network error. Please check your connection and try again.')
    }
  }

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
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

  const projectCategories = [
    {
      title: "Web Development",
      description: "Building modern web applications using React, Next.js, and other cutting-edge technologies.",
      icon: <Code className="size-5" />,
      projects: [
        {
          name: "Club Website",
          description: "Our own website built with Next.js and Tailwind CSS.",
          link: "https://github.com/techclub/website",
        },
        {
          name: "Student Portal",
          description: "A portal for students to access resources and track their progress.",
          link: "https://github.com/techclub/student-portal",
        },
      ],
    },
    
    {
      title: "Game Development",
      description: "Creating games using Unity, Unreal Engine, and web-based game frameworks.",
      icon: <Gamepad className="size-5" />,
      projects: [
        {
          name: "2D Platformer",
          description: "A 2D platformer game built with Unity.",
          link: "https://github.com/techclub/2d-platformer",
        },
        {
          name: "Browser Game",
          description: "A browser-based game using JavaScript and HTML5 Canvas.",
          link: "https://github.com/techclub/browser-game",
        },
      ],
    },
    {
      title: "Robotics",
      description: "Building and programming robots for various competitions and projects.",
      icon: <Cpu className="size-5" />,
      projects: [
        {
          name: "Autonomous Robot",
          description: "An autonomous robot that can navigate through obstacles.",
          link: "https://github.com/techclub/autonomous-robot",
        },
        {
          name: "Drone Project",
          description: "A custom-built drone with programmable flight patterns.",
          link: "https://github.com/techclub/drone-project",
        },
      ],
    },
    {
      title: "Cybersecurity",
      description: "Learning ethical hacking, penetration testing, and security best practices.",
      icon: <Shield className="size-5" />,
      projects: [
        {
          name: "CTF Challenges",
          description: "Capture the Flag challenges for members to practice security skills.",
          link: "https://github.com/techclub/ctf-challenges",
        },
        {
          name: "Security Scanner",
          description: "A tool to scan websites for common security vulnerabilities.",
          link: "https://github.com/techclub/security-scanner",
        },
      ],
    },
  ]

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        const [members, events, featured, webProjects] = await Promise.all([
          getTeamMembers(),
          getUpcomingEvents(),
          getFeaturedEvent(),
          getProjectsByCategory('Web Development')
        ])
        
        setTeamMembers(members)
        setUpcomingEvents(events)
        setFeaturedEvent(featured)
        setProjects(webProjects)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])



  const resources = [
    {
      category: "Cybersecurity",
      items: [
        {
          title: "Ethical Hacking Guide",
          description: "A comprehensive guide to ethical hacking methodologies and tools.",
          link: "/resources/ethical-hacking",
          icon: <Shield className="size-4" />,
        },
        {
          title: "Reverse Engineering Basics",
          description: "Learn how to analyze and understand compiled programs.",
          link: "/resources/reverse-engineering",
          icon: <FileCode className="size-4" />,
        },
      ],
    },
    {
      category: "Web Development",
      items: [
        {
          title: "Full-Stack Development Tutorial",
          description: "Step-by-step guide to building a complete web application.",
          link: "/resources/fullstack-tutorial",
          icon: <Code className="size-4" />,
        },
        {
          title: "API Design Best Practices",
          description: "Learn how to design robust and scalable APIs.",
          link: "/resources/api-design",
          icon: <Server className="size-4" />,
        },
      ],
    },
    {
      category: "Career Development",
      items: [
        {
          title: "LaTeX for Tech Resumes",
          description: "Create professional resumes using LaTeX templates.",
          link: "/resources/latex-resumes",
          icon: <FileCode className="size-4" />,
        },
        {
          title: "Technical Interview Prep",
          description: "Practice problems and strategies for technical interviews.",
          link: "/resources/interview-prep",
          icon: <Terminal className="size-4" />,
        },
      ],
    },
  ]
  

  return (
    <div className="flex min-h-[100dvh] flex-col">
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-44 pb-20 md:pt-52 md:pb-32 lg:pt-48 lg:pb-10 overflow-hidden relative">
          {/* LightRays Background - Full Coverage */}
          <div className="absolute inset-0 -z-20 pointer-events-none" style={{ minHeight: '100vh' }}>
            {/* <LightRays
              raysOrigin="top-center"
              raysColor="#00ffff"
              raysSpeed={1.5}
              lightSpread={0.8}
              rayLength={1.2}
              followMouse={true}
              mouseInfluence={0.1}
              noiseAmount={0.1}
              distortion={0.05}
              className="w-full h-full"
              zIndex="-z-10"
            /> */}
            {/* Debug Info */}
            <div className="absolute top-4 left-4 text-white bg-black p-2 rounded text-xs z-10">
              LightRays Container - Should be visible
            </div>
            <div className="absolute top-4 right-4 text-white bg-black p-2 rounded text-xs z-10">
              Position: absolute inset-0
            </div>
          </div>
          
          {/* Grid Pattern Background */}
          <div className="absolute inset-0 -z-1 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
          
          <div className="container px-4 md:px-6 relative">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12 py-10"
            >
              <Badge className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Est. 2020
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Welcome to TechClub
                <br />
                NVCC
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A community of tech enthusiasts exploring web development, cybersecurity, game development, and
                robotics. Join us to learn, build, and grow together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={"/join"}>
                  <Button size="lg" className="rounded-full h-12 px-8 text-base">
                    Join Our Community
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </Link>
                
                <Link href={"/projects"}>
                  <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base">
                    Explore Projects
                  </Button>
                </Link>
              </div>
              <Link href={"/conference"}>
                  <Button size="lg" variant='outline' className="rounded-full h-12 mt-4 px-8 text-base">
                  
                  <CalendarFold className="size-4 ml-2" />
                    Join the Conference
                    {/* <ChevronRight className="ml-2 size-4" /> */}
                  </Button>
                </Link>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>Weekly Meetings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>Hands-on Workshops</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>Open to All Skill Levels</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-5xl"
            >
              <div className="rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20">
                <Image
                  src="/loundon.jpg"
                  width={1280}
                  height={720}
                  alt="TechClub members collaborating on a project"
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70"></div>
              <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70"></div>
            </motion.div>
          </div>
        </section>

        {/* Featured Event Banner */}
        {featuredEvent && (
          <section className="w-full py-8 bg-primary text-primary-foreground">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Calendar className="size-8 md:size-10" />
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">Upcoming: {featuredEvent?.title}</h2>
                    <p className="text-primary-foreground/80">{new Date(featuredEvent?.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })} • {featuredEvent?.location}</p>
                  </div>
                </div>
                <Button variant="secondary" className="rounded-full whitespace-nowrap">
                  Register Now
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* About Us Section */}
        <section id="about" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                About Us
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Mission & History</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Founded in 2020, TechClub brings together students passionate about technology to learn, collaborate,
                and build amazing projects.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="rounded-xl overflow-hidden shadow-lg border border-border/40">
                  <Image
                    src="/about.jpg"
                    width={500}
                    height={400}
                    alt="TechClub team at a hackathon"
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-3">Our Story</h3>
                  <p className="text-muted-foreground">
                    TechClub started as a small group of computer science students who wanted to explore technology
                    beyond the classroom. What began as informal study sessions has grown into a thriving community of
                    over 300 members from diverse backgrounds and majors.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
                  <p className="text-muted-foreground">
                    We aim to foster a collaborative environment where members can develop technical skills, work on
                    meaningful projects, and build connections with like-minded individuals. We believe in learning by
                    doing and sharing knowledge freely.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Meeting Schedule</h3>
                  <div className="flex items-start gap-2">
                    <Clock className="size-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">General Meetings: Thursday, 2:30 PM - 4:00 PM</p>
                      <p className="text-sm text-muted-foreground">LC Building, LC Room 302E</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mt-2">
                    <Video className="size-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Online Workshops: Coming Soon... </p>
                      <p className="text-sm text-muted-foreground">Via Zoom (link shared with members)</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Team Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-24 text-center"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-12">Meet Our Team</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {teamMembers.map((member, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex flex-col items-center"
                  >
                    <Avatar className="size-24 mb-4">
                      <AvatarImage src={member.image} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h4 className="font-bold">{member.name}</h4>
                    <p className="text-sm text-primary">{member.role}</p>
                    <p className="text-xs text-muted-foreground mt-2">{member.bio}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Projects & Initiatives Section */}
        <section id="projects" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Projects & Initiatives
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What We're Building</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Our members work on a variety of projects across different domains of technology. Join a project team or
                start your own!
              </p>
            </motion.div>

            <Tabs defaultValue="web" className="w-full">
              <div className="flex justify-center mb-8 overflow-x-auto pb-2">
                <TabsList className="rounded-full p-1">
                  <TabsTrigger value="web" className="rounded-full px-4">
                    Web Development
                  </TabsTrigger>
                  <TabsTrigger value="cybersecurity" className="rounded-full px-4">
                    Cybersecurity
                  </TabsTrigger>
                  <TabsTrigger value="game" className="rounded-full px-4">
                    Game Development
                  </TabsTrigger>
                  <TabsTrigger value="robotics" className="rounded-full px-4">
                    Robotics
                  </TabsTrigger>
                </TabsList>
              </div>

              {projectCategories.map((category, i) => (
                <TabsContent key={i} value={category.title.toLowerCase().split(" ")[0]}>
                  <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="space-y-4"
                    >
                      <div className="size-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                        {category.icon}
                      </div>
                      <h3 className="text-2xl font-bold">{category.title}</h3>
                      <p className="text-muted-foreground">{category.description}</p>
                      <Link href={"/join"}>
                        <Button variant="outline" className="rounded-full mt-4">
                          Join This Team
                        </Button>
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="space-y-4"
                    >
                      <h4 className="font-bold text-lg">Current Projects</h4>
                      {category.projects.map((project, j) => (
                        <Card
                          key={j}
                          className="overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur"
                        >
                          <CardContent className="p-6">
                            <h5 className="font-bold mb-2">{project.name}</h5>
                            <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                            <Link
                              href={project.link}
                              className="flex items-center text-sm text-primary hover:underline"
                              target="_blank"
                            >
                              <Github className="size-4 mr-1" />
                              View on GitHub
                              <ExternalLink className="size-3 ml-1" />
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </motion.div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Events & Meetings Section */}
        <section id="events" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Events & Meetings
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Join Us In Person & Online</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                We host regular meetings, workshops, and special events throughout the year. Check out what's coming up!
              </p>
            </motion.div>
            

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {upcomingEvents.map((event, i) => (
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
                        src={getEventImageFromRecord(event)}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={event.is_online ? 'outline' : 'secondary'} className="rounded-full">
                          {event.is_online ? 'Online' : 'In Person'}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <span></span>
                        <Badge variant="outline" className="rounded-full">
                          {event.type}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="size-4 mr-2" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Clock className="size-4 mr-2" />
                        {new Date(event.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}

                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <MapPin className="size-4 mr-2" />
                        {event.location}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 min-h-[3.6em]">{event.description}</p>
                      {/* min-h ensures consistent height for 3 lines (approx 1.2em * 3) */}
                      <div className="flex gap-2 mt-auto">
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <Button variant="outline" className="rounded-full">
                <Link href={"/events"}>View All Events</Link>
                
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Resources & Tutorials Section */}
        <section id="resources" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Resources & Tutorials
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Learn & Grow</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Access our collection of tutorials, guides, and resources to help you develop your skills.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {resources.map((category, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                    <CardHeader>
                      <CardTitle>{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-3">
                          <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <Link href={item.link} className="font-medium hover:text-primary transition-colors">
                              {item.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full rounded-full" asChild>
                        <Link href={`/resources/${category.category.toLowerCase().replace(/\s+/g, "-")}`}>
                          View All {category.category} Resources
                          <ChevronRight className="ml-1 size-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community & Engagement Section */}
        <section id="community" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Community & Engagement
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Connect With Us</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Join our online communities to stay connected, ask questions, and collaborate with other members.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="size-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                      <MessageSquare className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Discord Community</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Join our active Discord server to chat with other members, get help with projects, and stay
                      updated on club activities.
                    </p>
                    <Button className="rounded-full mt-auto">
                      Join Discord
                      <ExternalLink className="ml-2 size-4" />
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
                      <Gamepad className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Minecraft Server</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Relax and have fun on our Minecraft server where members build amazing structures and experiment
                      with redstone creations.
                    </p>
                    <Button variant="outline" className="rounded-full mt-auto">
                      Server Details
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
                      <Users className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Affiliated Clubs</h3>
                    <p className="text-muted-foreground mb-4">We collaborate with other campus clubs:</p>
                    <ul className="space-y-2 mb-6 flex-grow">
                      <li className="flex items-center gap-2">
                        <Coffee className="size-4 text-primary" />
                        <span>Entrepreneurship Society</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Laptop className="size-4 text-primary" />
                        <span>Data Science Club</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="size-4 text-primary" />
                        <span>Engineering Club</span>
                      </li>
                    </ul>
                    <Button variant="outline" className="rounded-full mt-auto">
                      View Partnerships
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section id="support" className="w-full py-20 md:py-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          
          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-6 text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Need Help? We're Here!</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Have a question about TechClub, our events, or just want to learn more? Reach out to us and we'll get back to you as soon as possible.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold">Get in Touch</h3>
                <p className="text-muted-foreground">
                  Whether you're a current member, prospective member, or just curious about what we do, we'd love to hear from you!
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageSquare className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Quick Questions</p>
                      <p className="text-sm text-muted-foreground">
                        Get answers about events, workshops, or membership
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Join Our Community</p>
                      <p className="text-sm text-muted-foreground">
                        Learn how to become a member and get involved
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="size-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Event Information</p>
                      <p className="text-sm text-muted-foreground">
                        Details about upcoming workshops and activities
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="font-medium mb-2">Other Ways to Connect</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4" />
                    <span>nvcctechclub@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1 text-muted-foreground">
                    <MessageSquare className="size-4" />
                    <span>Discord: TechClub Community</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleSupportSubmit}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <input
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            placeholder="Your name"
                            value={supportFormData.name}
                            onChange={(e) => setSupportFormData({...supportFormData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <input
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            placeholder="your.email@example.com"
                            type="email"
                            value={supportFormData.email}
                            onChange={(e) => setSupportFormData({...supportFormData, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <input
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          placeholder="What's your question about?"
                          value={supportFormData.subject}
                          onChange={(e) => setSupportFormData({...supportFormData, subject: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <textarea
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
                          placeholder="Tell us more about your question or how we can help..."
                          value={supportFormData.message}
                          onChange={(e) => setSupportFormData({...supportFormData, message: e.target.value})}
                          required
                        />
                      </div>
                      
                      {supportStatus === 'success' && (
                        <div className="text-green-600 text-sm text-center bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                          {supportMessage}
                        </div>
                      )}
                      {supportStatus === 'error' && (
                        <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                          {supportMessage}
                        </div>
                      )}
                      
                      <Button 
                        type="submit"
                        className="w-full rounded-full"
                        disabled={supportStatus === 'submitting'}
                      >
                        {supportStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact & Membership Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-6 text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">Ready to Join TechClub?</h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                Become a member today and get access to all our resources, events, and a community of tech enthusiasts.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-bold">Membership Benefits</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="size-5 text-white mt-0.5" />
                    <div>
                      <p className="font-medium">Access to All Workshops & Events</p>
                      <p className="text-sm text-primary-foreground/80">
                        Including special workshops with industry professionals
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="size-5 text-white mt-0.5" />
                    <div>
                      <p className="font-medium">Project Collaboration Opportunities</p>
                      <p className="text-sm text-primary-foreground/80">
                        Work with other members on exciting tech projects
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="size-5 text-white mt-0.5" />
                    <div>
                      <p className="font-medium">Networking with Industry Partners</p>
                      <p className="text-sm text-primary-foreground/80">
                        Connect with tech companies and potential employers
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="size-5 text-white mt-0.5" />
                    <div>
                      <p className="font-medium">Exclusive Online Resources</p>
                      <p className="text-sm text-primary-foreground/80">
                        Access our library of tutorials, code samples, and more
                      </p>
                    </div>
                  </li>
                </ul>
                <div className="pt-4">
                  <p className="font-medium mb-2">Contact Us</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="size-4" />
                    <span>nvcctechclub@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <MessageSquare className="size-4" />
                    <span>Discord: TechClub Community</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border-white/20 bg-black backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-white">Contact TechClub</CardTitle>
                    <CardDescription className="text-white/80"> Have a question? Fill out this form to contact TechClub</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault()
                      
                      // Validate email domain
                      if (!validateEmailDomain(formData.email)) {
                        // This will be handled by the useMembership hook
                        submitApplication(formData)
                        return
                      }
                      
                      submitApplication(formData)
                    }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">First Name</label>
                          <input
                            className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                            placeholder="John"
                            value={formData.first_name}
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white">Last Name</label>
                          <input
                            className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                            placeholder="Doe"
                            value={formData.last_name}
                            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Email</label>
                        <input
                          className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                          placeholder="your.name@email.vccs.edu"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                        <p className="text-xs text-white/70">
                          Must be a valid @email.vccs.edu address
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Major/Field of Study</label>
                        <input
                          className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                          placeholder="Computer Science"
                          value={formData.major}
                          onChange={(e) => setFormData({...formData, major: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Areas of Interest</label>
                        <select 
                          className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                          value={formData.areas_of_interest}
                          onChange={(e) => setFormData({...formData, areas_of_interest: e.target.value})}
                          required
                        >
                          <option value="" className="bg-background text-foreground">
                            Select an option
                          </option>
                          <option value="Web Development" className="bg-background text-foreground">
                            Web Development
                          </option>
                          <option value="Cybersecurity" className="bg-background text-foreground">
                            Cybersecurity
                          </option>
                          <option value="Game Development" className="bg-background text-foreground">
                            Game Development
                          </option>
                          <option value="Robotics" className="bg-background text-foreground">
                            Robotics
                          </option>
                          <option value="Multiple Areas" className="bg-background text-foreground">
                            Multiple Areas
                          </option>
                        </select>
                      </div>
                      {submitStatus === 'success' && (
                        <div className="text-green-400 text-sm text-center">
                          Application submitted successfully!
                        </div>
                      )}
                      {submitStatus === 'error' && (
                        <div className="text-red-400 text-sm text-center">
                          {errorMessage}
                        </div>
                      )}
                      <Button 
                        type="submit"
                        className="w-full rounded-full bg-black text-black text-primary hover:bg-white hover:text-black"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title || 'Event Details'}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.type} • {selectedEvent?.is_online ? 'Online' : 'In Person'}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-muted-foreground"><Calendar className="size-4 mr-2" /> {selectedEvent.date}</div>
                <div className="flex items-center text-muted-foreground"><Clock className="size-4 mr-2" /> {selectedEvent.time || 'TBA'}</div>
                <div className="flex items-center text-muted-foreground md:col-span-2"><MapPin className="size-4 mr-2" /> {selectedEvent.location}</div>
              </div>
              <p className="text-sm leading-6">{selectedEvent.description || 'No description provided.'}</p>
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
      <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
        <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold">
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                  <Image src={"/tech.jpg"} alt={""} width={100} height={100}></Image>
                  
                </div>
                <span>TechClub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A community of tech enthusiasts exploring web development, cybersecurity, game development, and
                robotics.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="size-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#projects" className="text-muted-foreground hover:text-foreground transition-colors">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link href="#events" className="text-muted-foreground hover:text-foreground transition-colors">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="#resources" className="text-muted-foreground hover:text-foreground transition-colors">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    GitHub Repositories
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Discord Community
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Code of Conduct
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 pt-8">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} TechClub. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">Made with ❤️ by TechClub Web Team</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

