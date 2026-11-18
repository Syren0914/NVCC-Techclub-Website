import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        isAdmin: false,
        error: 'No authorization header'
      })
    }

    // Verify the JWT token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({
        isAdmin: false,
        error: 'Invalid token',
        details: authError
      })
    }

    // Simple check: if user is authenticated and has the right email, they're admin
    const isAdmin = user.email === 'test@email.vccs.edu'

    return NextResponse.json({
      isAdmin: isAdmin,
      user: {
        id: user.id,
        email: user.email,
        role: isAdmin ? 'admin' : 'user'
      }
    })
  } catch (error) {
    console.error('Error in simple check API:', error)
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
