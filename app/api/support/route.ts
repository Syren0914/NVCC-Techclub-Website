import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if RESEND_FROM is set to a verified domain
    const fromEmail = process.env.RESEND_FROM
    if (!fromEmail || fromEmail === 'onboarding@resend.dev') {
      return NextResponse.json(
        { error: 'Email service not configured. Please set RESEND_FROM to a verified domain email.' },
        { status: 500 }
      )
    }

    // Send email to TechClub
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: ['nvcctechclub@gmail.com'], // TechClub email
      subject: `Support Request: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Support Request</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">
            This message was sent from the TechClub website support form.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      )
    }

    // Send confirmation email to the user
    await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Thank you for contacting TechClub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for contacting TechClub!</h2>
          <p>Hi ${name},</p>
          <p>We've received your support request and will get back to you as soon as possible.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p>In the meantime, you can also:</p>
          <ul>
            <li>Join our <a href="https://discord.gg/pwcdweEwjM" style="color: #007bff;">Discord community</a> for immediate help</li>
            <li>Check out our <a href="/events" style="color: #007bff;">upcoming events</a></li>
            <li>Visit our <a href="/about" style="color: #007bff;">about page</a> for more information</li>
          </ul>
          <p>Best regards,<br>The TechClub Team</p>
        </div>
      `,
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Support request sent successfully' 
    })

  } catch (error) {
    console.error('Support API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
