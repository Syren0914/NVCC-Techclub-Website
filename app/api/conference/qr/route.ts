import { NextRequest } from 'next/server'
import * as QRCode from 'qrcode'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const rawUrl = searchParams.get('url')
    const download = searchParams.get('download')

    if (!code && !rawUrl) {
      return new Response('Missing code or url', { status: 400 })
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    const content = rawUrl || `${origin}/conference/verify?code=${encodeURIComponent(code || '')}`

    const pngBuffer = await QRCode.toBuffer(content, { type: 'png', width: 256, margin: 1 })
    const headers = new Headers({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable'
    })
    if (download) {
      headers.set('Content-Disposition', `attachment; filename="conference-qr-${code || 'link'}.png"`)
    }
    return new Response(pngBuffer, { status: 200, headers })
  } catch (err) {
    return new Response('QR generation error', { status: 500 })
  }
}


