// app/api/debug/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const HOST = process.env.RAPIDAPI_HOST!
  const KEY  = process.env.RAPIDAPI_KEY!

  const today = new Date().toISOString().split('T')[0]
  const [yyyy, mm, dd] = today.split('-')

  const endpoints = [
    // Según Swagger: Events_Get
    '/api/Events',
    `/api/Events?date=${today}`,
    `/api/Events?date=${dd}/${mm}/${yyyy}`,
    `/api/Events?date=${dd}-${mm}-${yyyy}`,
    `/api/Events?fecha=${today}`,
    '/api/events',
    `/api/events?date=${today}`,
    // Sin prefijo /api
    '/Events',
    `/Events?date=${today}`,
    '/events',
    `/events?date=${today}`,
    // Otros posibles según Swagger
    '/api/Matches',
    '/api/matches',
    '/api/Games',
    '/api/Schedule',
  ]

  const results: Record<string, { status: number; body: string }> = {}

  await Promise.all(
    endpoints.map(async (ep) => {
      try {
        const res = await fetch(`https://${HOST}${ep}`, {
          headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST },
          signal: AbortSignal.timeout(7000),
        })
        const text = await res.text()
        results[ep] = { status: res.status, body: text.slice(0, 500) }
      } catch (e) {
        results[ep] = { status: 0, body: String(e) }
      }
    })
  )

  const ok  = Object.entries(results).filter(([, v]) => v.status === 200)
  const err = Object.entries(results).filter(([, v]) => v.status !== 200)

  return NextResponse.json({
    summary: { working: ok.map(([ep]) => ep), total_tested: endpoints.length },
    results_200: Object.fromEntries(ok),
    results_error: Object.fromEntries(err),
  })
}
