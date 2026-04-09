import { NextResponse } from 'next/server'
import { scrapeClassification } from '@/lib/scraper/clasificacion'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? 'Primera Catalana'
  const group = searchParams.get('group') ?? 'Grup 1'
  const season = searchParams.get('season') ?? '2025-2026'

  try {
    const data = await scrapeClassification(category, group, season)
    return NextResponse.json({ data, category, group, season })
  } catch (error) {
    console.error('[api/scraper/clasificacion] Error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape classification' },
      { status: 500 }
    )
  }
}
