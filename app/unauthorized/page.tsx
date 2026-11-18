"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Mail, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="size-12 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="size-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">Access Restricted</CardTitle>
          <CardDescription>
            This application is only available to NVCC students and faculty
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4" />
              <span>Only @email.vccs.edu emails are allowed</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Please use your NVCC email address to access TechClub resources and features.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="size-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">
                Try Different Email
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>Need help? Contact your instructor or IT support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 