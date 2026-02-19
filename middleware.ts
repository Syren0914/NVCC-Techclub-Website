import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  // Only run middleware on admin routes where auth checks may be needed later
  matcher: ['/admin/:path*'],
}
