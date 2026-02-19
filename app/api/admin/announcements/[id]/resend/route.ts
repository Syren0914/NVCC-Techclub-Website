import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function isAdmin(user: any): Promise<boolean> {
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    return userData?.role === 'admin'
  } catch {
    return false
  }
}

// POST - Resend announcement to failed recipients or all
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
    }

    const adminCheck = await isAdmin(user)
    if (!adminCheck) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { resendType = 'failed' } = body

    const { data: announcement, error: announcementError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', params.id)
      .single()

    if (announcementError || !announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    let targetDeliveries: { id: number; recipient_email: string; recipient_name: string }[] = []

    if (resendType === 'all') {
      // Clear existing delivery records
      await supabase
        .from('announcement_deliveries')
        .delete()
        .eq('announcement_id', params.id)

      if (announcement.recipient_type === 'all') {
        const { data: members, error: membersError } = await supabase
          .from('membership_applications')
          .select('email, first_name, last_name')
          .eq('status', 'approved')

        if (membersError) {
          return NextResponse.json({ error: 'Failed to fetch member list' }, { status: 500 })
        }

        const newDeliveries = (members || []).map(member => ({
          announcement_id: params.id,
          recipient_email: member.email,
          recipient_name: `${member.first_name} ${member.last_name}`.trim(),
          status: 'pending'
        }))

        if (newDeliveries.length > 0) {
          const { data: createdDeliveries } = await supabase
            .from('announcement_deliveries')
            .insert(newDeliveries)
            .select()

          targetDeliveries = createdDeliveries || []
        }
      } else {
        const specificEmails = announcement.recipient_emails || []

        const newDeliveries = specificEmails.map((email: string) => ({
          announcement_id: params.id,
          recipient_email: email,
          recipient_name: 'Member',
          status: 'pending'
        }))

        if (newDeliveries.length > 0) {
          const { data: createdDeliveries } = await supabase
            .from('announcement_deliveries')
            .insert(newDeliveries)
            .select()

          targetDeliveries = createdDeliveries || []
        }
      }
    } else {
      const { data: failedDeliveries, error: deliveriesError } = await supabase
        .from('announcement_deliveries')
        .select('*')
        .eq('announcement_id', params.id)
        .in('status', ['failed', 'bounced'])

      if (deliveriesError) {
        return NextResponse.json({ error: 'Failed to fetch delivery records' }, { status: 500 })
      }

      targetDeliveries = failedDeliveries || []

      // Reset status to pending
      if (targetDeliveries.length > 0) {
        await supabase
          .from('announcement_deliveries')
          .update({ status: 'pending', error_message: null })
          .in('id', targetDeliveries.map(d => d.id))
      }
    }

    if (targetDeliveries.length === 0) {
      return NextResponse.json(
        { error: resendType === 'all' ? 'No recipients found' : 'No failed deliveries to resend' },
        { status: 400 }
      )
    }

    let successCount = 0
    let failureCount = 0
    const fromAddress = process.env.RESEND_FROM || 'TechClub <noreply@resend.dev>'
    const BATCH_SIZE = 100

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">TechClub Announcement</h1>
        </div>
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <h2 style="color: #333; margin-top: 0;">${announcement.title}</h2>
          <div style="color: #555; line-height: 1.6; margin: 20px 0;">
            ${announcement.message}
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            This announcement was sent by ${announcement.sender_name} to TechClub members.
          </p>
          <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
            Priority: ${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} | ${resendType === 'all' ? 'Resent to All' : 'Resent'}
          </p>
        </div>
      </div>
    `

    // Send in batches of 100
    for (let i = 0; i < targetDeliveries.length; i += BATCH_SIZE) {
      const batch = targetDeliveries.slice(i, i + BATCH_SIZE)

      const emailPayloads = batch.map(d => ({
        from: fromAddress,
        to: [d.recipient_email],
        subject: `[TechClub] ${announcement.title}`,
        html: emailHtml
      }))

      try {
        const batchResult = await resend.batch.send(emailPayloads)

        if (batchResult.error) {
          failureCount += batch.length
          await supabase
            .from('announcement_deliveries')
            .update({
              status: 'failed',
              error_message: batchResult.error.message || 'Batch send failed'
            })
            .in('id', batch.map(d => d.id))
        } else if (batchResult.data) {
          const results = batchResult.data.data ?? batchResult.data
          const resultArray = Array.isArray(results) ? results : [results]

          for (let j = 0; j < batch.length; j++) {
            const delivery = batch[j]
            const result = resultArray[j]

            if (result?.id) {
              successCount++
              await supabase
                .from('announcement_deliveries')
                .update({
                  status: 'sent',
                  email_id: result.id,
                  sent_at: new Date().toISOString()
                })
                .eq('id', delivery.id)
            } else {
              failureCount++
              await supabase
                .from('announcement_deliveries')
                .update({
                  status: 'failed',
                  error_message: 'No email ID returned'
                })
                .eq('id', delivery.id)
            }
          }
        }
      } catch (err) {
        failureCount += batch.length
        await supabase
          .from('announcement_deliveries')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown error'
          })
          .in('id', batch.map(d => d.id))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Resend completed! ${successCount} successful, ${failureCount} failed out of ${targetDeliveries.length} attempts`,
      stats: {
        total: targetDeliveries.length,
        successful: successCount,
        failed: failureCount,
        resendType
      }
    })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
