"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

function VerifyClient() {
  const params = useSearchParams()
  const initialCode = params.get('code') || ''
  const [code, setCode] = useState(initialCode)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | { valid: boolean; message?: string; attendee?: any; check_in?: boolean }>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [scanning, setScanning] = useState(false)
  const [lastScanned, setLastScanned] = useState(initialCode || '')

  const verify = async (doCheckIn: boolean, codeOverride?: string) => {
    setLoading(true)
    setResult(null)
    try {
      const codeToVerify = (codeOverride ?? code).trim()
      const response = await fetch('/api/conference/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToVerify, check_in: doCheckIn })
      })
      const data = await response.json()
      if (response.ok) {
        setResult(data)
      } else {
        setResult({ valid: false, message: data.error || data.message || 'Invalid code' })
      }
    } catch (err) {
      setResult({ valid: false, message: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialCode) {
      verify(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-background p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0 h-full w-full bg-white dark:bg-black  bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"></div>
      <div className="container mx-auto max-w-6xl relative z-10 px-4">
        <div className="lg:grid lg:grid-cols-2 gap-4 sm:gap-8 items-start">
          <div className="max-w-xl w-full">
            <Card>
              <CardHeader>
                <CardTitle>Latest Scan</CardTitle>
                <CardDescription>Results appear here when a QR is scanned or code verified.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading && (
                  <div className="text-sm text-muted-foreground">Verifying...</div>
                )}
                {!loading && !result && (
                  <div className="text-sm text-muted-foreground">Start camera scan or enter a code to verify.</div>
                )}
                {result && (
                  <div className={result.valid ? "border rounded p-3 bg-green-50" : "border rounded p-3 bg-red-50"}>
                    {result.valid ? (
                      <div>
                        <div className="font-semibold text-black">Verified</div>
                        {result.attendee && (
                          <div className="mt-1 text-sm space-y-1 text-black">
                            <div>Name: {result.attendee.first_name} {result.attendee.last_name}</div>
                            <div>Email: {result.attendee.email}</div>
                          </div>
                        )}
                        {typeof result.attendee?.checked_in !== 'undefined' && (
                          <div className="mt-1 text-sm text-black">Checked In: {String(result.attendee.checked_in)}</div>
                        )}
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" onClick={() => verify(true, lastScanned || code)}>Check In</Button>
                          <a className="underline text-sm self-center text-black" href={`/api/conference/qr?code=${encodeURIComponent(lastScanned || code)}`} target="_blank" rel="noreferrer">Open QR</a>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-semibold text-black">Not Found</div>
                        <div className="text-sm mt-1 text-black">{result.message || 'Code not found'}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:ml-auto max-w-xl w-full mt-6 lg:mt-0">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-bold mb-2">Conference Check-in</h1>
              <p className="text-muted-foreground">Scan your QR or enter your code.</p>
            </div>

            <Card>
          <CardHeader>
            <CardTitle>Verify Code</CardTitle>
            <CardDescription>Validate a registration code and optionally check in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123XYZ" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => verify(false)} disabled={loading || !code}>
                {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying...</>) : 'Verify'}
              </Button>
              <Button onClick={() => verify(true)} disabled={loading || !code} variant="secondary">
                {loading ? 'Please wait...' : 'Check In'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  if (scanning) {
                    setScanning(false)
                    const stream = videoRef.current?.srcObject as MediaStream
                    stream?.getTracks().forEach(t => t.stop())
                    videoRef.current && (videoRef.current.srcObject = null)
                    return
                  }
                  try {
                    setScanning(true)
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                    if (videoRef.current) {
                      videoRef.current.srcObject = stream
                      await videoRef.current.play()
                    }
                    const { BrowserQRCodeReader } = await import('@zxing/browser')
                    const codeReader = new BrowserQRCodeReader()
                    const result = await codeReader.decodeFromVideoDevice(undefined, videoRef.current!, (res) => {
                      if (res) {
                        const scanned = res.getText().split('code=')[1] || res.getText()
                        setCode(scanned)
                        setLastScanned(scanned)
                        // Auto-verify on scan
                        verify(false, scanned)
                      }
                    })
                  } catch (err) {
                    setScanning(false)
                  }
                }}
              >
                {scanning ? 'Stop Camera' : 'Scan QR'}
              </Button>
            </div>

            {scanning && (
              <div className="mt-2">
                <video ref={videoRef} className="w-full max-w-sm rounded border" muted playsInline />
              </div>
            )}

            {result && (
              <Alert className={result.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {result.valid ? (
                  <CheckCircle className="h-4 w-4 text-black dark:text-black" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {result.valid ? (
                    <div>
                      <div className="font-medium text-black">Valid registration</div>
                      {result.attendee && (
                        <div className="text-sm mt-1 text-black">{result.attendee.first_name} {result.attendee.last_name} ({result.attendee.email})</div>
                      )}
                      {result.check_in && (
                        <div className="text-sm mt-1 text-black">Checked in successfully.</div>
                      )}
                    </div>
                  ) : (
                    <div className="font-medium text-black">{result.message || 'Invalid code'}</div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <VerifyClient />
    </Suspense>
  )
}
