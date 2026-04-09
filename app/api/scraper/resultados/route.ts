import { NextResponse } from 'next/server'
import { scrapeResults } from '@/lib/scraper/resultados'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? 'Primera Catalana'
  const group = searchParams.get('group') ?? 'Grup 1'
  const season = searchParams.get('season') ?? '2025-2026'
  const matchday = searchParams.get('matchday')

  try {
    const data = await scrapeResults(
      category,
      group,
      season,
      matchday ? parseInt(matchday, 10) : undefined
    )
    return NextResponse.json({ data, category, group, season, matchday })
  } catch (error) {
    console.error('[api/scraper/resultados] Error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape results' },
      { status: 500 }
    )
  }
}
