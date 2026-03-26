// app/api/matches/route.ts
import { NextResponse } from 'next/server'

const KEY  = process.env.RAPIDAPI_KEY!
const HOST = process.env.RAPIDAPI_HOST!

const HEADERS = {
  'x-rapidapi-key':  KEY,
  'x-rapidapi-host': HOST,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  // Formatos de fecha a probar
  const [yyyy, mm, dd] = date.split('-')
  const dateFormats = [
    date,                          // 2026-03-26
    `${dd}/${mm}/${yyyy}`,         // 26/03/2026
    `${dd}-${mm}-${yyyy}`,         // 26-03-2026
    `${dd}${mm}${yyyy}`,           // 26032026
  ]

  // Endpoints a probar (según Swagger: Events_Get)
  const candidates = [
    `/api/Events`,
    `/api/Events?date=${date}`,
    `/api/Events?date=${dd}/${mm}/${yyyy}`,
    `/api/Events?fecha=${date}`,
    `/api/events`,
    `/api/events?date=${date}`,
    `/Events`,
    `/Events?date=${date}`,
    `/events`,
    `/events?date=${date}`,
  ]

  let raw: unknown = null
  let usedEndpoint = ''

  for (const ep of candidates) {
    try {
      const res = await fetch(`https://${HOST}${ep}`, {
        headers: HEADERS,
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        raw = await res.json()
        usedEndpoint = ep
        break
      }
    } catch { continue }
  }

  if (!raw) {
    return NextResponse.json(
      { error: 'No se encontró endpoint válido', candidates_tried: candidates },
      { status: 502 }
    )
  }

  // Normalizar respuesta WOSTI
  // Estructura: { LocalTeam: {Name}, AwayTeam: {Name}, Date: ISO, Channels: [{Name}], Competition: {Name} }
  type WostiMatch = Record<string, unknown>
  let rawMatches: WostiMatch[] = []

  if (Array.isArray(raw)) rawMatches = raw as WostiMatch[]
  else if (Array.isArray((raw as Record<string, unknown>).matches)) rawMatches = (raw as Record<string, unknown[]>).matches as WostiMatch[]
  else if (Array.isArray((raw as Record<string, unknown>).events))  rawMatches = (raw as Record<string, unknown[]>).events as WostiMatch[]
  else if (Array.isArray((raw as Record<string, unknown>).data))    rawMatches = (raw as Record<string, unknown[]>).data as WostiMatch[]
  else {
    return NextResponse.json({ raw, endpoint: usedEndpoint })
  }

  // Normalizar cada partido al formato estándar del frontend
  const matches = rawMatches.map((m) => {
    const local = m.LocalTeam as Record<string, unknown> | undefined
    const away  = m.AwayTeam  as Record<string, unknown> | undefined
    const comp  = m.Competition as Record<string, unknown> | undefined
    const chs   = Array.isArray(m.Channels)
      ? (m.Channels as Record<string, unknown>[]).map(c => String(c.Name ?? ''))
      : []

    // Extraer hora local Spain (UTC+2 en verano, UTC+1 en invierno)
    let time = '??:??'
    if (typeof m.Date === 'string') {
      const d = new Date(m.Date)
      const offset = 1 // CET — ajustar a 2 en verano si hace falta
      const localH = (d.getUTCHours() + offset + 24) % 24
      const localM = d.getUTCMinutes()
      time = `${String(localH).padStart(2,'0')}:${String(localM).padStart(2,'0')}`
    }

    const IMG = 'https://static.futbolenlatv.com/img/32/'
    return {
      id:          m.Id,
      time,
      date:        m.Date,
      home:        String(local?.Name  ?? '—'),
      away:        String(away?.Name   ?? '—'),
      homeBadge:   local?.Image ? IMG + String(local.Image) : '',
      awayBadge:   away?.Image  ? IMG + String(away.Image)  : '',
      compBadge:   comp?.Image  ? IMG + String(comp.Image)  : '',
      competition: String(comp?.Name   ?? ''),
      channels:    chs,
    }
  })

  // Ordenar por hora
  matches.sort((a, b) => a.time.localeCompare(b.time))

  return NextResponse.json({
    matches,
    count:    matches.length,
    endpoint: usedEndpoint,
    date,
  })
}
