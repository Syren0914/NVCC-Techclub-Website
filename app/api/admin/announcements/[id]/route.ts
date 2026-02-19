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

function buildEmailHtml(title: string, message: string, senderName: string, priority: string, tag?: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">TechClub Announcement</h1>
      </div>
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
        <h2 style="color: #333; margin-top: 0;">${title}</h2>
        <div style="color: #555; line-height: 1.6; margin: 20px 0;">
          ${message}
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          This announcement was sent by ${senderName} to TechClub members.
        </p>
        <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
          Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}${tag ? ` | ${tag}` : ''}
        </p>
      </div>
    </div>
  `
}

async function sendEmailBatch(
  recipients: { email: string; first_name: string; last_name: string }[],
  title: string,
  emailHtml: string,
  fromAddress: string,
  announcementId: string | number
) {
  const BATCH_SIZE = 100

  let successCount = 0
  let failureCount = 0

  const deliveryInserts = recipients.map(r => ({
    announcement_id: announcementId,
    recipient_email: r.email,
    recipient_name: `${r.first_name} ${r.last_name}`.trim(),
    status: 'pending'
  }))

  const { data: deliveries } = await supabase
    .from('announcement_deliveries')
    .insert(deliveryInserts)
    .select()

  const deliveryMap = new Map<string, number>()
  if (deliveries) {
    for (const d of deliveries) {
      deliveryMap.set(d.recipient_email, d.id)
    }
  }

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)

    const emailPayloads = batch.map(r => ({
      from: fromAddress,
      to: [r.email],
      subject: `[TechClub] ${title}`,
      html: emailHtml
    }))

    try {
      const batchResult = await resend.batch.send(emailPayloads)

      if (batchResult.error) {
        failureCount += batch.length
        const failedIds = batch
          .map(r => deliveryMap.get(r.email))
          .filter((id): id is number => id !== undefined)

        if (failedIds.length > 0) {
          await supabase
            .from('announcement_deliveries')
            .update({
              status: 'failed',
              error_message: batchResult.error.message || 'Batch send failed'
            })
            .in('id', failedIds)
        }
      } else if (batchResult.data) {
        const results = batchResult.data.data ?? batchResult.data
        const resultArray = Array.isArray(results) ? results : [results]

        for (let j = 0; j < batch.length; j++) {
          const recipient = batch[j]
          const result = resultArray[j]
          const deliveryId = deliveryMap.get(recipient.email)

          if (result?.id) {
            successCount++
            if (deliveryId) {
              await supabase
                .from('announcement_deliveries')
                .update({
                  status: 'sent',
                  email_id: result.id,
                  sent_at: new Date().toISOString()
                })
                .eq('id', deliveryId)
            }
          } else {
            failureCount++
            if (deliveryId) {
              await supabase
                .from('announcement_deliveries')
                .update({
                  status: 'failed',
                  error_message: 'No email ID returned'
                })
                .eq('id', deliveryId)
            }
          }
        }
      }
    } catch (err) {
      failureCount += batch.length
      const failedIds = batch
        .map(r => deliveryMap.get(r.email))
        .filter((id): id is number => id !== undefined)

      if (failedIds.length > 0) {
        await supabase
          .from('announcement_deliveries')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown error'
          })
          .in('id', failedIds)
      }
    }
  }

  return { successCount, failureCount }
}

// PUT - Update existing announcement
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const {
      title,
      message,
      recipientType,
      specificEmails = [],
      priority = 'normal',
      sendImmediately = false
    } = body

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    if (recipientType === 'specific' && (!specificEmails || specificEmails.length === 0)) {
      return NextResponse.json(
        { error: 'Specific email addresses are required when recipient type is specific' },
        { status: 400 }
      )
    }

    const { data: senderData } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    const senderName = senderData
      ? `${senderData.first_name} ${senderData.last_name}`
      : 'TechClub Admin'

    const { data: announcement, error: announcementError } = await supabase
      .from('announcements')
      .update({
        title,
        message,
        sender_id: user.id,
        sender_name: senderName,
        recipient_type: recipientType,
        recipient_emails: recipientType === 'specific' ? specificEmails : null,
        priority,
        status: sendImmediately ? 'sent' : 'draft',
        sent_at: sendImmediately ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (announcementError) {
      return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
    }

    let stats = null

    if (sendImmediately) {
      let recipients: { email: string; first_name: string; last_name: string }[] = []

      if (recipientType === 'all') {
        const { data: members, error: membersError } = await supabase
          .from('membership_applications')
          .select('email, first_name, last_name')
          .eq('status', 'approved')

        if (membersError) {
          return NextResponse.json({ error: 'Failed to fetch member list' }, { status: 500 })
        }

        recipients = members || []
      } else {
        recipients = specificEmails.map((email: string) => ({
          email,
          first_name: 'Member',
          last_name: ''
        }))
      }

      if (recipients.length === 0) {
        return NextResponse.json({ error: 'No recipients found' }, { status: 400 })
      }

      // Clear existing delivery records
      await supabase
        .from('announcement_deliveries')
        .delete()
        .eq('announcement_id', params.id)

      const fromAddress = process.env.RESEND_FROM || 'TechClub <noreply@resend.dev>'
      const emailHtml = buildEmailHtml(title, message, senderName, priority, 'Updated')

      const { successCount, failureCount } = await sendEmailBatch(
        recipients,
        title,
        emailHtml,
        fromAddress,
        params.id
      )

      stats = {
        total: recipients.length,
        successful: successCount,
        failed: failureCount
      }
    }

    return NextResponse.json({
      success: true,
      message: sendImmediately
        ? `Announcement updated and sent! ${stats!.successful} successful, ${stats!.failed} failed`
        : 'Announcement updated successfully',
      announcement,
      stats
    })

  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
