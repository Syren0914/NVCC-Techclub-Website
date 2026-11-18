"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ChevronRight,
  Search,
  BookOpen,
  FileCode,
  Terminal,
  Shield,
  Code,
  Laptop,
  Download,
  ExternalLink,
  ArrowRight,
  Filter,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Header from "@/components/Header"
import { getAllResources } from "@/lib/database"
import { Resource } from "@/lib/supabase"

export default function ResourcesPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      const resourcesData = await getAllResources()
      setResources(resourcesData)
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    "Web Development",
    "Cybersecurity",
    "Game Development",
    "Robotics",
    "AI/ML",
    "Career Development",
    "Programming Languages",
    "DevOps",
  ]

  const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"]

  // Filter resources based on search query and filters
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(resource.category)
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(resource.level)

    return matchesSearch && matchesCategory && matchesLevel
  })

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))
  }

  const featuredResources = resources.filter((resource) => resource.featured)

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
                  Resources & Tutorials
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Learn & Grow Your Skills</h1>
                <p className="text-lg text-muted-foreground">
                  Access our collection of tutorials, guides, and resources to help you develop your technical skills
                  and advance your career.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="rounded-full">
                    Browse Resources
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                  <Button variant="outline" className="rounded-full">
                    Submit a Resource
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
                    src="/resources.jpg"
                    width={800}
                    height={600}
                    alt="Students learning from online resources"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Resources Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Resources</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our most popular and comprehensive learning materials to help you get started.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {featuredResources.map((resource, i) => (
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
                        src={
                          resource.url?.includes("youtu.be")
                            ? `https://img.youtube.com/vi/${resource.url.split("youtu.be/")[1]}/hqdefault.jpg`
                            : resource.image || "/placeholder.svg"
                        }
                        alt={resource.title}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="rounded-full">
                          {resource.type}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center mb-1">
                        <Badge variant="outline" className="rounded-full">
                          {resource.category}
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                          {resource.level}
                        </Badge>
                      </div>
                      <CardTitle>{resource.title}</CardTitle>
                      <CardDescription className="text-xs">
                        By {resource.author} • Updated {resource.dateUpdated}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{resource.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {(resource.tags || []).map((tag, j) => (
                          <Badge key={j} variant="outline" className="rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="rounded-full w-full" asChild>
                        <Link href={resource.url || resource.link || '#'}>
                          View Resource
                          <ArrowRight className="ml-1 size-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* All Resources Section */}
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
                  <h2 className="text-3xl font-bold tracking-tight mb-2">All Resources</h2>
                  <p className="text-muted-foreground">Browse our complete library of learning materials</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                    <Input
                      placeholder="Search resources..."
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
                        Categories
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => toggleCategory(category)}
                            />
                            <Label htmlFor={`category-${category}`} className="text-sm">
                              {category}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3 flex items-center">
                        <BookOpen className="size-4 mr-2" />
                        Skill Level
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {levels.map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox
                              id={`level-${level}`}
                              checked={selectedLevels.includes(level)}
                              onCheckedChange={() => toggleLevel(level)}
                            />
                            <Label htmlFor={`level-${level}`} className="text-sm">
                              {level}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="outline"
                      className="rounded-full text-sm"
                      onClick={() => {
                        setSelectedCategories([])
                        setSelectedLevels([])
                        setSearchQuery("")
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </motion.div>
              )}

              <Tabs defaultValue="all" className="w-full">
                <div className="flex justify-center mb-8">
                  <TabsList className="rounded-full p-1">
                    <TabsTrigger value="all" className="rounded-full px-6">
                      All Resources
                    </TabsTrigger>
                    <TabsTrigger value="tutorials" className="rounded-full px-6">
                      Tutorials
                    </TabsTrigger>
                    <TabsTrigger value="guides" className="rounded-full px-6">
                      Guides
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="rounded-full px-6">
                      Templates
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="all">
                  {filteredResources.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredResources.map((resource, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        >
                          <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center mb-1">
                                <Badge variant="outline" className="rounded-full">
                                  {resource.category}
                                </Badge>
                                <Badge variant="outline" className="rounded-full">
                                  {resource.level}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg">{resource.title}</CardTitle>
                              <CardDescription className="text-xs">
                                By Admin • Updated {new Date(resource.created_at).toLocaleDateString()  }
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {(resource.tags || []).slice(0, 2).map((tag, j) => (
                                  <Badge key={j} variant="outline" className="rounded-full text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {(resource.tags || []).length > 2 && (
                                  <Badge variant="outline" className="rounded-full text-xs">
                                    +{(resource.tags || []).length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                            <CardContent>
                              <iframe
                                width="100%"
                                height="215"
                                src={`https://www.youtube.com/embed/${resource.url.split("youtu.be/")[1]}`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="rounded-lg w-full"
                              />
                            </CardContent>

                            <CardFooter>
                              <Button variant="outline" className="rounded-full w-full" asChild>
                                <Link href={resource.url || resource.link || '#'}>
                                  View Resource
                                  <ArrowRight className="ml-1 size-4" />
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No resources found matching your search criteria.</p>
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          setSelectedCategories([])
                          setSelectedLevels([])
                          setSearchQuery("")
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tutorials">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredResources
                      .filter((r) => r.type?.includes("Tutorial"))
                      .map((resource, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        >
                          <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center mb-1">
                                <Badge variant="outline" className="rounded-full">
                                  {resource.category}
                                </Badge>
                                <Badge variant="outline" className="rounded-full">
                                  {resource.level}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg">{resource.title}</CardTitle>
                              <CardDescription className="text-xs">
                                By {resource.author} • Updated {resource.dateUpdated}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {resource.tags.slice(0, 2).map((tag, j) => (
                                  <Badge key={j} variant="outline" className="rounded-full text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {resource.tags.length > 2 && (
                                  <Badge variant="outline" className="rounded-full text-xs">
                                    +{resource.tags.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button variant="outline" className="rounded-full w-full" asChild>
                                <Link href={resource.url || resource.link || '#'}>
                                  View Tutorial
                                  <ArrowRight className="ml-1 size-4" />
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="guides">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredResources
                      .filter((r) => r.type?.includes("Guide"))
                      .map((resource, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        >
                          <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center mb-1">
                                <Badge variant="outline" className="rounded-full">
                                  {resource.category}
                                </Badge>
                                <Badge variant="outline" className="rounded-full">
                                  {resource.level}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg">{resource.title}</CardTitle>
                              <CardDescription className="text-xs">
                                By {resource.author} • Updated {resource.dateUpdated}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {resource.tags.slice(0, 2).map((tag, j) => (
                                  <Badge key={j} variant="outline" className="rounded-full text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {resource.tags.length > 2 && (
                                  <Badge variant="outline" className="rounded-full text-xs">
                                    +{resource.tags.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button variant="outline" className="rounded-full w-full" asChild>
                                <Link href={resource.url || resource.link || '#'}>
                                  View Guide
                                  <ArrowRight className="ml-1 size-4" />
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="templates">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredResources
                      .filter((r) => r.type?.includes("Template"))
                      .map((resource, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                        >
                          <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center mb-1">
                                <Badge variant="outline" className="rounded-full">
                                  {resource.category}
                                </Badge>
                                <Badge variant="outline" className="rounded-full">
                                  {resource.level}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg">{resource.title}</CardTitle>
                              <CardDescription className="text-xs">
                                By {resource.author} • Updated {resource.dateUpdated}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {resource.tags.slice(0, 2).map((tag, j) => (
                                  <Badge key={j} variant="outline" className="rounded-full text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {resource.tags.length > 2 && (
                                  <Badge variant="outline" className="rounded-full text-xs">
                                    +{resource.tags.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button variant="outline" className="rounded-full w-full" asChild>
                                <Link href={resource.url || resource.link || '#'}>
                                  Download Template
                                  <Download className="ml-1 size-4" />
                                </Link>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </section>

        {/* Resource Categories Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">Resource Categories</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Explore our resources by topic to find exactly what you need.
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
                      <Code className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Web Development</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      HTML, CSS, JavaScript, React, Node.js, and more. Learn frontend and backend web development.
                    </p>
                    <Button variant="outline" className="rounded-full mt-auto" asChild>
                      <Link href="/resources/web-development">
                        Browse Web Dev Resources
                        <ChevronRight className="ml-1 size-4" />
                      </Link>
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
                      <Shield className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Cybersecurity</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Ethical hacking, network security, cryptography, and penetration testing resources.
                    </p>
                    <Button variant="outline" className="rounded-full mt-auto" asChild>
                      <Link href="/resources/cybersecurity">
                        Browse Security Resources
                        <ChevronRight className="ml-1 size-4" />
                      </Link>
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
                      <Terminal className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Programming Languages</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Python, Java, C++, JavaScript, and more. Tutorials and references for various programming
                      languages.
                    </p>
                    <Button variant="outline" className="rounded-full mt-auto" asChild>
                      <Link href="/resources/programming">
                        Browse Programming Resources
                        <ChevronRight className="ml-1 size-4" />
                      </Link>
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
                      <Laptop className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Career Development</h3>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      Resume templates, interview prep, portfolio building, and job search strategies for tech careers.
                    </p>
                    <Button variant="outline" className="rounded-full mt-auto" asChild>
                      <Link href="/resources/career">
                        Browse Career Resources
                        <ChevronRight className="ml-1 size-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="text-center mt-12">
              <Button className="rounded-full" asChild>
                <Link href="/resources/all">
                  View All Categories
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* External Resources Section */}
        <section className="w-full py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight mb-4">External Resources</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Curated links to valuable learning resources from around the web.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "freeCodeCamp",
                  description: "Free coding curriculum covering web development, data science, and more.",
                  link: "https://www.freecodecamp.org/",
                  category: "Web Development",
                },
                {
                  title: "Codecademy",
                  description: "Interactive coding lessons in various programming languages and technologies.",
                  link: "https://www.codecademy.com/",
                  category: "Programming",
                },
                {
                  title: "TryHackMe",
                  description: "Hands-on cybersecurity training with real-world scenarios and challenges.",
                  link: "https://tryhackme.com/",
                  category: "Cybersecurity",
                },
                {
                  title: "Unity Learn",
                  description: "Official tutorials and courses for Unity game development.",
                  link: "https://learn.unity.com/",
                  category: "Game Development",
                },
                {
                  title: "Kaggle",
                  description: "Data science competitions, datasets, and tutorials for machine learning.",
                  link: "https://www.kaggle.com/",
                  category: "AI/ML",
                },
                {
                  title: "GitHub Learning Lab",
                  description: "Interactive courses on Git, GitHub, and software development workflows.",
                  link: "https://lab.github.com/",
                  category: "DevOps",
                },
              ].map((resource, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">{resource.title}</h3>
                        <Badge variant="outline" className="rounded-full">
                          {resource.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-6 flex-grow">{resource.description}</p>
                      <Button variant="outline" className="rounded-full w-full" asChild>
                        <Link href={resource.link || '#'} target="_blank" rel="noopener noreferrer">
                          Visit Website
                          <ExternalLink className="ml-1 size-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Submit Resource Section */}
        <section className="w-full py-20">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold tracking-tight">Share Your Knowledge</h2>
                <p className="text-lg text-muted-foreground">
                  Have a tutorial, guide, or resource you'd like to share with the community? We welcome contributions
                  from all members.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <FileCode className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold">Submit Your Content</h3>
                      <p className="text-muted-foreground">
                        Share tutorials, guides, templates, or reference materials
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <ExternalLink className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold">Suggest External Resources</h3>
                      <p className="text-muted-foreground">Recommend helpful websites, courses, or tools</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                      <BookOpen className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-bold">Get Published</h3>
                      <p className="text-muted-foreground">
                        Quality submissions will be featured on our resources page
                      </p>
                    </div>
                  </div>
                </div>
                <Button className="rounded-full">
                  Submit a Resource
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
                    alt="Student writing a tutorial"
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
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Ready to Level Up Your Skills?</h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Join TechClub to access all our resources, attend workshops, and connect with fellow learners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={"https://discord.gg/pwcdweEwjM"} target="_blank">

                <Button size="lg" variant="secondary" className="rounded-full">
                  Join TechClub
                </Button></Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full bg-transparent border-white text-white hover:bg-white/10"
                >
                  Browse All Resources
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

