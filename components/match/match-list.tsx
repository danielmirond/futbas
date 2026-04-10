'use client'

import { MatchCard } from './match-card'

interface MockMatch {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
  matchDate: string
  matchTime?: string
  competition: string
}

const MOCK_MATCHES: MockMatch[] = [
  {
    id: '1',
    homeTeam: 'CE Martinenc',
    awayTeam: 'UE Sants',
    homeScore: 2,
    awayScore: 1,
    status: 'finished',
    matchDate: '06/04/2026',
    competition: 'Primera Catalana - Grup 1',
  },
  {
    id: '2',
    homeTeam: 'CF Gavà',
    awayTeam: 'CE Europa B',
    homeScore: 1,
    awayScore: 1,
    status: 'finished',
    matchDate: '06/04/2026',
    competition: 'Primera Catalana - Grup 1',
  },
  {
    id: '3',
    homeTeam: 'CF Damm',
    awayTeam: 'UE Cornellà B',
    status: 'scheduled',
    matchDate: '12/04/2026',
    matchTime: '17:00',
    competition: 'Primera Catalana - Grup 1',
  },
  {
    id: '4',
    homeTeam: 'CF Badalona Futur',
    awayTeam: 'UE Castelldefels',
    homeScore: 3,
    awayScore: 0,
    status: 'live',
    matchDate: '09/04/2026',
    competition: 'Primera Catalana - Grup 1',
  },
]

export function MatchList() {
  return (
    <div>
      <h2 className="font-display font-black text-2xl uppercase mb-4 text-ink tracking-tight">
        Jornada 25
      </h2>
      <div className="space-y-4">
        {MOCK_MATCHES.map((match) => (
          <MatchCard
            key={match.id}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeScore={match.homeScore}
            awayScore={match.awayScore}
            status={match.status}
            matchDate={match.matchDate}
            matchTime={match.matchTime}
            competition={match.competition}
          />
        ))}
      </div>
    </div>
  )
}
