import { MatchStatusBadge } from './match-status-badge'

type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'

interface MatchCardProps {
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  status: MatchStatus
  matchDate: string
  matchTime?: string
  competition: string
}

export function MatchCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  matchDate,
  matchTime,
  competition,
}: MatchCardProps) {
  const isScheduled = status === 'scheduled'

  return (
    <div className="card card-hover">
      <div className="eyebrow mb-3">{competition}</div>

      <div className="flex items-center justify-between gap-4">
        {/* Home team */}
        <div className="flex-1 text-right">
          <span className="font-display font-bold uppercase text-sm tracking-tight text-ink">
            {homeTeam}
          </span>
        </div>

        {/* Score or time */}
        <div className="flex-shrink-0 text-center min-w-[5rem]">
          {isScheduled ? (
            <span className="font-display font-black text-2xl md:text-3xl tracking-tighter text-accent">
              {matchTime ?? '--:--'}
            </span>
          ) : (
            <span className="score font-black text-3xl md:text-4xl tabular-nums">
              {homeScore}
              <span className="score-dash mx-1">-</span>
              {awayScore}
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 text-left">
          <span className="font-display font-bold uppercase text-sm tracking-tight text-ink">
            {awayTeam}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        <MatchStatusBadge status={status} />
        <span className="font-mono text-[10px] uppercase tracking-wider text-ink3">
          {matchDate}
        </span>
      </div>
    </div>
  )
}
