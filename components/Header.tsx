"use client"
import Link from 'next/link'
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Project, TeamMember } from '@/lib/supabase'
import Image from 'next/image'
import { Sun, Moon, X, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMembership } from '@/hooks/use-membership'

function Header() {
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
    
    // Membership form state
    const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      email: '',
      major: '',
      areas_of_interest: ''
    })
    
    const { isSubmitting, submitStatus, errorMessage, submitApplication, resetStatus } = useMembership()
  
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
  
  return (
    <div>
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"}`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <div className="size-20 rounded-lg from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
              <Image src="/techclub.png" width={150} height={150} alt={""}></Image>
            </div>
            <span>TechClub</span>
          </div>
          <nav className="hidden md:flex gap-8 mx-auto">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              About Us
            </Link>
            <Link
              href="/projects"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Projects
            </Link>
            <Link
              href="/events"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Events
            </Link>
            <Link
              href="/resources"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Resources
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Community
            </Link>
            <Link
              href="#support"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Support
            </Link>
          </nav>
          <div className="hidden md:flex gap-4 items-center">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Link
              href=""
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              
            </Link>
            <Button className="rounded-full">
              <Link href={"/login"}>Join Now</Link>
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {mounted && theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
          >
            <div className="container py-4 flex flex-col gap-4">
              <Link href="#about" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                About Us
              </Link>
              <Link href="#projects" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Projects
              </Link>
              <Link href="#events" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Events
              </Link>
              <Link href="#resources" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Resources
              </Link>
              <Link href="#community" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Community
              </Link>
              <Link href="#support" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Support
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Link href="/login" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Log in
                </Link>
                <Button className="rounded-full">
                  Join Club
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </header>
    </div>
  )
}

export default Header