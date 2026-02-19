import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface CSVRow {
  Name: string
  'Email Prefix': string
  'Phone Number': string
}

async function isAdmin(user: any): Promise<boolean> {
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    return userData?.role === 'admin'
  } catch (error) {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Admin check
    const adminCheck = await isAdmin(user)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('Received body:', body)
    const { csvData } = body

    if (!csvData || !Array.isArray(csvData)) {
      console.log('Invalid CSV data:', { csvData, isArray: Array.isArray(csvData) })
      return NextResponse.json(
        { error: 'Invalid CSV data provided', received: typeof csvData },
        { status: 400 }
      )
    }

    console.log('CSV data length:', csvData.length)
    console.log('First few rows:', csvData.slice(0, 3))

    const applications = []
    const errors = []

    for (let i = 0; i < csvData.length; i++) {
      const row: CSVRow = csvData[i]
      
      // Skip empty rows
      if (!row.Name || row.Name.trim() === '') {
        continue
      }

      try {
        // Split name into first and last name
        const nameParts = row.Name.trim().split(' ')
        const firstName = nameParts[0] || 'Unknown'
        const lastName = nameParts.slice(1).join(' ') || 'Unknown'

        // Create email from prefix
        const emailPrefix = row['Email Prefix']?.trim()
        const email = emailPrefix ? `${emailPrefix}@email.vccs.edu` : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.vccs.edu`

        // Handle phone number
        const phone = row['Phone Number']?.trim() || null

        // Create application object with defaults
        const application = {
          first_name: firstName,
          last_name: lastName,
          email: email,
          major: 'Computer Science', // Default major
          areas_of_interest: 'General Technology, Programming', // Default interests
          technical_experience_level: 'beginner', // Default experience level
          goals: 'Learn and grow with the tech club', // Default goals
          github_username: null,
          linkedin_url: null,
          phone: phone,
          graduation_year: '2025', // Default graduation year
          preferred_contact_method: 'email',
          status: 'pending'
        }

        applications.push(application)
      } catch (rowError) {
        errors.push(`Row ${i + 1}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`)
      }
    }

    if (applications.length === 0) {
      return NextResponse.json(
        { error: 'No valid applications to import', errors },
        { status: 400 }
      )
    }

    // Insert applications into database
    const { data: insertedApplications, error: insertError } = await supabase
      .from('membership_applications')
      .insert(applications)
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to insert applications into database', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedApplications?.length || 0} applications`,
      imported: insertedApplications?.length || 0,
      errors: errors.length > 0 ? errors : undefined,
      data: insertedApplications
    })

  } catch (error) {
    console.error('Error importing CSV:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to parse CSV text into array of objects
export async function parseCSVText(csvText: string): Promise<CSVRow[]> {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header and one data row')
  }

  const headers = lines[0].split(',').map(h => h.trim())
  const data: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    const row: any = {}
    
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    
    data.push(row as CSVRow)
  }

  return data
}
