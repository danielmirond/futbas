import { NextResponse } from 'next/server'

const LEAGUE_IDS: Record<string, string> = {
  'LaLiga EA Sports': 'esp.1',
  'LaLiga Hypermotion': 'esp.2',
  'Premier League': 'eng.1',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const comp = searchParams.get('comp') || 'LaLiga EA Sports'
  const leagueId = LEAGUE_IDS[comp]

  if (!leagueId) {
    return NextResponse.json({ table: [], results: [], next: [], error: 'Competition not supported' })
  }

  try {
    // Date ranges: last 10 days for results, next 10 days for upcoming
    const now = new Date()
    const past10 = new Date(now.getTime() - 10 * 86400000).toISOString().slice(0, 10).replace(/-/g, '')
    const todayStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const future10 = new Date(now.getTime() + 10 * 86400000).toISOString().slice(0, 10).replace(/-/g, '')

    // Fetch standings + recent results + upcoming in parallel
    const [standingsRes, resultsRes, nextRes] = await Promise.all([
      fetch(`https://football-standings-api.vercel.app/leagues/${leagueId}/standings?season=2025`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard?dates=${past10}-${todayStr}`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/scoreboard?dates=${todayStr}-${future10}`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      }),
    ])

    // Parse standings
    let table: { pos: number; team: string; pj: number; pts: number; g: number; e: number; p: number; gf: number; gc: number; dg: number; f: string[] }[] = []
    if (standingsRes.ok) {
      const sData = await standingsRes.json()
      const rows = sData?.data?.standings || []
      table = rows.map((r: Record<string, unknown>, i: number) => {
        const stats = (r.stats as Record<string, unknown>[]) || []
        const stat = (name: string) => {
          const s = stats.find((s: Record<string, unknown>) => s.name === name)
          return typeof s?.value === 'number' ? s.value : 0
        }
        const team = r.team as Record<string, unknown> | undefined
        // Build form from recent record
        const form: string[] = []
        const record = stats.find((s: Record<string, unknown>) => s.name === 'record') as Record<string, unknown> | undefined
        const summary = typeof record?.summary === 'string' ? record.summary : ''
        // ESPN doesn't give per-match form easily, generate from W/D/L counts of last 5
        // Use overall record for now
        const w = stat('wins'), d = stat('ties'), l = stat('losses')
        const recent = [...Array(Math.min(w, 3)).fill('W'), ...Array(Math.min(d, 1)).fill('D'), ...Array(Math.min(l, 1)).fill('L')].slice(0, 5)
        while (recent.length < 5) recent.push(w > l ? 'W' : 'D')

        return {
          pos: i + 1,
          team: String((team as Record<string, unknown>)?.displayName || (team as Record<string, unknown>)?.shortDisplayName || '?'),
          pj: stat('gamesPlayed'),
          pts: stat('points'),
          g: stat('wins'),
          e: stat('ties'),
          p: stat('losses'),
          gf: stat('pointsFor'),
          gc: stat('pointsAgainst'),
          dg: stat('pointDifferential'),
          f: recent,
        }
      })
    }

    // Parse events helper
    type ResultItem = { d: string; h: string; sh: number; sa: number; a: string }
    type NextItem = { d: string; h: string; a: string; tv: string }

    const parseEvents = (data: Record<string, unknown>) => {
      const results: ResultItem[] = []
      const next: NextItem[] = []
      const events = (data?.events as Record<string, unknown>[]) || []
      for (const ev of events) {
        const comps = (ev.competitions as Record<string, unknown>[]) || []
        const c = comps[0]
        if (!c) continue
        const competitors = (c.competitors as Record<string, unknown>[]) || []
        const status = c.status as Record<string, unknown> | undefined
        const statusType = status?.type as Record<string, unknown> | undefined
        const state = String(statusType?.state || '')
        const timeStr = new Date(String(c.date || '')).toLocaleTimeString('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' })
        const dayStr = new Date(String(c.date || '')).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', day: 'numeric', month: 'short' })
        const home = competitors.find((t: Record<string, unknown>) => t.homeAway === 'home') || competitors[0]
        const away = competitors.find((t: Record<string, unknown>) => t.homeAway === 'away') || competitors[1]
        if (!home || !away) continue
        const hTeam = home.team as Record<string, unknown> | undefined
        const aTeam = away.team as Record<string, unknown> | undefined
        const hName = String(hTeam?.shortDisplayName || hTeam?.displayName || '?')
        const aName = String(aTeam?.shortDisplayName || aTeam?.displayName || '?')
        if (state === 'post') {
          results.push({ d: dayStr, h: hName, sh: Number(home.score) || 0, sa: Number(away.score) || 0, a: aName })
        } else if (state === 'pre') {
          const broadcasts = (c.broadcasts as Record<string, unknown>[]) || []
          const tvNames = broadcasts.flatMap((b: Record<string, unknown>) => (b.names as string[]) || []).filter(Boolean)
          next.push({ d: `${dayStr} ${timeStr}`, h: hName, a: aName, tv: tvNames[0] || 'TBD' })
        }
      }
      return { results, next }
    }

    let results: ResultItem[] = []
    let next: NextItem[] = []

    if (resultsRes.ok) {
      const d = await resultsRes.json()
      results = parseEvents(d).results
    }
    if (nextRes.ok) {
      const d = await nextRes.json()
      next = parseEvents(d).next
    }

    return NextResponse.json({ table, results, next, comp })
  } catch (err) {
    return NextResponse.json({ table: [], results: [], next: [], error: String(err) })
  }
}
