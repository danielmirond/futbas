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
    <div className="card hover:border-ink/10 transition-colors">
      <div className="text-xs text-muted mb-2 font-sans">{competition}</div>

      <div className="flex items-center justify-between gap-4">
        {/* Home team */}
        <div className="flex-1 text-right">
          <span className="text-sm font-medium text-ink">{homeTeam}</span>
        </div>

        {/* Score or time */}
        <div className="flex-shrink-0 text-center min-w-[4rem]">
          {isScheduled ? (
            <span className="font-serif text-lg text-accent">{matchTime ?? '--:--'}</span>
          ) : (
            <span className="font-serif text-2xl tabular-nums text-ink">
              {homeScore} - {awayScore}
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 text-left">
          <span className="text-sm font-medium text-ink">{awayTeam}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2">
        <MatchStatusBadge status={status} />
        <span className="text-xs text-muted">{matchDate}</span>
      </div>
    </div>
  )
}
