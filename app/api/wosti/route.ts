import { NextResponse } from 'next/server'

const KEY  = process.env.RAPIDAPI_KEY
const HOST = process.env.RAPIDAPI_HOST
const HEADERS = KEY && HOST ? {
  'x-rapidapi-key':  KEY,
  'x-rapidapi-host': HOST,
} : null

const WOSTI_NAME_MAP: Record<string, string> = {
  'La Liga EA Sports': 'LaLiga EA Sports',
  'Serie A Italiana': 'Serie A',
  'Francia Ligue 1': 'Ligue 1',
}

const IMG = '/api/badge?img='

// Devuelve TODOS los partidos WOSTI disponibles (sin filtro de fecha)
// Una sola llamada a la API — el cliente filtra por fecha
export async function GET() {
  if (!HEADERS) {
    return NextResponse.json({ matches: [], endpoint: 'no-api-key' })
  }

  try {
    const res = await fetch(`https://${HOST}/api/Events`, {
      headers: HEADERS,
      next: { revalidate: 43200 }, // 12h cache server-side
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return NextResponse.json({ matches: [], endpoint: `api-error-${res.status}` })
    }

    const raw = await res.json()
    type WostiMatch = Record<string, unknown>
    const rawMatches: WostiMatch[] = Array.isArray(raw) ? raw : []

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
      let localDate = ''
      if (typeof m.Date === 'string') {
        const d = new Date(m.Date)
        time = new Intl.DateTimeFormat('es-ES', {
          timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false,
        }).format(d)
        const [dd, mm, yyyy] = new Intl.DateTimeFormat('es-ES', {
          timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
        }).format(d).split('/')
        localDate = `${yyyy}-${mm}-${dd}`
      }

      return {
        id:          m.Id,
        time,
        localDate,
        home:        String(local?.Name ?? '—'),
        away:        String(away?.Name  ?? '—'),
        homeBadge:   local?.Image ? `${IMG}${String(local.Image)}` : '',
        awayBadge:   away?.Image  ? `${IMG}${String(away.Image)}`  : '',
        competition: WOSTI_NAME_MAP[String(comp?.Name ?? '')] || String(comp?.Name ?? ''),
        channels:    chs as { name: string; image: string }[],
      }
    }).filter(m => m.localDate && m.competition)

    return NextResponse.json({ matches, endpoint: 'wosti-all', count: matches.length })
  } catch (err) {
    return NextResponse.json({ matches: [], endpoint: 'error', error: String(err) })
  }
}
