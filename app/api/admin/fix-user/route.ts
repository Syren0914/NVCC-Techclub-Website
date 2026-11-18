import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // First, make sure the users table exists
    const { error: tableError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (tableError) {
      // Create the users table if it doesn't exist
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'officer')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })

      if (createError) {
        console.error('Error creating users table:', createError)
        return NextResponse.json(
          { error: 'Failed to create users table. Please run the database setup script first.', details: createError },
          { status: 500 }
        )
      }
    }

    // Insert or update the user in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: email,
        role: 'admin'
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (userError) {
      console.error('Error setting up user:', userError)
      return NextResponse.json(
        { error: 'Failed to set up user', details: userError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} has been added to database with admin privileges`,
      user: userData
    })
  } catch (error) {
    console.error('Error in fix user API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
