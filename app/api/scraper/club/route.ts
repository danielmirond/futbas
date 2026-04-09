import { NextResponse } from 'next/server'
import { scrapeClub, scrapeClubDirectory } from '@/lib/scraper/club'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  try {
    if (url) {
      const data = await scrapeClub(url)
      return NextResponse.json({ data, url })
    }

    const data = await scrapeClubDirectory()
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[api/scraper/club] Error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape club data' },
      { status: 500 }
    )
  }
}
