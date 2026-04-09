import { NextResponse } from 'next/server'
import { scrapeActa } from '@/lib/scraper/acta'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 })
  }

  try {
    const data = await scrapeActa(url)
    return NextResponse.json({ data, url })
  } catch (error) {
    console.error('[api/scraper/acta] Error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape acta' },
      { status: 500 }
    )
  }
}
