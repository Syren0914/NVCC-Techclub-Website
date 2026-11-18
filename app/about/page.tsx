"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronRight, Clock, Video, MapPin, Trophy, GraduationCap, Users, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Milestone, TeamMember } from "../types/team"
import ASCIIText from "../components/ASCIIText/ASCIIText"


  

  

export default function AboutPage() {
  const [mounted, setMounted] = useState(false)
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch team members
        const teamResponse = await fetch('/api/team-members');
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeam(teamData);
        } else {
          console.error('Failed to fetch team members:', teamResponse.status);
        }

        // Fetch milestones
        const milestonesResponse = await fetch('/api/milestones');
        if (milestonesResponse.ok) {
          const milestoneData = await milestonesResponse.json();
          setMilestones(milestoneData);
        } else {
          console.error('Failed to fetch milestones:', milestonesResponse.status);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  
  


  // const milestones = [
  //   {
  //     year: "2020",
  //     title: "Club Founded",
  //     description:
  //       "TechClub was established by a group of 10 Computer Science students looking to expand their learning beyond the classroom.",
  //   },
  //   {
  //     year: "2020",
  //     title: "First Hackathon",
  //     description:
  //       "Organized our first internal 24-hour hackathon with 25 participants, resulting in 8 completed projects.",
  //   },
  //   {
  //     year: "2021",
  //     title: "50 Members Milestone",
  //     description: "Reached 50 active members from various departments across the college.",
  //   },
  //   {
  //     year: "2021",
  //     title: "Industry Partnership",
  //     description:
  //       "Established our first industry partnership with TechCorp, providing internship opportunities for members.",
  //   },
  //   {
  //     year: "2022",
  //     title: "Regional Hackathon Winners",
  //     description: "Our team won first place at the Regional University Hackathon with their project 'EcoTrack'.",
  //   },
  //   {
  //     year: "2022",
  //     title: "Workshop Series Launch",
  //     description: "Launched our weekly workshop series covering topics from web development to cybersecurity.",
  //   },
  //   {
  //     year: "2023",
  //     title: "100 Members Milestone",
  //     description:
  //       "Celebrated reaching 100 active members and expanded to include students from neighboring universities.",
  //   },
  //   {
  //     year: "2023",
  //     title: "First Annual Tech Conference",
  //     description:
  //       "Organized our first annual tech conference with 200+ attendees and speakers from major tech companies.",
  //   },
  //   {
  //     year: "2024",
  //     title: "Robotics Competition Win",
  //     description:
  //       "Our robotics team won the National University Robotics Challenge with their autonomous navigation robot.",
  //   },
  //   {
  //     year: "2024",
  //     title: "New Club Space",
  //     description:
  //       "Secured a dedicated club space in the Technology Building with workstations, meeting areas, and a small hardware lab.",
  //   },
  //   {
  //     year: "2025",
  //     title: "200+ Members",
  //     description:
  //       "Currently at over 200 active members with four specialized divisions: Web Development, Cybersecurity, Game Development, and Robotics.",
  //   },
  // ]

  const values = [
    {
      title: "Inclusive Learning",
      description:
        "We welcome members of all skill levels and backgrounds, believing that diversity of thought leads to better innovation.",
      icon: <Users className="size-8 text-primary" />,
    },
    {
      title: "Hands-on Experience",
      description:
        "We emphasize learning by doing, with practical projects that build real-world skills and portfolio pieces.",
      icon: <GraduationCap className="size-8 text-primary" />,
    },
    {
      title: "Community Support",
      description:
        "We foster a supportive environment where members help each other grow and overcome challenges together.",
      icon: <Heart className="size-8 text-primary" />,
    },
    {
      title: "Excellence & Innovation",
      description:
        "We strive for excellence in all our projects and encourage innovative approaches to problem-solving.",
      icon: <Trophy className="size-8 text-primary" />,
    },
  ]

  return (
    <div>
      
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
                  About Us
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Story & Mission</h1>
                <p className="text-lg text-muted-foreground">
                  Learn about TechClub's journey from a small study group to a thriving community of tech enthusiasts
                  making an impact on campus and beyond.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="rounded-full">
                    Meet Our Team
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                  
                  <Button asChild size="lg" variant="secondary" className="rounded-full">
                    <Link href="https://discord.gg/pwcdweEwjM">
                      Join the TechClub
                    </Link>
                  </Button>

                  
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <div className="w-full max-w-md  flex items-center justify-center overflow-hidden">
                  <ASCIIText
                    text='Hello World'
                    enableWaves={true}
                    asciiFontSize={5}
                    
                  />
                </div>
                
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <h2 className="text-3xl font-bold tracking-tight text-center">Our Story</h2>
              <div className="space-y-6 text-lg">
                <p>
                  TechClub began in early 2020 when a small group of Computer Science students decided they wanted to
                  explore technology beyond what they were learning in their classes. What started as informal study
                  sessions in the library quickly grew as more students expressed interest in joining.
                </p>
                <p>
                  By the fall of 2020, we had officially registered as a university club with 25 members. Our first
                  major event was a 24-hour internal hackathon that resulted in several impressive projects, including a
                  campus navigation app that's still in use today.
                </p>
                <p>
                  As our membership grew, we expanded our focus beyond just programming to include specialized interest
                  groups in web development, cybersecurity, game development, and robotics. This allowed members to dive
                  deeper into their specific areas of interest while still being part of the larger TechClub community.
                </p>
                <p>
                  In 2022, we launched our weekly workshop series, which has become one of our most popular programs.
                  These workshops, led by both student members and occasional industry guests, provide hands-on learning
                  experiences in various technical skills.
                </p>
                <p>
                  Today, TechClub has over 200 active members from diverse backgrounds and majors. We've established
                  partnerships with several tech companies that provide mentorship, project sponsorships, and internship
                  opportunities for our members. Our annual tech conference has become a highlight of the university's
                  event calendar, attracting attendees and speakers from across the region.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission & Values Section */}
        <section className="w-full py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-6">Our Mission & Values</h2>
              <p className="text-lg text-muted-foreground">
                TechClub exists to foster a collaborative environment where students can develop technical skills, work
                on meaningful projects, and build connections with like-minded individuals. We believe in learning by
                doing and sharing knowledge freely.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                    <CardContent className="p-6 flex flex-col items-center text-center h-full">
                      <div className="mb-4">{value.icon}</div>
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">Our Journey</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Key milestones in TechClub's history that have shaped who we are today.
              </p>
            </motion.div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading milestones...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : milestones.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No milestones found.</p>
              </div>
            ) : (
              <div className="relative max-w-4xl mx-auto">
                {/* Timeline line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border"></div>

                {milestones.map((milestone, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`relative mb-12 ${i % 2 === 0 ? "md:pr-12 md:text-right md:ml-auto md:mr-1/2" : "md:pl-12 md:ml-1/2"} md:w-1/2 z-10`}
                  >
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 md:left-0 md:transform-none md:translate-x-0 md:right-0 md:left-auto">
                      <div className="size-6 rounded-full bg-primary border-4 border-background"></div>
                    </div>
                    <div
                      className={`bg-card border border-border/40 rounded-lg p-6 shadow-md ${i % 2 === 0 ? "md:mr-6" : "md:ml-6"}`}
                    >
                      <div className="text-sm font-bold text-primary mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="w-full py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">Meet Our Team</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our dedicated team of student leaders who make TechClub possible.
              </p>
            </motion.div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading team members...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : team.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No team members found.</p>
              </div>
            ) : (
              <Tabs defaultValue="leadership" className="w-full mb-12">
                <div className="flex justify-center mb-8">
                  <TabsList className="rounded-full p-1">
                    <TabsTrigger value="leadership" className="rounded-full px-6">
                      Leadership Team
                    </TabsTrigger>
                    <TabsTrigger value="all" className="rounded-full px-6">
                      All Team Members
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="leadership">
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {team.slice(0, 6).map((member, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                      >
                        <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                          <CardContent className="p-6 flex flex-col h-full">
                            <div className="flex flex-col items-center mb-6">
                              <Avatar className="size-32 mb-4">
                                <AvatarImage src={member.image} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <h3 className="text-xl font-bold">{member.name}</h3>
                              <p className="text-primary font-medium">{member.role}</p>
                              <p className="text-sm text-muted-foreground">{member.year} Year</p>
                            </div>
                            <p className="text-muted-foreground mb-6 flex-grow">{member.bio}</p>
                            <div className="border-t border-border/40 pt-4">
                              <p className="font-medium mb-2">Specialties:</p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {member.specialties && member.specialties.length > 0 ? (
                                  member.specialties.map((specialty, j) => (
                                    <Badge key={j} variant="secondary" className="rounded-full">
                                      {specialty}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-muted-foreground text-sm">No specialties listed</span>
                                )}
                              </div>
                              <div className="flex justify-between">
                                <Link href={`mailto:${member.contact}`} className="text-sm text-primary hover:underline">
                                  Contact
                                </Link>
                                <div className="flex gap-2">
                                  <Link
                                    href={member.github ||""}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                      <path d="M9 18c-4.51 2-5-2-7-2" />
                                    </svg>
                                  </Link>
                                  <Link
                                    href={member.linkedin ||""}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                      <rect width="4" height="12" x="2" y="9" />
                                      <circle cx="4" cy="4" r="2" />
                                    </svg>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="all">
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {team.map((member, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                      >
                        <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                          <CardContent className="p-4 flex flex-col h-full">
                            <div className="flex flex-col items-center mb-4">
                              <Avatar className="size-24 mb-3">
                                <AvatarImage src={member.image} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <h3 className="text-lg font-bold">{member.name}</h3>
                              <p className="text-primary text-sm font-medium">{member.role}</p>
                              <p className="text-xs text-muted-foreground">{member.year} Year</p>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">{member.bio}</p>
                            <div className="flex justify-between text-xs">
                              <Link href={`mailto:${member.contact}`} className="text-primary hover:underline">
                                Contact
                              </Link>
                              <div className="flex gap-2">
                                <Link
                                  href={member.github}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                    <path d="M9 18c-4.51 2-5-2-7-2" />
                                  </svg>
                                </Link>
                                <Link
                                  href={member.linkedin}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                    <rect width="4" height="12" x="2" y="9" />
                                    <circle cx="4" cy="4" r="2" />
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>

        {/* Meeting Info Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">Meeting Information</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Join us for our regular meetings and workshops to learn, collaborate, and connect with fellow tech
                enthusiasts.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="size-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                        <Clock className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">General Meetings</h3>
                        <p className="text-muted-foreground">
                          Weekly club-wide meetings for announcements, presentations, and networking
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-6 flex-grow">
                      <div className="flex items-start gap-2">
                        <Clock className="size-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Wednesdays, 6:00 PM - 7:30 PM</p>
                          <p className="text-sm text-muted-foreground">Every week during the semester</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="size-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Tech Building, Room 302</p>
                          <p className="text-sm text-muted-foreground">Main campus, north entrance</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-full w-full">
                      Add to Calendar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="size-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                        <Video className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Online Workshops</h3>
                        <p className="text-muted-foreground">Specialized technical workshops on various topics</p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-6 flex-grow">
                      <div className="flex items-start gap-2">
                        <Clock className="size-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Fridays, 5:00 PM - 6:30 PM</p>
                          <p className="text-sm text-muted-foreground">Bi-weekly during the semester</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Video className="size-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Zoom (link shared with members)</p>
                          <p className="text-sm text-muted-foreground">Recordings available afterward for members</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-full w-full">
                      View Workshop Schedule
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-6">
                In addition to our regular meetings, we also organize special events, hackathons, and field trips
                throughout the year. Check our events page for the full schedule.
              </p>
              
                <Button className="rounded-full" asChild>
                  <Link href="/events">
                  
                    View All Events
                    
                    <ChevronRight className="ml-1 size-4" />
                    </Link>
                  
                </Button>
              
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
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to Join TechClub?</h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Become a member today and get access to all our resources, events, and a community of tech enthusiasts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link href="https://discord.gg/pwcdweEwjM">
                  Join the Discord Community
                </Link>
              </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full bg-transparent border-white text-white hover:bg-white/10"
                >
                  Contact Us
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

