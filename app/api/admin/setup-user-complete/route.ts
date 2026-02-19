import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'No authorization header'
      })
    }

    // Verify the JWT token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token',
        details: authError
      })
    }

    // Step 1: Try to create the users table using raw SQL
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'officer')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Since we can't run raw SQL through the client, we'll try to insert directly
    // and handle the case where the table doesn't exist
    let insertResult
    try {
      // Try to insert the user
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          role: 'admin'
        }, {
          onConflict: 'id'
        })
        .select()

      if (insertError) {
        // If the table doesn't exist, we'll get an error
        if (insertError.message && insertError.message.includes('relation "users" does not exist')) {
          return NextResponse.json({
            success: false,
            error: 'Users table does not exist. Please run the database setup script in Supabase SQL Editor first.',
            details: insertError,
            instructions: [
              '1. Go to your Supabase Dashboard',
              '2. Open SQL Editor',
              '3. Run this SQL:',
              createTableQuery,
              '4. Then try this fix again'
            ]
          })
        }
        
        return NextResponse.json({
          success: false,
          error: 'Failed to insert user into database',
          details: insertError
        })
      }

      insertResult = insertData
    } catch (err) {
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: err
      })
    }

    // Step 2: Verify the user was added
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to verify user was added',
        details: verifyError
      })
    }

    return NextResponse.json({
      success: true,
      message: 'User successfully added to database with admin role',
      user: verifyData,
      insertResult
    })

  } catch (error) {
    console.error('Error in setup user complete API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
