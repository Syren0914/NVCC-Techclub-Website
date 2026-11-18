# Email Setup Guide for TechClub

## Overview
This guide will help you set up email notifications for membership application approvals using Resend.

## Step 1: Install Resend Package

Run this command in your project directory:

```bash
npm install resend
```

## Step 2: Create a Resend Account

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## Step 3: Get Your API Key

1. In your Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name like "TechClub Email Service"
4. Copy the API key (starts with `re_`)

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
```

## Step 5: Verify Your Domain (Optional but Recommended)

1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps
4. Update the email sender in `/app/api/admin/send-approval-email/route.ts`:

```typescript
from: 'TechClub <noreply@yourdomain.com>',
```

## Step 6: Test the Email Functionality

1. Submit a test membership application at `/join`
2. Go to `/admin/applications`
3. Click the approve button (✓) on a pending application
4. Check the applicant's email for the congratulatory message

## Email Features

### ✅ What's Included:
- **Personalized greeting** with applicant's name
- **Approval confirmation** with their major and interests
- **Next steps** for joining the club
- **Member benefits** overview
- **Professional styling** with TechClub branding
- **Responsive design** that works on all devices

### 📧 Email Content:
- Congratulatory message
- Welcome to TechClub
- Information about their background
- What to expect as a member
- Benefits and opportunities
- Contact information

## Troubleshooting

### Common Issues:

1. **Email not sending**: Check your Resend API key is correct
2. **Domain verification**: Make sure your domain is verified in Resend
3. **Rate limits**: Free tier has 100 emails/day limit
4. **Spam folder**: Check if emails are going to spam

### Debug Steps:

1. Check the browser console for errors
2. Check the server logs for API errors
3. Verify the Resend API key is working
4. Test with a simple email first

## Production Setup

For production deployment:

1. **Use a verified domain** in Resend
2. **Set up proper DNS records** for email deliverability
3. **Monitor email delivery** in Resend dashboard
4. **Set up webhooks** for delivery tracking (optional)

## Security Notes

- Keep your Resend API key secure
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Consider rate limiting for the email API

## Support

If you need help:
1. Check Resend documentation: https://resend.com/docs
2. Review the API logs in your server
3. Test with Resend's email testing tools 