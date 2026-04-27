import { NextResponse } from 'next/server'
import fallback20260427 from './fallback-2026-04-27.json'
import fallback20260428 from './fallback-2026-04-28.json'
import fallback20260429 from './fallback-2026-04-29.json'
import fallback20260430 from './fallback-2026-04-30.json'
import fallback20260501 from './fallback-2026-05-01.json'
import fallback20260502 from './fallback-2026-05-02.json'
import fallback20260503 from './fallback-2026-05-03.json'
import fallback20260504 from './fallback-2026-05-04.json'
import fallback20260505 from './fallback-2026-05-05.json'
import fallback20260506 from './fallback-2026-05-06.json'
import fallback20260507 from './fallback-2026-05-07.json'
import fallback20260508 from './fallback-2026-05-08.json'
import fallback20260509 from './fallback-2026-05-09.json'

const KEY  = process.env.RAPIDAPI_KEY
const HOST = process.env.RAPIDAPI_HOST
const HEADERS = KEY && HOST ? {
  'x-rapidapi-key':  KEY,
  'x-rapidapi-host': HOST,
} : null

// Static fallbacks keyed by date (used when WOSTI API is rate-limited)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FALLBACKS: Record<string, any[]> = {
  '2026-04-27': fallback20260427,
  '2026-04-28': fallback20260428,
  '2026-04-29': fallback20260429,
  '2026-04-30': fallback20260430,
  '2026-05-01': fallback20260501,
  '2026-05-02': fallback20260502,
  '2026-05-03': fallback20260503,
  '2026-05-04': fallback20260504,
  '2026-05-05': fallback20260505,
  '2026-05-06': fallback20260506,
  '2026-05-07': fallback20260507,
  '2026-05-08': fallback20260508,
  '2026-05-09': fallback20260509,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  if (!HEADERS) {
    return NextResponse.json({ matches: [], count: 0, endpoint: 'no-api-key', date })
  }

  try {
    const res = await fetch(`https://${HOST}/api/Events`, {
      headers: HEADERS,
      next: { revalidate: 43200 },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const fb = FALLBACKS[date]
      if (fb) return NextResponse.json({ matches: fb, count: fb.length, endpoint: 'fallback', date })
      return NextResponse.json({ matches: [], count: 0, endpoint: 'api-error', error: `API ${res.status}`, date })
    }

    const raw = await res.json()
    type WostiMatch = Record<string, unknown>
    const rawMatches: WostiMatch[] = Array.isArray(raw) ? raw : []

    const WOSTI_NAME_MAP: Record<string, string> = {
      'La Liga EA Sports': 'LaLiga EA Sports',
      'Serie A Italiana': 'Serie A',
      'Francia Ligue 1': 'Ligue 1',
    }

    const IMG = '/api/badge?img='
    const matches = rawMatches.map((m) => {
      const local = m.LocalTeam  as Record<string, unknown> | undefined
      const away  = m.AwayTeam   as Record<string, unknown> | undefined
      const comp  = m.Competition as Record<string, unknown> | undefined
      const chs   = Array.isArray(m.Channels)
        ? (m.Channels as Record<string, unknown>[]).map(c => ({
            name:  String(c.Name  ?? ''),
            image: c.Image ? `${IMG}${String(c.Image)}` : '',
          }))
        : []

      let time = '??:??'
      let localDateStr = ''
      if (typeof m.Date === 'string') {
        const d = new Date(m.Date)
        const madridTime = new Intl.DateTimeFormat('es-ES', {
          timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false,
        }).format(d)
        const madridDate = new Intl.DateTimeFormat('es-ES', {
          timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
        }).format(d)
        const [dd, mm, yyyy] = madridDate.split('/')
        localDateStr = `${yyyy}-${mm}-${dd}`
        time = madridTime
      }

      return {
        id:          m.Id,
        time,
        date:        m.Date,
        localDate:   localDateStr,
        home:        String(local?.Name ?? '—'),
        away:        String(away?.Name  ?? '—'),
        homeBadge:   local?.Image ? `${IMG}${String(local.Image)}` : '',
        awayBadge:   away?.Image  ? `${IMG}${String(away.Image)}`  : '',
        competition: WOSTI_NAME_MAP[String(comp?.Name ?? '')] || String(comp?.Name ?? ''),
        channels:    chs as { name: string; image: string }[],
      }
    })

    const filtered = matches
      .filter(m => m.localDate === date && m.competition)
    filtered.sort((a, b) => String(a.time).localeCompare(String(b.time)))

    return NextResponse.json({
      matches:  filtered,
      count:    filtered.length,
      endpoint: '/api/Events',
      date,
    })
  } catch (err) {
    return NextResponse.json({ matches: [], count: 0, endpoint: 'error', error: String(err), date })
  }
}
