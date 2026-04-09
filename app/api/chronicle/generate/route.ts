import { NextResponse } from 'next/server'
import { generateChronicle } from '@/lib/claude/chronicle'
import type { ActaData } from '@/lib/scraper/acta'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const { matchId, language = 'ca' } = await request.json()

    if (!matchId) {
      return NextResponse.json({ error: 'matchId required' }, { status: 400 })
    }

    // TODO: Fetch match data and acta from Supabase
    // For now, return a placeholder
    return NextResponse.json({
      message: 'Chronicle generation endpoint ready',
      matchId,
      language,
      status: 'not_implemented_yet'
    })
  } catch (error) {
    console.error('[api/chronicle/generate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate chronicle' },
      { status: 500 }
    )
  }
}
