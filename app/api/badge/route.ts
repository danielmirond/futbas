import { NextResponse } from 'next/server'
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const img = searchParams.get('img')
  if (!img) return new NextResponse('Missing img', { status: 400 })
  try {
    const res = await fetch(`https://static.futbolenlatv.com/img/32/${img}`, {
      headers: { 'Referer': 'https://www.futbolenlatv.es/', 'User-Agent': 'Mozilla/5.0' },
    })
    if (!res.ok) return new NextResponse('Not found', { status: 404 })
    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse('Error', { status: 500 })
  }
}
