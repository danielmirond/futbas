// app/api/matches/route.ts
// Proxy para WOSTI Fútbol TV Spain API (RapidAPI)
// Evita CORS y mantiene la API key en servidor

import { NextResponse } from 'next/server'

const RAPIDAPI_KEY  = process.env.RAPIDAPI_KEY!
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST!
const BASE_URL      = `https://${RAPIDAPI_HOST}`

// Endpoints conocidos de la API WOSTI Spain
// El endpoint principal devuelve partidos de hoy
// Probamos secuencialmente hasta encontrar el que responde
const ENDPOINTS = [
  '/matches',
  '/today',
  '/games',
  '/partidos',
  '/fixtures',
  '/schedule',
  '/football',
  '/all',
  '/',
]

const HEADERS = {
  'x-rapidapi-key':  RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST,
  'Accept':          'application/json',
}

async function tryEndpoint(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${endpoint}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString(), { headers: HEADERS, next: { revalidate: 300 } })
  if (!res.ok) return null
  const data = await res.json()
  return data
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') // YYYY-MM-DD, opcional

  try {
    let data = null
    let usedEndpoint = ''

    // Intentar endpoint con fecha si se proporciona
    if (date) {
      data = await tryEndpoint('/matches', { date })
      if (data) usedEndpoint = `/matches?date=${date}`

      if (!data) {
        data = await tryEndpoint(`/matches/${date}`)
        if (data) usedEndpoint = `/matches/${date}`
      }
    }

    // Probar endpoints secuencialmente
    if (!data) {
      for (const ep of ENDPOINTS) {
        try {
          data = await tryEndpoint(ep)
          if (data && !data.message && !data.error) {
            usedEndpoint = ep
            break
          }
        } catch { continue }
      }
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No se pudo conectar con la API WOSTI', endpoints_tried: ENDPOINTS },
        { status: 502 }
      )
    }

    // Normalizar respuesta: la API puede devolver array o { matches: [] } o { data: [] }
    let matches = []
    if (Array.isArray(data)) {
      matches = data
    } else if (Array.isArray(data.matches)) {
      matches = data.matches
    } else if (Array.isArray(data.data)) {
      matches = data.data
    } else if (Array.isArray(data.games)) {
      matches = data.games
    } else if (Array.isArray(data.partidos)) {
      matches = data.partidos
    } else {
      // Devolver raw para inspección
      return NextResponse.json({ raw: data, endpoint: usedEndpoint })
    }

    return NextResponse.json({
      matches,
      count: matches.length,
      endpoint: usedEndpoint,
      date: date || new Date().toISOString().split('T')[0],
    })

  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
