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

  // Normalizar respuesta
  type MatchRaw = Record<string, unknown>
  let matches: MatchRaw[] = []

  if (Array.isArray(raw))                        matches = raw as MatchRaw[]
  else if (Array.isArray((raw as Record<string, unknown>).events))   matches = (raw as Record<string, unknown[]>).events as MatchRaw[]
  else if (Array.isArray((raw as Record<string, unknown>).matches))  matches = (raw as Record<string, unknown[]>).matches as MatchRaw[]
  else if (Array.isArray((raw as Record<string, unknown>).data))     matches = (raw as Record<string, unknown[]>).data as MatchRaw[]
  else if (Array.isArray((raw as Record<string, unknown>).results))  matches = (raw as Record<string, unknown[]>).results as MatchRaw[]
  else {
    // Formato desconocido — devolver raw para inspección
    return NextResponse.json({ raw, endpoint: usedEndpoint })
  }

  return NextResponse.json({
    matches,
    count:    matches.length,
    endpoint: usedEndpoint,
    date,
  })
}
