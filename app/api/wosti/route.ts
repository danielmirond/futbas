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

// Caché en proceso — sobrevive warm starts, evita llamadas repetidas a WOSTI
declare global { var __wostiCache: { data: unknown[]; ts: number } | undefined }
const TTL = 6 * 60 * 60 * 1000 // 6 horas en ms

function getCache() { return global.__wostiCache }
function setCache(data: unknown[]) { global.__wostiCache = { data, ts: Date.now() } }
function cacheValid() {
  const c = getCache()
  return c && Date.now() - c.ts < TTL
}

type WostiOut = {
  id: unknown; time: string; localDate: string
  home: string; away: string; homeBadge: string; awayBadge: string
  competition: string; channels: { name: string; image: string }[]
}

function parseMatches(rawMatches: Record<string, unknown>[]): WostiOut[] {
  return rawMatches.map((m) => {
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
      channels:    chs,
    }
  }).filter(m => m.localDate && m.competition)
}

// Devuelve TODOS los partidos WOSTI disponibles (sin filtro de fecha)
// El cliente filtra por fecha. Caché en proceso de 6h para no rebasar el rate limit.
export async function GET() {
  // Servir desde caché si está válida
  if (cacheValid()) {
    const cached = getCache()!
    return NextResponse.json({ matches: cached.data, endpoint: 'cache', count: cached.data.length })
  }

  if (!HEADERS) {
    return NextResponse.json({ matches: [], endpoint: 'no-api-key' })
  }

  try {
    const res = await fetch(`https://${HOST}/api/Events`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10000),
      cache: 'no-store', // dejamos el TTL a nuestra caché global, no a fetch
    })

    if (!res.ok) {
      // Devolver caché expirada si existe antes de fallar
      const stale = getCache()
      if (stale) return NextResponse.json({ matches: stale.data, endpoint: 'stale-cache', count: stale.data.length })
      return NextResponse.json({ matches: [], endpoint: `api-error-${res.status}` })
    }

    const raw = await res.json()
    const rawMatches: Record<string, unknown>[] = Array.isArray(raw) ? raw : []
    const matches = parseMatches(rawMatches)

    setCache(matches)
    return NextResponse.json({ matches, endpoint: 'wosti-live', count: matches.length })
  } catch (err) {
    const stale = getCache()
    if (stale) return NextResponse.json({ matches: stale.data, endpoint: 'stale-cache', count: stale.data.length })
    return NextResponse.json({ matches: [], endpoint: 'error', error: String(err) })
  }
}
