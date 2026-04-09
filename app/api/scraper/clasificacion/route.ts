import { NextResponse } from 'next/server'
import { scrapeClassification, discoverCompetitions, discoverGroups } from '@/lib/scraper/clasificacion'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  // Discovery endpoints
  if (searchParams.get('discover') === 'competitions') {
    const temporada = searchParams.get('temporada') ?? '21'
    const data = await discoverCompetitions(temporada)
    return NextResponse.json(data)
  }

  if (searchParams.get('discover') === 'groups') {
    const data = await discoverGroups(
      searchParams.get('temporada') ?? '21',
      searchParams.get('tipo') ?? 'futbol-11',
      searchParams.get('categoria') ?? '19308233',
      searchParams.get('competicion') ?? '54322932',
    )
    return NextResponse.json(data)
  }

  // Classification scraping
  const season = searchParams.get('season') ?? '2526'
  const sport = searchParams.get('sport') ?? 'futbol-11'
  const category = searchParams.get('category') ?? 'primera-catalana'
  const group = searchParams.get('group') ?? 'grup-1'

  try {
    const data = await scrapeClassification(season, sport, category, group)
    return NextResponse.json({
      data,
      meta: { season, sport, category, group, count: data.length },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=7200' },
    })
  } catch (error) {
    console.error('[api/scraper/clasificacion] Error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape classification' },
      { status: 500 },
    )
  }
}
