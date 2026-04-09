import { MatchStatusBadge } from './match-status-badge'

interface MatchHeaderProps {
  matchId: string
}

// Mock data - will be replaced with real fetch
const MOCK = {
  competition: 'Primera Catalana - Grup 1',
  homeTeam: 'CE Martinenc',
  awayTeam: 'UE Sants',
  homeScore: 2,
  awayScore: 1,
  status: 'finished' as const,
  date: 'Diumenge 6 d\'abril de 2026',
  venue: 'Camp Municipal de Martinenc',
  matchday: 'Jornada 25',
}

export function MatchHeader({ matchId: _matchId }: MatchHeaderProps) {
  const match = MOCK

  return (
    <div className="text-center py-8">
      <div className="text-xs uppercase tracking-wider text-muted font-sans mb-1">
        {match.competition}
      </div>
      <div className="text-xs text-muted font-sans mb-6">
        {match.matchday}
      </div>

      <div className="flex items-center justify-center gap-6 md:gap-10">
        <div className="flex-1 text-right">
          <h2 className="font-serif text-headline md:text-display">{match.homeTeam}</h2>
        </div>

        <div className="flex-shrink-0">
          <span className="font-serif text-display md:text-[4rem] tabular-nums text-ink">
            {match.homeScore} - {match.awayScore}
          </span>
        </div>

        <div className="flex-1 text-left">
          <h2 className="font-serif text-headline md:text-display">{match.awayTeam}</h2>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-2">
        <MatchStatusBadge status={match.status} />
        <p className="text-sm text-muted font-sans">{match.date}</p>
        <p className="text-xs text-muted font-sans">{match.venue}</p>
      </div>
    </div>
  )
}
