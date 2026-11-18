import { NextResponse } from 'next/server'
import { supabase } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { data: resources, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching resources:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch resources' })
    }

    return NextResponse.json({ success: true, data: resources || [] })
  } catch (error) {
    console.error('Error in resources GET:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' })
  }
}

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'No authorization token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, url, file_url } = body

    if (!title || !description || !category) {
      return NextResponse.json({ success: false, error: 'Title, description, and category are required' })
    }

    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        title,
        description,
        category,
        url: url || null,
        file_url: file_url || null,
        views: 0,
        rating: 0,
        total_ratings: 0,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating resource:', error)
      return NextResponse.json({ success: false, error: 'Failed to create resource' })
    }

    return NextResponse.json({ success: true, data: resource })
  } catch (error) {
    console.error('Error in resources POST:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' })
  }
} 