import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function escapeICal(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

export async function GET(
  _request: Request,
  { params }: { params: { clubId: string } },
) {
  const supabase = createAdminClient()

  // Fetch club
  const { data: club } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('id', params.clubId)
    .maybeSingle()

  if (!club) {
    return new NextResponse('Club not found', { status: 404 })
  }

  // Get all teams for this club
  const { data: teams } = await supabase
    .from('teams')
    .select('id')
    .eq('club_id', params.clubId)

  const teamIds = (teams || []).map((t) => t.id)
  if (teamIds.length === 0) {
    return new NextResponse('No teams found', { status: 404 })
  }

  // Get upcoming and recent matches for this club's teams
  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, matchday, match_date, venue, home_score, away_score, status,
      home_team:home_team_id(id, team_name),
      away_team:away_team_id(id, team_name),
      competition:competition_id(name, group_name)
    `)
    .or(`home_team_id.in.(${teamIds.join(',')}),away_team_id.in.(${teamIds.join(',')})`)
    .order('matchday', { ascending: false })
    .limit(30)

  const events: string[] = []

  for (const m of matches || []) {
    const home = Array.isArray(m.home_team) ? m.home_team[0] : m.home_team
    const away = Array.isArray(m.away_team) ? m.away_team[0] : m.away_team
    const comp = Array.isArray(m.competition) ? m.competition[0] : m.competition

    // Use match_date if available, otherwise synthesize based on matchday
    const matchDate = m.match_date ? new Date(m.match_date) : new Date()
    const endDate = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000) // +2h

    const summary = `⚽ ${home?.team_name} vs ${away?.team_name}${
      m.status === 'finished' && m.home_score !== null
        ? ` (${m.home_score}-${m.away_score})`
        : ''
    }`

    const description = [
      `${comp?.name || ''} · ${comp?.group_name || ''}`,
      m.matchday ? `Jornada ${m.matchday}` : '',
      m.status === 'finished' && m.home_score !== null
        ? `Resultat: ${m.home_score}-${m.away_score}`
        : 'Programat',
    ]
      .filter(Boolean)
      .join('\\n')

    events.push(
      [
        'BEGIN:VEVENT',
        `UID:${m.id}@futbas.vercel.app`,
        `DTSTAMP:${formatICalDate(new Date())}`,
        `DTSTART:${formatICalDate(matchDate)}`,
        `DTEND:${formatICalDate(endDate)}`,
        `SUMMARY:${escapeICal(summary)}`,
        `DESCRIPTION:${escapeICal(description)}`,
        m.venue ? `LOCATION:${escapeICal(m.venue)}` : '',
        `URL:https://futbas.vercel.app/ca/partits/${m.id}`,
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\r\n'),
    )
  }

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Futbas//Club Calendar//CA',
    `X-WR-CALNAME:${escapeICal(club.name)} - Futbas`,
    `X-WR-CALDESC:Partits de ${escapeICal(club.name)}`,
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${club.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics"`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
