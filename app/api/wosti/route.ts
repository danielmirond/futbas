import { NextResponse } from 'next/server'
import fb0427 from '../matches/fallback-2026-04-27.json'
import fb0428 from '../matches/fallback-2026-04-28.json'
import fb0429 from '../matches/fallback-2026-04-29.json'
import fb0430 from '../matches/fallback-2026-04-30.json'
import fb0501 from '../matches/fallback-2026-05-01.json'
import fb0502 from '../matches/fallback-2026-05-02.json'
import fb0503 from '../matches/fallback-2026-05-03.json'
import fb0504 from '../matches/fallback-2026-05-04.json'
import fb0505 from '../matches/fallback-2026-05-05.json'
import fb0506 from '../matches/fallback-2026-05-06.json'
import fb0507 from '../matches/fallback-2026-05-07.json'
import fb0508 from '../matches/fallback-2026-05-08.json'
import fb0509 from '../matches/fallback-2026-05-09.json'

const KEY  = process.env.RAPIDAPI_KEY
const HOST = process.env.RAPIDAPI_HOST
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin-md-2026'
const HEADERS = KEY && HOST ? { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } : null

const WOSTI_NAME_MAP: Record<string, string> = {
  'La Liga EA Sports': 'LaLiga EA Sports',
  'Serie A Italiana': 'Serie A',
  'Francia Ligue 1': 'Ligue 1',
}
const IMG = '/api/badge?img='

// Fallback estático combinado — todos los días disponibles
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STATIC_FALLBACK: unknown[] = [
  ...fb0427, ...fb0428, ...fb0429, ...fb0430,
  ...fb0501, ...fb0502, ...fb0503, ...fb0504,
  ...fb0505, ...fb0506, ...fb0507, ...fb0508, ...fb0509,
]

// Caché en proceso — sobrevive warm starts, evita llamadas repetidas a WOSTI
declare global { var __wostiCache: { data: unknown[]; ts: number } | undefined }
const TTL = 6 * 60 * 60 * 1000 // 6h

function cacheValid() {
  const c = global.__wostiCache
  return c && Date.now() - c.ts < TTL
}

type WostiOut = {
  id: unknown; time: string; localDate: string
  home: string; away: string; homeBadge: string; awayBadge: string
  competition: string; channels: { name: string; image: string }[]
}

function parseRaw(rawMatches: Record<string, unknown>[]): WostiOut[] {
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

    let time = '??:??', localDate = ''
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
      id: m.Id, time, localDate,
      home: String(local?.Name ?? '—'), away: String(away?.Name ?? '—'),
      homeBadge: local?.Image ? `${IMG}${String(local.Image)}` : '',
      awayBadge: away?.Image  ? `${IMG}${String(away.Image)}`  : '',
      competition: WOSTI_NAME_MAP[String(comp?.Name ?? '')] || String(comp?.Name ?? ''),
      channels: chs,
    }
  }).filter(m => m.localDate && m.competition)
}

// GET — devuelve todos los eventos WOSTI (el cliente filtra por fecha)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  // Purge de caché con contraseña
  if (searchParams.get('purge') === '1') {
    const pass = req.headers.get('x-admin-password') ?? searchParams.get('pw') ?? ''
    if (pass !== ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    global.__wostiCache = undefined
    return NextResponse.json({ ok: true, message: 'Caché purgada' })
  }

  // Servir desde caché si está válida
  if (cacheValid()) {
    const c = global.__wostiCache!
    return NextResponse.json({ matches: c.data, endpoint: 'cache', count: c.data.length })
  }

  // Sin credenciales → fallback estático
  if (!HEADERS) {
    return NextResponse.json({ matches: STATIC_FALLBACK, endpoint: 'static-fallback', count: STATIC_FALLBACK.length })
  }

  try {
    const res = await fetch(`https://${HOST}/api/Events`, {
      headers: HEADERS,
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
    })

    if (!res.ok) {
      // 429 u otro error → fallback estático + caché expirada si existe
      const stale = global.__wostiCache
      const data = stale ? stale.data : STATIC_FALLBACK
      return NextResponse.json({ matches: data, endpoint: stale ? 'stale-cache' : 'static-fallback', count: data.length })
    }

    const raw = await res.json()
    const rawMatches: Record<string, unknown>[] = Array.isArray(raw) ? raw : []
    const matches = parseRaw(rawMatches)

    global.__wostiCache = { data: matches, ts: Date.now() }
    return NextResponse.json({ matches, endpoint: 'wosti-live', count: matches.length })
  } catch (err) {
    const stale = global.__wostiCache
    const data = stale ? stale.data : STATIC_FALLBACK
    return NextResponse.json({ matches: data, endpoint: stale ? 'stale-cache' : 'static-fallback', error: String(err), count: data.length })
  }
}
