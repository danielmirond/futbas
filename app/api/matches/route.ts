import { NextResponse } from 'next/server'

const KEY  = process.env.RAPIDAPI_KEY
const HOST = process.env.RAPIDAPI_HOST
const HEADERS = KEY && HOST ? {
  'x-rapidapi-key':  KEY,
  'x-rapidapi-host': HOST,
} : null

/* ── Demo data ─────────────────────────────────────────────── */
function generateDemoMatches(date: string) {
  const base = `${date}T`
  const matches = [
    // LaLiga
    { id: 'd1', time: '14:00', home: 'Real Madrid', away: 'FC Barcelona', competition: 'LaLiga EA Sports', channels: [{ name: 'DAZN', image: '' }, { name: 'Movistar LaLiga', image: '' }] },
    { id: 'd2', time: '16:15', home: 'Atlético de Madrid', away: 'Real Sociedad', competition: 'LaLiga EA Sports', channels: [{ name: 'DAZN', image: '' }] },
    { id: 'd3', time: '18:30', home: 'Athletic Club', away: 'Real Betis', competition: 'LaLiga EA Sports', channels: [{ name: 'Movistar LaLiga', image: '' }] },
    { id: 'd4', time: '21:00', home: 'Sevilla FC', away: 'Villarreal CF', competition: 'LaLiga EA Sports', channels: [{ name: 'DAZN', image: '' }] },
    // Champions League
    { id: 'd5', time: '18:45', home: 'Real Madrid', away: 'Manchester City', competition: 'UEFA Champions League', channels: [{ name: 'Movistar Champions League', image: '' }] },
    { id: 'd6', time: '21:00', home: 'FC Barcelona', away: 'Bayern München', competition: 'UEFA Champions League', channels: [{ name: 'Movistar Champions League', image: '' }, { name: 'Antena 3', image: '' }] },
    // Copa del Rey
    { id: 'd7', time: '19:00', home: 'Valencia CF', away: 'Girona FC', competition: 'Copa del Rey', channels: [{ name: 'DAZN', image: '' }] },
    // Segunda División
    { id: 'd8', time: '16:00', home: 'Racing de Santander', away: 'Sporting de Gijón', competition: 'LaLiga Hypermotion', channels: [{ name: 'LaLiga TV', image: '' }] },
    { id: 'd9', time: '18:15', home: 'Real Zaragoza', away: 'Levante UD', competition: 'LaLiga Hypermotion', channels: [{ name: 'LaLiga TV', image: '' }] },
    // En abierto
    { id: 'd10', time: '20:00', home: 'España', away: 'Francia', competition: 'UEFA Nations League', channels: [{ name: 'La 1', image: '' }, { name: 'RTVE Play', image: '' }] },
    // Más LaLiga
    { id: 'd11', time: '14:00', home: 'Celta de Vigo', away: 'RCD Mallorca', competition: 'LaLiga EA Sports', channels: [{ name: 'Gol TV', image: '' }] },
    { id: 'd12', time: '19:30', home: 'Getafe CF', away: 'Rayo Vallecano', competition: 'LaLiga EA Sports', channels: [{ name: 'DAZN', image: '' }] },
  ]

  return matches.map(m => ({
    ...m,
    date: `${base}${m.time}:00+02:00`,
    localDate: date,
    homeBadge: '',
    awayBadge: '',
  }))
}

/* ── Main handler ──────────────────────────────────────────── */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const demo = searchParams.get('demo') === '1' || !HEADERS

  if (demo) {
    const matches = generateDemoMatches(date)
    matches.sort((a, b) => a.time.localeCompare(b.time))
    return NextResponse.json({ matches, count: matches.length, endpoint: 'demo', date })
  }

  try {
    const res = await fetch(`https://${HOST}/api/Events`, {
      headers: HEADERS!,
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      const matches = generateDemoMatches(date)
      matches.sort((a, b) => a.time.localeCompare(b.time))
      return NextResponse.json({ matches, count: matches.length, endpoint: 'demo-fallback', date })
    }

    const raw = await res.json()
    type WostiMatch = Record<string, unknown>
    const rawMatches: WostiMatch[] = Array.isArray(raw) ? raw : []

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
        competition: String(comp?.Name  ?? ''),
        channels:    chs as { name: string; image: string }[],
      }
    })

    // Filtrar por fecha local Madrid
    const filtered = matches.filter(m => m.localDate === date)
    filtered.sort((a, b) => String(a.time).localeCompare(String(b.time)))

    return NextResponse.json({
      matches:  filtered,
      count:    filtered.length,
      endpoint: '/api/Events',
      date,
    })
  } catch (err) {
    // Fallback to demo on error
    const matches = generateDemoMatches(date)
    matches.sort((a, b) => a.time.localeCompare(b.time))
    return NextResponse.json({ matches, count: matches.length, endpoint: 'demo-fallback', date })
  }
}
