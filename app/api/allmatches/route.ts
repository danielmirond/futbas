import { NextResponse } from 'next/server'

const LEAGUES = [
  { id: 'esp.1', name: 'LaLiga EA Sports' },
  { id: 'esp.2', name: 'LaLiga Hypermotion' },
  { id: 'eng.1', name: 'Premier League' },
  { id: 'ger.1', name: 'Bundesliga' },
  { id: 'ita.1', name: 'Serie A' },
  { id: 'fra.1', name: 'Ligue 1' },
  { id: 'uefa.champions', name: 'Champions League' },
  { id: 'uefa.europa', name: 'Europa League' },
  { id: 'uefa.europa.conf', name: 'Conference League' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const dateCompact = date.replace(/-/g, '')

  try {
    // Fetch scoreboard for all leagues in parallel
    const results = await Promise.allSettled(
      LEAGUES.map(async (league) => {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard?dates=${dateCompact}`,
          { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) }
        )
        if (!res.ok) return []
        const data = await res.json()
        const events = (data?.events as Record<string, unknown>[]) || []

        return events.map((ev, i) => {
          const c = (ev.competitions as Record<string, unknown>[])?.[0]
          if (!c) return null
          const competitors = (c.competitors as Record<string, unknown>[]) || []
          if (competitors.length < 2) return null

          const home = competitors.find((t: Record<string, unknown>) => t.homeAway === 'home') || competitors[0]
          const away = competitors.find((t: Record<string, unknown>) => t.homeAway === 'away') || competitors[1]
          const hTeam = home.team as Record<string, unknown>
          const aTeam = away.team as Record<string, unknown>

          const status = c.status as Record<string, unknown> | undefined
          const statusType = status?.type as Record<string, unknown> | undefined
          const state = String(statusType?.state || '')

          const hScore = home.score
          const aScore = away.score
          const sh = typeof hScore === 'object' ? Number((hScore as Record<string, unknown>)?.displayValue || 0) : Number(hScore || 0)
          const sa = typeof aScore === 'object' ? Number((aScore as Record<string, unknown>)?.displayValue || 0) : Number(aScore || 0)

          // Time in Madrid timezone
          const matchDate = new Date(String(c.date || ''))
          const time = matchDate.toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false })

          let score: { h: number; a: number; st: string; min?: number } | undefined
          if (state === 'post') {
            score = { h: sh, a: sa, st: 'FT' }
          } else if (state === 'in') {
            const detail = String(statusType?.shortDetail || '')
            const minMatch = detail.match(/(\d+)'/)
            score = { h: sh, a: sa, st: '1H', min: minMatch ? Number(minMatch[1]) : undefined }
          }

          return {
            id: 5000 + i + LEAGUES.indexOf(LEAGUES.find(l => l.name === league.name)!) * 100,
            time,
            date,
            home: String(hTeam?.shortDisplayName || hTeam?.displayName || '?'),
            away: String(aTeam?.shortDisplayName || aTeam?.displayName || '?'),
            comp: league.name,
            ch: [] as string[], // No TV info from ESPN — will be merged with WOSTI
            score,
          }
        }).filter(Boolean)
      })
    )

    type MatchOut = {
      id: number; time: string; date: string; home: string; away: string
      comp: string; ch: string[]; score?: { h: number; a: number; st: string; min?: number }
    }
    const allMatches: MatchOut[] = []
    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        for (const m of r.value) {
          if (m) allMatches.push(m as MatchOut)
        }
      }
    }

    allMatches.sort((a, b) => a.time.localeCompare(b.time))

    return NextResponse.json({
      matches: allMatches,
      count: allMatches.length,
      date,
      source: 'espn',
    })
  } catch (err) {
    return NextResponse.json({ matches: [], count: 0, error: String(err), date })
  }
}
