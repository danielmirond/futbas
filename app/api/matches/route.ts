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
      ? (m.Channels as Record<string, unknown>[]).map(c => ({ name: String(c.Name ?? ''), image: c.Image ? `/api/badge?img=${String(c.Image)}` : '' }))
      : []

    // Extraer hora y fecha local España
    // Detectar si es horario de verano (CEST +2) o invierno (CET +1)
    let time = '??:??'
    let localDateStr = ''
    if (typeof m.Date === 'string') {
      const d = new Date(m.Date)
      // Usar Intl para obtener hora correcta en Madrid automáticamente
      const madridTime = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(d)
      // Fecha local en Madrid
      const madridDate = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(d)
      // Convertir DD/MM/YYYY → YYYY-MM-DD
      const [dd, mm, yyyy] = madridDate.split('/')
      localDateStr = `${yyyy}-${mm}-${dd}`
      time = madridTime
    }

    const IMG = 'https://static.futbolenlatv.com/img/32/'
    return {
      id:          m.Id,
      time,
      date:        m.Date,
      localDate:   localDateStr,
      home:        String(local?.Name  ?? '—'),
      away:        String(away?.Name   ?? '—'),
      homeBadge:   local?.Image ? IMG + String(local.Image) : '',
      awayBadge:   away?.Image  ? IMG + String(away.Image)  : '',
      compBadge:   comp?.Image  ? IMG + String(comp.Image)  : '',
      competition: String(comp?.Name   ?? ''),
      channels:    chs,
    }
  })

  // Filtrar por fecha local España
  const filtered = matches.filter(m => m.localDate === date)

  // Ordenar por hora
  filtered.sort((a, b) => String(a.time).localeCompare(String(b.time)))

  return NextResponse.json({
    matches:  filtered,
    count:    filtered.length,
    endpoint: usedEndpoint,
    date,
  })
}
