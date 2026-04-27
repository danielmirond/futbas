import { NextResponse } from 'next/server'

/* ── Types ─────────────────────────────────────────────────────── */
type MatchOut = {
  id: number; time: string; date: string; home: string; away: string
  comp: string; ch: string[]; score?: { h: number; a: number; st: string; min?: number }
}

/* ── SportMonks ─────────────────────────────────────────────────── */
const SM_TOKEN = process.env.SPORTMONKS_API_TOKEN

// Map SportMonks league names → our display names
const SM_LEAGUE_MAP: Record<string, string> = {
  'La Liga':                            'LaLiga EA Sports',
  'LaLiga':                             'LaLiga EA Sports',
  'La Liga 2':                          'LaLiga Hypermotion',
  'LaLiga2':                            'LaLiga Hypermotion',
  'LaLiga Hypermotion':                 'LaLiga Hypermotion',
  'Segunda División':                   'LaLiga Hypermotion',
  'Primera Federación':                 'Primera Federación',
  'Copa del Rey':                       'Copa del Rey',
  'Supercopa de España':                'Supercopa',
  'Liga F':                             'Liga F',
  'Premier League':                     'Premier League',
  'FA Cup':                             'FA Cup',
  'Bundesliga':                         'Bundesliga',
  '2. Bundesliga':                      '2. Bundesliga',
  'Serie A':                            'Serie A',
  'Serie B':                            'Serie B Italiana',
  'Ligue 1':                            'Ligue 1',
  'UEFA Champions League':              'Champions League',
  'UEFA Europa League':                 'Europa League',
  'UEFA Europa Conference League':      'Conference League',
  'UEFA Conference League':             'Conference League',
  'UEFA Nations League':                'UEFA Nations League',
  'MLS':                                'MLS',
  'Liga MX':                            'Liga MX',
  'Copa Libertadores':                  'Copa Libertadores',
  'Copa Sudamericana':                  'Copa Sudamericana',
  'Saudi Pro League':                   'Saudi Pro League',
}

// SportMonks state_id → match state
// 1=NS 2=Live1H 3=HT 4=Live2H 5=FT 6=ET 7=AET 8=Break 9=PEN 10=Awarded
// 11=Post 12=Canc 13=Aband 16=FTonAET 17=PENshootout
const SM_LIVE_IDS  = new Set([2, 3, 4, 6, 8, 9, 15])
const SM_POST_IDS  = new Set([5, 7, 10, 16, 17])

async function fetchSportMonks(date: string): Promise<MatchOut[] | null> {
  if (!SM_TOKEN) return null

  try {
    const matches: MatchOut[] = []
    let page = 1

    while (page <= 10) {
      const url = new URL(`https://api.sportmonks.com/v3/football/fixtures/date/${date}`)
      url.searchParams.set('api_token', SM_TOKEN)
      url.searchParams.set('include', 'participants;league;scores;state')
      url.searchParams.set('per_page', '100')
      url.searchParams.set('page', String(page))

      const res = await fetch(url.toString(), {
        next: { revalidate: 120 },
        signal: AbortSignal.timeout(10000),
      })
      if (!res.ok) return null   // auth error, quota, etc. → fall back to ESPN

      const body = await res.json()
      const fixtures = (body?.data as Record<string, unknown>[]) || []

      for (const f of fixtures) {
        const participants = (f.participants as Record<string, unknown>[]) || []
        const home = participants.find(p => (p.meta as Record<string,unknown>)?.location === 'home')
        const away = participants.find(p => (p.meta as Record<string,unknown>)?.location === 'away')
        if (!home || !away) continue

        const league = f.league as Record<string, unknown> | undefined
        const rawLeagueName = String(league?.name || '')
        const leagueName = SM_LEAGUE_MAP[rawLeagueName] || rawLeagueName

        // Parse UTC time → Madrid local time
        const rawDate = String(f.starting_at || '')
        const d = new Date(rawDate.includes('T') ? rawDate : rawDate.replace(' ', 'T') + 'Z')
        const time = isNaN(d.getTime()) ? '??:??' : d.toLocaleTimeString('es-ES', {
          timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false,
        })

        // State
        const stateId = Number(f.state_id || 0)
        const stateObj = f.state as Record<string, unknown> | undefined
        const stShort  = String(stateObj?.short_name || stateObj?.name || '').toUpperCase()
        const isPost   = SM_POST_IDS.has(stateId) || stShort === 'FT' || stShort === 'AET'
        const isLive   = SM_LIVE_IDS.has(stateId) || stShort === 'LIVE' || stShort === 'HT'

        // Score from scores array (description=CURRENT is the running total)
        const scores = (f.scores as Record<string, unknown>[]) || []
        let sh = 0, sa = 0
        for (const s of scores) {
          const desc = String((s.score as Record<string,unknown>)?.description ?? s.description ?? '')
            .toUpperCase()
          if (desc !== 'CURRENT' && desc !== 'FT' && desc !== 'AET') continue
          const sc = s.score as Record<string, unknown>
          if (sc?.participant === 'home') sh = Number(sc.goals ?? 0)
          if (sc?.participant === 'away') sa = Number(sc.goals ?? 0)
        }

        let score: MatchOut['score']
        if (isPost) score = { h: sh, a: sa, st: 'FT' }
        else if (isLive) {
          const min = stateId === 3 ? undefined : undefined // could parse detail
          score = { h: sh, a: sa, st: stShort === 'HT' ? 'HT' : 'LIVE', min }
        }

        matches.push({
          id: Number(f.id ?? 0),
          time,
          date,
          home: String(home.name || '?'),
          away: String(away.name || '?'),
          comp: leagueName,
          ch: [],
          score,
        })
      }

      // Pagination
      const pagination = body?.pagination as Record<string, unknown> | undefined
      if (!pagination?.has_more) break
      page++
    }

    matches.sort((a, b) => a.time.localeCompare(b.time))
    return matches
  } catch {
    return null   // timeout or network error → fall back to ESPN
  }
}

/* ── ESPN fallback ──────────────────────────────────────────────── */
const ESPN_LEAGUES = [
  { id: 'esp.1',          name: 'LaLiga EA Sports' },
  { id: 'esp.2',          name: 'LaLiga Hypermotion' },
  { id: 'eng.1',          name: 'Premier League' },
  { id: 'ger.1',          name: 'Bundesliga' },
  { id: 'ita.1',          name: 'Serie A' },
  { id: 'fra.1',          name: 'Ligue 1' },
  { id: 'uefa.champions', name: 'Champions League' },
  { id: 'uefa.europa',    name: 'Europa League' },
  { id: 'uefa.europa.conf', name: 'Conference League' },
]

async function fetchESPN(date: string): Promise<MatchOut[]> {
  const dateCompact = date.replace(/-/g, '')

  const results = await Promise.allSettled(
    ESPN_LEAGUES.map(async (league, li) => {
      const res = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard?dates=${dateCompact}`,
        { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) }
      )
      if (!res.ok) return []
      const data = await res.json()
      const events = (data?.events as Record<string, unknown>[]) || []

      return events.map((ev, i): MatchOut | null => {
        const c = (ev.competitions as Record<string, unknown>[])?.[0]
        if (!c) return null
        const competitors = (c.competitors as Record<string, unknown>[]) || []
        if (competitors.length < 2) return null

        const home = competitors.find(t => t.homeAway === 'home') || competitors[0]
        const away = competitors.find(t => t.homeAway === 'away') || competitors[1]
        const hTeam = home.team as Record<string, unknown>
        const aTeam = away.team as Record<string, unknown>

        const status     = c.status as Record<string, unknown> | undefined
        const statusType = status?.type as Record<string, unknown> | undefined
        const state      = String(statusType?.state || '')

        const hScore = home.score
        const aScore = away.score
        const sh = typeof hScore === 'object' ? Number((hScore as Record<string,unknown>)?.displayValue ?? 0) : Number(hScore ?? 0)
        const sa = typeof aScore === 'object' ? Number((aScore as Record<string,unknown>)?.displayValue ?? 0) : Number(aScore ?? 0)

        const matchDate = new Date(String(c.date || ''))
        const time = matchDate.toLocaleTimeString('es-ES', {
          timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false,
        })

        let score: MatchOut['score']
        if (state === 'post') {
          score = { h: sh, a: sa, st: 'FT' }
        } else if (state === 'in') {
          const detail = String(statusType?.shortDetail || '')
          const minMatch = detail.match(/(\d+)'/)
          score = { h: sh, a: sa, st: 'LIVE', min: minMatch ? Number(minMatch[1]) : undefined }
        }

        return {
          id: 5000 + li * 100 + i,
          time,
          date,
          home: String(hTeam?.shortDisplayName || hTeam?.displayName || '?'),
          away: String(aTeam?.shortDisplayName || aTeam?.displayName || '?'),
          comp: league.name,
          ch: [],
          score,
        }
      }).filter((m): m is MatchOut => m !== null)
    })
  )

  const out: MatchOut[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') out.push(...r.value)
  }
  out.sort((a, b) => a.time.localeCompare(b.time))
  return out
}

/* ── Handler ────────────────────────────────────────────────────── */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  try {
    // 1. Try SportMonks (primary)
    const smMatches = await fetchSportMonks(date)
    if (smMatches !== null) {
      return NextResponse.json({
        matches: smMatches,
        count: smMatches.length,
        date,
        source: 'sportmonks',
      })
    }

    // 2. Fall back to ESPN
    const espnMatches = await fetchESPN(date)
    return NextResponse.json({
      matches: espnMatches,
      count: espnMatches.length,
      date,
      source: 'espn',
    })
  } catch (err) {
    return NextResponse.json({ matches: [], count: 0, error: String(err), date })
  }
}
