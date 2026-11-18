"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, Users, Code, Shield, Gamepad, Cpu, Database, Globe, XCircle } from "lucide-react"
import { submitMembershipApplication } from "@/lib/database"

export default function JoinPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    major: '',
    areas_of_interest: '',
    technical_experience_level: 'beginner',
    goals: '',
    github_username: '',
    linkedin_url: '',
    phone: '',
    graduation_year: '',
    preferred_contact_method: 'email'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState<{ exists: boolean; status?: string; message?: string } | null>(null)

  const validateEmail = (email: string) => {
    if (!email) return ''
    if (!email.endsWith('@email.vccs.edu')) {
      return 'Only @email.vccs.edu email addresses are accepted'
    }
    return ''
  }

  const checkEmailExists = useCallback(async (email: string) => {
    console.log('Frontend: Starting email check for:', email)
    
    if (!email || !email.endsWith('@email.vccs.edu')) {
      console.log('Frontend: Email format invalid, clearing state')
      setEmailExists(null)
      return
    }

    setIsCheckingEmail(true)
    console.log('Frontend: Making API call to check email...')
    
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      console.log('Frontend: API response status:', response.status)
      const data = await response.json()
      console.log('Frontend: API response data:', data)
      
      if (response.ok) {
        setEmailExists(data)
        if (data.exists) {
          console.log('Frontend: Email exists, setting error:', data.message)
          setEmailError(data.message || 'Email already exists')
        } else {
          console.log('Frontend: Email available, clearing error')
          setEmailError('')
        }
      } else {
        console.error('Frontend: API error response:', data.error)
        setEmailExists(null)
      }
    } catch (error) {
      console.error('Frontend: Failed to check email:', error)
      setEmailExists(null)
    } finally {
      setIsCheckingEmail(false)
      console.log('Frontend: Email check completed')
    }
  }, [])

  // Debounced email checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email) {
        checkEmailExists(formData.email)
      }
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [formData.email, checkEmailExists])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear email error when user starts typing
    if (field === 'email') {
      setEmailError('')
      setEmailExists(null)
    }
  }

  const handleEmailBlur = (email: string) => {
    const error = validateEmail(email)
    if (error) {
      setEmailError(error)
    } else if (email) {
      checkEmailExists(email)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email format
    const emailValidationError = validateEmail(formData.email)
    if (emailValidationError) {
      setEmailError(emailValidationError)
      return
    }

    // Check if email already exists
    if (emailExists?.exists) {
      setEmailError(emailExists.message || 'Email already exists')
      return
    }

    // If still checking email, wait
    if (isCheckingEmail) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const result = await submitMembershipApplication(formData)
      
      if (result.success) {
        setSubmitStatus('success')
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          major: '',
          areas_of_interest: '',
          technical_experience_level: 'beginner',
          goals: '',
          github_username: '',
          linkedin_url: '',
          phone: '',
          graduation_year: '',
          preferred_contact_method: 'email'
        })
        setEmailExists(null)
        setEmailError('')
      } else {
        setSubmitStatus('error')
        setErrorMessage(result.error || 'Failed to submit application')
      }
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage('An unexpected error occurred')
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const membershipBenefits = [
    {
      icon: <Code className="h-5 w-5" />,
      title: "Hands-on Projects",
      description: "Work on real-world projects and build your portfolio"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Networking",
      description: "Connect with industry professionals and fellow students"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Cybersecurity Training",
      description: "Learn ethical hacking and security best practices"
    },
    {
      icon: <Gamepad className="h-5 w-5" />,
      title: "Game Development",
      description: "Create games using Unity, Unreal Engine, and more"
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      title: "AI & Machine Learning",
      description: "Explore cutting-edge AI technologies and applications"
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Data Science",
      description: "Learn data analysis, visualization, and machine learning"
    }
  ]

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner - New to programming' },
    { value: 'intermediate', label: 'Intermediate - Some programming experience' },
    { value: 'advanced', label: 'Advanced - Experienced programmer' }
  ]

  const majors = [
    'Computer Science',
    'Information Technology',
    'Cybersecurity',
    'Data Science',
    'Software Engineering',
    'Computer Engineering',
    'Information Systems',
    'Other'
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4" variant="secondary">
            Join Our Community
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Become a TechClub Member</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our community of tech enthusiasts and start your journey in technology. 
            Whether you're a beginner or an experienced developer, there's a place for you here.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Membership Benefits
                </CardTitle>
                <CardDescription>
                  What you'll get as a TechClub member
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {membershipBenefits.map((benefit, i) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * i }}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="text-primary mt-0.5">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Membership Application</CardTitle>
                <CardDescription>
                  Tell us about yourself and your interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitStatus === 'success' && (
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your application has been submitted successfully! We'll get back to you soon.
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === 'error' && (
                  <Alert className="mb-4" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={(e) => handleEmailBlur(e.target.value)}
                        required
                        placeholder="your.email@email.vccs.edu"
                        className={`${emailError ? 'border-red-500' : ''} ${emailExists?.exists === false ? 'border-green-500' : ''}`}
                      />
                      {isCheckingEmail && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      {emailExists?.exists === false && !isCheckingEmail && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      {emailExists?.exists === true && !isCheckingEmail && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <XCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-500 mt-1">{emailError}</p>
                    )}
                    {emailExists?.exists === false && !emailError && (
                      <p className="text-sm text-green-500 mt-1">✓ Email is available</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Only @email.vccs.edu email addresses are accepted
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="major">Major *</Label>
                    <Select value={formData.major} onValueChange={(value) => handleInputChange('major', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your major" />
                      </SelectTrigger>
                      <SelectContent>
                        {majors.map((major) => (
                          <SelectItem key={major} value={major}>
                            {major}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="graduation_year">Expected Graduation Year</Label>
                    <Input
                      id="graduation_year"
                      value={formData.graduation_year}
                      onChange={(e) => handleInputChange('graduation_year', e.target.value)}
                      placeholder="2025"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="areas_of_interest">Areas of Interest *</Label>
                    <Textarea
                      id="areas_of_interest"
                      value={formData.areas_of_interest}
                      onChange={(e) => handleInputChange('areas_of_interest', e.target.value)}
                      placeholder="e.g., Web Development, Cybersecurity, AI/ML, Game Development, Data Science"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="technical_experience_level">Technical Experience Level *</Label>
                    <Select value={formData.technical_experience_level} onValueChange={(value) => handleInputChange('technical_experience_level', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="github_username">GitHub Username</Label>
                    <Input
                      id="github_username"
                      value={formData.github_username}
                      onChange={(e) => handleInputChange('github_username', e.target.value)}
                      placeholder="your-github-username"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                    <Input
                      id="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                      placeholder="https://linkedin.com/in/your-profile"
                    />
                  </div>

                  <div>
                    <Label htmlFor="goals">Goals & What You Hope to Learn</Label>
                    <Textarea
                      id="goals"
                      value={formData.goals}
                      onChange={(e) => handleInputChange('goals', e.target.value)}
                      placeholder="Tell us about your goals and what you hope to learn from TechClub..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                    <Select value={formData.preferred_contact_method} onValueChange={(value) => handleInputChange('preferred_contact_method', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="text">Text Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

