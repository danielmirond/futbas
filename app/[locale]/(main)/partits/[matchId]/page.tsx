import { createClient } from '@/lib/supabase/server'
import { MatchHeader } from '@/components/match/match-header'
import { MatchEventsTimeline } from '@/components/match/match-events-timeline'
import { CommentFeed } from '@/components/comments/comment-feed'
import { MvpVoting } from '@/components/mvp/mvp-voting'
import { AvailabilityVoting } from '@/components/availability/availability-voting'
import Link from 'next/link'

interface PageProps {
  params: { matchId: string; locale: string }
}

export default async function MatchDetailPage({ params: { matchId, locale } }: PageProps) {
  const supabase = createClient()

  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      id, matchday, home_score, away_score, venue, status, acta_url,
      home_team:home_team_id(id, team_name, club_id),
      away_team:away_team_id(id, team_name, club_id),
      competition:competition_id(id, name, group_name)
    `)
    .eq('id', matchId)
    .maybeSingle()

  if (error || !match) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <div className="eyebrow mb-2">404</div>
          <h1 className="font-display font-black text-3xl uppercase mb-4">Partit no trobat</h1>
          <Link href={`/${locale}/partits`} className="btn-ghost inline-block">
            ← Tornar als partits
          </Link>
        </div>
      </div>
    )
  }

  const { data: events } = await supabase
    .from('match_events')
    .select('id, event_type, minute, player_name, team_id')
    .eq('match_id', matchId)
    .order('minute', { ascending: true })

  // Unwrap arrays from Supabase's join type
  const homeTeam = Array.isArray(match.home_team) ? match.home_team[0] : match.home_team
  const awayTeam = Array.isArray(match.away_team) ? match.away_team[0] : match.away_team
  const competition = Array.isArray(match.competition) ? match.competition[0] : match.competition

  return (
    <div className="space-y-8">
      <MatchHeader
        matchId={matchId}
        competition={competition?.name || ''}
        groupName={competition?.group_name || ''}
        matchday={match.matchday || 0}
        homeTeam={homeTeam?.team_name || ''}
        awayTeam={awayTeam?.team_name || ''}
        homeScore={match.home_score}
        awayScore={match.away_score}
        status={match.status}
        venue={match.venue || ''}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MatchEventsTimeline
            matchId={matchId}
            events={(events || []).map((e) => ({
              id: e.id,
              minute: e.minute || 0,
              type:
                e.event_type === 'goal' || e.event_type === 'penalty'
                  ? 'goal'
                  : e.event_type === 'yellow_card'
                  ? 'yellow_card'
                  : e.event_type === 'red_card' || e.event_type === 'second_yellow'
                  ? 'red_card'
                  : 'substitution',
              description: `${e.player_name || 'Jugador'}`,
              team: e.team_id === homeTeam?.id ? 'home' : 'away',
            }))}
          />
          <CommentFeed matchId={matchId} />
        </div>

        <div className="space-y-6">
          {match.status === 'scheduled' && <AvailabilityVoting matchId={matchId} />}
          {match.status === 'finished' && <MvpVoting matchId={matchId} />}
        </div>
      </div>
    </div>
  )
}
