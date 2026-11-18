"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function ConferenceSignupPage() {
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    age: "",
    major: "",
    expectations: "",
    participation: "attending"
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | { success: boolean; message: string; code?: string; verifyUrl?: string }>(null)
  const [lastCode, setLastCode] = useState<string | null>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('/api/conference/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          age: form.age ? Number(form.age) : undefined,
          major: form.major,
          expectations: form.expectations,
          participation: form.participation
        })
      })
      const data = await response.json()
      if (response.ok) {
        setResult({ success: true, message: data.message || 'Registered successfully! Check your email for QR.', code: data.code, verifyUrl: data.verifyUrl })
        setLastCode(data.code || null)
        setForm({ email: "", first_name: "", last_name: "", age: "", major: "", expectations: "", participation: "attending" })
      } else {
        setResult({ success: false, message: data.error || 'Failed to register' })
      }
    } catch (err) {
      setResult({ success: false, message: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>
      <div className="container mx-auto max-w-6xl relative z-10 px-4">
        <div className="lg:grid lg:grid-cols-2 gap-4 sm:gap-8 items-start">
          <div className="max-w-xl w-full">
            <div className="mb-8 text-right md:text-left">
              <h1 className="text-3xl font-bold mb-2">Honors Program: Technology Conference</h1>
              <p className="text-muted-foreground">Sign up to attend. Use your school email.</p>
            </div>

            <Card>
          <CardHeader>
            <CardTitle>Conference Sign Up</CardTitle>
            <CardDescription>Enter your details to receive a QR code via email.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" name="first_name" value={form.first_name} onChange={onChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" value={form.last_name} onChange={onChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">School Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@school.edu" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" name="age" type="number" value={form.age} onChange={onChange} min={0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">Major</Label>
                  <Input id="major" name="major" value={form.major} onChange={onChange} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectations">What are you looking forward to?</Label>
                <Textarea id="expectations" name="expectations" value={form.expectations} onChange={onChange} placeholder="Talks, networking, workshops..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="participation">Participation</Label>
                <select
                  id="participation"
                  name="participation"
                  className="border bg-background rounded-md h-10 px-3 text-sm w-full"
                  value={form.participation}
                  onChange={(e) => setForm(prev => ({ ...prev, participation: e.target.value }))}
                >
                  <option value="attending">Attending</option>
                  <option value="presenting">Presenting</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</>) : 'Sign Up'}
              </Button>

              {result && (
                <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="font-medium">{result.message}</div>
                    {result.success && result.code && (
                      <div className="mt-3 space-y-3">
                        <div className="text-sm">Your code: <code>{result.code}</code></div>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                          <img src={`/api/conference/qr?code=${encodeURIComponent(result.code)}`} alt="QR" className="w-40 h-40 sm:w-48 sm:h-48 border rounded" />
                          <a
                            className="underline text-sm sm:self-start"
                            href={`/api/conference/qr?code=${encodeURIComponent(result.code)}&download=1`}
                          >
                            Download QR
                          </a>
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
            </Card>
          </div>
          <div className="lg:ml-auto max-w-xl w-full mt-6 lg:mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Here is the QR code for the conference</CardTitle>
                <CardDescription>Use this at the door for quick check-in.</CardDescription>
              </CardHeader>
              <CardContent>
                {lastCode ? (
                  <div className="space-y-3 text-center lg:text-left">
                    <div className="text-sm text-muted-foreground">Code: <code>{lastCode}</code></div>
                    <img src={`/api/conference/qr?code=${encodeURIComponent(lastCode)}`} alt="Conference QR" className="mx-auto lg:mx-0 w-40 h-40 sm:w-56 sm:h-56 border rounded" />
                    <a
                      className="underline text-sm block"
                      href={`/api/conference/qr?code=${encodeURIComponent(lastCode)}&download=1`}
                    >
                      Download QR
                    </a>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Submit the form to generate your QR code.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


