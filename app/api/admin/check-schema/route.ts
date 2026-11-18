import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (tablesError) {
      console.error('Error fetching tables:', tablesError)
      return NextResponse.json(
        { error: 'Failed to fetch tables', details: tablesError },
        { status: 500 }
      )
    }

    // Check projects table structure
    const { data: projectColumns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'projects')

    if (columnsError) {
      console.error('Error fetching project columns:', columnsError)
      return NextResponse.json(
        { error: 'Failed to fetch project columns', details: columnsError },
        { status: 500 }
      )
    }

    // Check if projects table exists and has data
    const { data: projectCount, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      tables: tables?.map(t => t.table_name) || [],
      projectColumns: projectColumns || [],
      projectCount: projectCount?.length || 0,
      countError: countError
    })
  } catch (error) {
    console.error('Error in schema check:', error)
    return NextResponse.json(
      { error: 'Schema check failed', details: error },
      { status: 500 }
    )
  }
}
