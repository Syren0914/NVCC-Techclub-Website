import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, check_in } = body || {}

    if (!code) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const { data: record, error } = await admin
      .from('conference_registrations')
      .select('*')
      .eq('unique_code', code)
      .single()

    if (error || !record) {
      return NextResponse.json({ valid: false, message: 'Code not found' }, { status: 404 })
    }

    if (check_in) {
      const { error: updateError, data: updated } = await admin
        .from('conference_registrations')
        .update({ checked_in: true, checked_in_at: new Date().toISOString() })
        .eq('id', record.id)
        .select('*')
        .single()

      if (updateError) {
        return NextResponse.json({ valid: true, check_in: false, message: 'Failed to check in' }, { status: 500 })
      }

      return NextResponse.json({ valid: true, check_in: true, attendee: { first_name: updated.first_name, last_name: updated.last_name, email: updated.email } })
    }

    return NextResponse.json({ valid: true, attendee: { first_name: record.first_name, last_name: record.last_name, email: record.email, checked_in: record.checked_in } })
  } catch (error) {
    console.error('Error in conference verify API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


