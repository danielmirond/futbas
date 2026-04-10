import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateChronicle } from '@/lib/claude/chronicle'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(request: Request) {
  try {
    const { matchId, language = 'ca' } = await request.json()

    if (!matchId) {
      return NextResponse.json({ error: 'matchId required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Fetch match with joins
    const { data: match, error: matchErr } = await supabase
      .from('matches')
      .select(`
        id, matchday, home_score, away_score, venue, status,
        home_team:home_team_id(team_name),
        away_team:away_team_id(team_name),
        competition:competition_id(name, group_name)
      `)
      .eq('id', matchId)
      .maybeSingle()

    if (matchErr || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (match.status !== 'finished' || match.home_score === null || match.away_score === null) {
      return NextResponse.json(
        { error: 'Match is not finished yet' },
        { status: 400 },
      )
    }

    // Check if chronicle already exists
    const { data: existing } = await supabase
      .from('chronicles')
      .select('id, headline, body, social_summary, mvp_player, mvp_justification, status')
      .eq('match_id', matchId)
      .maybeSingle()

    if (existing && existing.body) {
      return NextResponse.json({ chronicle: existing, cached: true })
    }

    // Fetch events
    const { data: events } = await supabase
      .from('match_events')
      .select('event_type, minute, player_name, team_id')
      .eq('match_id', matchId)
      .order('minute', { ascending: true })

    const homeTeam = (Array.isArray(match.home_team) ? match.home_team[0] : match.home_team) as any
    const awayTeam = (Array.isArray(match.away_team) ? match.away_team[0] : match.away_team) as any
    const competition = (Array.isArray(match.competition) ? match.competition[0] : match.competition) as any

    const chronicleData = await generateChronicle({
      homeTeam: homeTeam?.team_name || '',
      awayTeam: awayTeam?.team_name || '',
      homeScore: match.home_score,
      awayScore: match.away_score,
      competition: competition?.name || 'Competició',
      groupName: competition?.group_name || '',
      matchday: match.matchday || 0,
      venue: match.venue || '',
      events: (events || []).map((e) => ({
        type: e.event_type,
        minute: e.minute,
        playerName: e.player_name,
      })),
      language: language as 'ca' | 'es',
    })

    // Upsert chronicle
    const payload = {
      match_id: matchId,
      headline: chronicleData.headline,
      body: chronicleData.body,
      social_summary: chronicleData.socialSummary,
      mvp_player: chronicleData.mvpPlayer,
      mvp_justification: chronicleData.mvpJustification,
      language,
      status: 'published' as const,
      generated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
    }

    let chronicleRow
    if (existing) {
      const { data, error } = await supabase
        .from('chronicles')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
      if (error) throw error
      chronicleRow = data
    } else {
      const { data, error } = await supabase
        .from('chronicles')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      chronicleRow = data
    }

    return NextResponse.json({ chronicle: chronicleRow, cached: false })
  } catch (error) {
    console.error('[api/chronicle/generate] Error:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to generate chronicle' },
      { status: 500 },
    )
  }
}
