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
    <div className="bg-primary text-white p-6 md:p-10 relative overflow-hidden">
      <div className="text-center">
        <div className="eyebrow-light mb-1">{match.competition}</div>
        <div className="eyebrow-light mb-8">{match.matchday}</div>

        <div className="flex items-center justify-center gap-6 md:gap-10">
          <div className="flex-1 text-right">
            <h2 className="font-display font-black uppercase text-2xl md:text-4xl tracking-tight text-white">
              {match.homeTeam}
            </h2>
          </div>

          <div className="flex-shrink-0">
            <span className="font-display font-black text-6xl md:text-display tabular-nums tracking-tighter text-white">
              {match.homeScore}
              <span className="text-accent mx-2">-</span>
              {match.awayScore}
            </span>
          </div>

          <div className="flex-1 text-left">
            <h2 className="font-display font-black uppercase text-2xl md:text-4xl tracking-tight text-white">
              {match.awayTeam}
            </h2>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <MatchStatusBadge status={match.status} />
          <p className="font-mono text-[10px] uppercase tracking-wider text-white/60">
            {match.date}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">
            {match.venue}
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
    </div>
  )
}
