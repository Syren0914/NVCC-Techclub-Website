import { NextResponse } from 'next/server'

export async function GET() {
  // Check server-side environment variables
  const envStatus = {
    clerkPublishable: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    clerkSecret: !!process.env.CLERK_SECRET_KEY,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    resendApi: !!process.env.RESEND_API_KEY,
    supabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  return NextResponse.json(envStatus)
}
