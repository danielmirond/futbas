'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { MatchCard } from './match-card'
import { Skeleton } from '@/components/ui/skeleton'

interface Match {
  id: string
  matchday: number | null
  home_score: number | null
  away_score: number | null
  venue: string | null
  status: 'scheduled' | 'finished' | 'live' | 'postponed' | 'cancelled'
  home_team_id: string
  away_team_id: string
  competition_id: string
  homeTeamName?: string
  awayTeamName?: string
  competitionName?: string
  groupName?: string
}

export function MatchList() {
  const locale = useLocale()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchMatches() {
      const supabase = createClient()

      // Fetch matches with team + competition joins
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id, matchday, home_score, away_score, venue, status,
          home_team_id, away_team_id, competition_id,
          home_team:home_team_id(team_name),
          away_team:away_team_id(team_name),
          competition:competition_id(name, group_name)
        `)
        .order('matchday', { ascending: false })
        .limit(30)

      if (error) throw new Error(error.message)

      const normalized: Match[] = (data || []).map((m: any) => ({
        id: m.id,
        matchday: m.matchday,
        home_score: m.home_score,
        away_score: m.away_score,
        venue: m.venue,
        status: m.status,
        home_team_id: m.home_team_id,
        away_team_id: m.away_team_id,
        competition_id: m.competition_id,
        homeTeamName: m.home_team?.team_name || 'Equip local',
        awayTeamName: m.away_team?.team_name || 'Equip visitant',
        competitionName: m.competition?.name || '',
        groupName: m.competition?.group_name || '',
      }))

      if (!cancelled) setMatches(normalized)
    }

    fetchMatches()
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="card text-loss text-sm">{error}</div>
  }

  if (matches.length === 0) {
    return <div className="card eyebrow py-8 text-center">No hi ha partits disponibles.</div>
  }

  // Group by matchday
  const grouped = matches.reduce<Record<number, Match[]>>((acc, m) => {
    const md = m.matchday ?? 0
    if (!acc[md]) acc[md] = []
    acc[md].push(m)
    return acc
  }, {})

  const matchdays = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="space-y-8">
      {matchdays.map((md) => (
        <div key={md}>
          <h2 className="font-display font-black text-2xl uppercase mb-4 text-ink tracking-tight">
            Jornada {md}
          </h2>
          <div className="space-y-3">
            {grouped[md].map((match) => (
              <MatchCard
                key={match.id}
                matchId={match.id}
                locale={locale}
                homeTeam={match.homeTeamName || ''}
                awayTeam={match.awayTeamName || ''}
                homeScore={match.home_score ?? undefined}
                awayScore={match.away_score ?? undefined}
                status={match.status}
                matchDate={match.venue || ''}
                competition={`${match.competitionName} · ${match.groupName}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
