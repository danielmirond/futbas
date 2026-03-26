// app/api/debug/route.ts  
// Solo para desarrollo: muestra la respuesta raw de la API
// Eliminar o proteger en producción

import { NextResponse } from 'next/server'

export async function GET() {
  const HOST = process.env.RAPIDAPI_HOST!
  const KEY  = process.env.RAPIDAPI_KEY!
  
  const results: Record<string, unknown> = {}

  const endpoints = ['/matches', '/today', '/games', '/partidos', '/fixtures', '/']
  
  for (const ep of endpoints) {
    try {
      const res = await fetch(`https://${HOST}${ep}`, {
        headers: {
          'x-rapidapi-key': KEY,
          'x-rapidapi-host': HOST,
        },
        signal: AbortSignal.timeout(5000),
      })
      const text = await res.text()
      results[ep] = {
        status: res.status,
        body: text.slice(0, 500),
      }
    } catch (e) {
      results[ep] = { error: String(e) }
    }
  }

  return NextResponse.json(results, {
    headers: { 'Content-Type': 'application/json' }
  })
}
