import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .order('year', { ascending: true })

    if (error) {
      console.error('Error fetching milestones:', error)
      return NextResponse.json(
        { error: 'Failed to fetch milestones' },
        { status: 500 }
      )
    }

    return NextResponse.json(milestones || [])
  } catch (error) {
    console.error('Error in milestones API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

