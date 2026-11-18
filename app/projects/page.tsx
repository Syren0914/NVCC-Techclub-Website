"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ChevronRight,
  Code,
  Shield,
  Gamepad,
  Cpu,
  Github,
  ExternalLink,
  Calendar,
  Users,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Header from "@/components/Header"
import { JoinTeamModal } from "@/components/join-team-modal"
import { supabase } from "@/lib/supabase"

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  github_url?: string
  live_url?: string
  image_url?: string
  status: string
  team_members: string[]
  created_by: string
  created_at: string
  updated_at: string
  category?: string
}

export default function ProjectsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) {
        throw new Error('Failed to fetch projects')
      }
      
      const projectsData = await response.json()
      setProjects(projectsData)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Get all active projects as featured
  const featuredProjects = projects.filter((project) => project.status === 'active')

      return (
      <>
        
        <main className="flex-1">
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
                  Projects
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">What We're Building</h1>
                <p className="text-lg text-muted-foreground">
                  Explore our ongoing projects across web development, cybersecurity, game development, and robotics.
                  Join a team or start your own project!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="rounded-full">
                    Join a Project
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                  <Button variant="outline" className="rounded-full">
                    Propose New Project
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
                    src="https://images.unsplash.com/photo-1630163219451-13a7cff121d0?q=80&w=1198&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    width={800}
                    height={600}
                    alt="TechClub members working on projects"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Projects</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Highlighting some of our most exciting and impactful projects currently in development.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.slice(0, 3).map((project, i) => (
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
                                src={project.image_url || "/placeholder.svg"}
                                alt={project.title}
                                fill
                                className="object-cover transition-transform hover:scale-105"
                              />
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={
                            project.status === "active"
                              ? "default"
                              : project.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                          className="rounded-full"
                        >
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle>{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, j) => (
                          <Badge key={j} variant="outline" className="rounded-full">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="size-4" />
                        <span>{project.team_members.length} team members</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <JoinTeamModal project={project} />
                      <div className="flex gap-2">
                        {project.github_url && (
                          <Button variant="outline" size="sm" className="rounded-full" asChild>
                            <Link href={project.github_url} target="_blank">
                              <Github className="size-4 mr-1" />
                              GitHub
                            </Link>
                          </Button>
                        )}
                        {project.live_url && (
                          <Button size="sm" className="rounded-full" asChild>
                            <Link href={project.live_url} target="_blank">
                              <ExternalLink className="size-4 mr-1" />
                              Live Demo
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Project Categories Section */}
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
                  <h2 className="text-3xl font-bold tracking-tight mb-2">All Projects</h2>
                  <p className="text-muted-foreground">Browse all our projects by category</p>
                </div>
                <div className="w-full md:w-64">
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-full"
                  />
                </div>
              </div>

              <Tabs defaultValue="web" className="w-full">
                <div className="flex justify-center mb-8 overflow-x-auto pb-2">
                  <TabsList className="rounded-full p-1">
                    {/* Show all projects tab */}
                    <TabsTrigger value="all" className="rounded-full px-4">
                      All Projects
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Show all projects */}
                <TabsContent value="all">
                  {filteredProjects.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {filteredProjects.map((project, i) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                          <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                            <div className="relative h-48 overflow-hidden">
                              <Image
                                src={project.image_url || "/placeholder.svg"}
                                alt={project.title}
                                fill
                                className="object-cover transition-transform hover:scale-105"
                              />
                              <div className="absolute top-2 right-2">
                                <Badge
                                  variant={
                                    project.status === "active"
                                      ? "default"
                                      : project.status === "completed"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className="rounded-full"
                                >
                                  {project.status}
                                </Badge>
                              </div>
                            </div>
                            <CardHeader className="pb-2">
                              <CardTitle>{project.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-muted-foreground">{project.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {project.technologies.map((tech, j) => (
                                  <Badge key={j} variant="outline" className="rounded-full">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="size-4" />
                                <span>{project.team_members.length} team members</span>
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                              <JoinTeamModal project={project} />
                              <div className="flex gap-2">
                                {project.github_url && (
                                  <Button variant="outline" size="sm" className="rounded-full" asChild>
                                    <Link href={project.github_url} target="_blank">
                                      <Github className="size-4 mr-1" />
                                      GitHub
                                    </Link>
                                  </Button>
                                )}
                                {project.live_url && (
                                  <Button size="sm" className="rounded-full" asChild>
                                    <Link href={project.live_url} target="_blank">
                                      <ExternalLink className="size-4 mr-1" />
                                      Live Demo
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No projects found matching your search criteria.</p>
                      <Button variant="outline" className="rounded-full" onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>

        {/* Start a Project Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-border/40">
                  <Image
                    src="https://images.unsplash.com/photo-1536148935331-408321065b18?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    width={800}
                    height={600}
                    alt="Students brainstorming project ideas"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold tracking-tight">Start Your Own Project</h2>
                <p className="text-lg text-muted-foreground">
                  Have an idea for a project? We provide resources, mentorship, and a team of collaborators to help
                  bring your vision to life.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <Calendar className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold">Project Proposal Meetings</h3>
                      <p className="text-muted-foreground">
                        Every first Monday of the month at 5:00 PM in Tech Building, Room 302
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <Users className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold">Team Formation</h3>
                      <p className="text-muted-foreground">
                        We'll help you recruit team members with the skills needed for your project
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <Code className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold">Technical Support</h3>
                      <p className="text-muted-foreground">
                        Access to mentors, resources, and infrastructure to support your development
                      </p>
                    </div>
                  </div>
                </div>
                <Button className="rounded-full">
                  Submit Project Proposal
                  <ArrowRight className="ml-1 size-4" />
                </Button>
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
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to Build Something Amazing?</h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Join a project team or start your own. No experience necessary—just bring your enthusiasm and
                willingness to learn!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={"https://discord.gg/pwcdweEwjM"}>
                <Button size="lg" variant="secondary" className="rounded-full">
                  
                  Join TechClub
                </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full bg-transparent border-white text-white hover:bg-white/10"
                >
                  Browse All Projects
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

