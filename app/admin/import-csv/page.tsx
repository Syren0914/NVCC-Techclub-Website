"use client"

import { useState } from "react"
import { AdminProtection } from "@/components/admin-protection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ImportResult {
  success: boolean
  message: string
  imported?: number
  errors?: string[]
  data?: any[]
}

function ImportCSVContent() {
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  // Pre-populate with the current CSV data
  const sampleCSV = `Name,Email Prefix,Phone Number
Fatima Mohamed,fim39530,
Peter Lokar,psu52336,850-797-3264
Simarah Abdullah,sfa80459,240-810-3826
Kacey Nkukundi,kn64957,240-408-9102
Evan Citchins,erc57891,703-559-2888
Yousaf Zaniel,ymz728,571-509-9519
Isabella Sampers,irs64156,571-888-0695
Kerstin Rome,kr54093,757-577-8937
Edward Nerls,epl53842,571-471-3131
Jeffrey Agbenocngoe,je35102,571-799-9060
Aryaki Prafaray,ap73071,571-332-6150
Mohamed Richi,mr32468,240-595-4576
Waseh Nastuh,wen464,571-429-4972
Tima,td334,571-471-1616
Byron Legaspi,bbl4580,703-554-5553
Sofia Shcherbak,srs69760,540-454-1472
Haytham Abevelfaid,ha58266,571-412-2798
Nathael Lemen,nal85029,202-898-3328
Rashteen Siddique,rs9966,202-657-9032
Nathan Guo,nje85669,703-303-9578
Ayaman Aaron,aa99716,856-288-6869
Andrew Chico,,703-615-4965`

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.some(v => v !== '')) { // Skip completely empty lines
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        data.push(row)
      }
    }

    return data
  }

  const handleImport = async () => {
    if (!csvText.trim()) {
      setResult({
        success: false,
        message: 'Please provide CSV data to import'
      })
      return
    }

    setImporting(true)
    setResult(null)

    try {
      const csvData = parseCSV(csvText)
      
      if (csvData.length === 0) {
        setResult({
          success: false,
          message: 'No valid data found in CSV'
        })
        setImporting(false)
        return
      }

      // Get the current session token for authentication
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        setResult({
          success: false,
          message: 'Authentication required. Please sign in.'
        })
        setImporting(false)
        return
      }

      console.log('Sending CSV data:', csvData.slice(0, 3)) // Log first 3 rows
      console.log('CSV data length:', csvData.length)

      const response = await fetch('/api/admin/import-csv-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ csvData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error response:', errorData)
        setResult({
          success: false,
          message: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          errors: errorData.details ? [errorData.details] : undefined
        })
        setImporting(false)
        return
      }

      const data = await response.json()
      console.log('API response:', data)
      setResult(data)

    } catch (error) {
      console.error('Error importing CSV:', error)
      setResult({
        success: false,
        message: 'Failed to import CSV data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setImporting(false)
    }
  }

  const loadSampleData = () => {
    setCsvText(sampleCSV)
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import CSV Members</h1>
          <p className="text-muted-foreground">
            Import member contact data from CSV format into membership applications
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>CSV Data Import</CardTitle>
            <CardDescription>
              Paste your CSV data below. Expected format: Name, Email Prefix, Phone Number
              <br />
              Empty fields will be filled with default values.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex gap-2 mb-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={loadSampleData}
                >
                  Load Sample Data
                </Button>
              </div>
              <Textarea
                placeholder="Name,Email Prefix,Phone Number
Fatima Mohamed,fim39530,
Peter Lokar,psu52336,850-797-3264
..."
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {
                  const parsed = parseCSV(csvText)
                  console.log('Parsed CSV:', parsed)
                  alert(`Parsed ${parsed.length} rows. Check console for details.`)
                }}
                disabled={!csvText.trim()}
                className="flex items-center gap-2"
              >
                Test Parse CSV
              </Button>
              <Button 
                onClick={handleImport}
                disabled={importing || !csvText.trim()}
                className="flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Import CSV Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                Import Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={result.success ? "border-green-500" : "border-red-500"}>
                <AlertDescription>
                  {result.message}
                  {result.imported && (
                    <div className="mt-2">
                      <strong>Imported:</strong> {result.imported} applications
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-red-600 mb-2">Errors:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {result.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-600">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.success && result.data && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Preview of imported data:</h4>
                  <div className="bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                    <pre className="text-sm">
                      {JSON.stringify(result.data.slice(0, 3), null, 2)}
                      {result.data.length > 3 && (
                        <div className="text-muted-foreground mt-2">
                          ... and {result.data.length - 3} more applications
                        </div>
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Default Values Applied</CardTitle>
            <CardDescription>
              When fields are empty, these default values will be used:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Major:</strong> Computer Science
              </div>
              <div>
                <strong>Experience Level:</strong> Beginner
              </div>
              <div>
                <strong>Areas of Interest:</strong> General Technology, Programming
              </div>
              <div>
                <strong>Goals:</strong> Learn and grow with the tech club
              </div>
              <div>
                <strong>Graduation Year:</strong> 2025
              </div>
              <div>
                <strong>Contact Method:</strong> Email
              </div>
              <div>
                <strong>Email Format:</strong> [prefix]@email.vccs.edu
              </div>
              <div>
                <strong>Status:</strong> Pending
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ImportCSVPage() {
  return (
    <AdminProtection>
      <ImportCSVContent />
    </AdminProtection>
  )
}
