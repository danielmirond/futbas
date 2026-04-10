import Link from 'next/link'
import { MatchStatusBadge } from './match-status-badge'

type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'

interface MatchCardProps {
  matchId?: string
  locale?: string
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
  matchId,
  locale = 'ca',
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

  const content = (
    <>
      <div className="eyebrow mb-3 truncate">{competition}</div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <span className="font-display font-bold uppercase text-sm md:text-base tracking-tight text-ink">
            {homeTeam}
          </span>
        </div>

        <div className="flex-shrink-0 text-center min-w-[5rem]">
          {isScheduled ? (
            <span className="font-display font-black text-2xl md:text-3xl tracking-tighter text-accent">
              {matchTime ?? '--:--'}
            </span>
          ) : (
            <span className="score font-black text-3xl md:text-4xl tabular-nums">
              {homeScore ?? '-'}
              <span className="score-dash mx-1">-</span>
              {awayScore ?? '-'}
            </span>
          )}
        </div>

        <div className="flex-1 text-left">
          <span className="font-display font-bold uppercase text-sm md:text-base tracking-tight text-ink">
            {awayTeam}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        <MatchStatusBadge status={status} />
        {matchDate && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink3 truncate max-w-[200px]">
            {matchDate}
          </span>
        )}
      </div>
    </>
  )

  if (matchId) {
    return (
      <Link href={`/${locale}/partits/${matchId}`} className="card card-hover block">
        {content}
      </Link>
    )
  }

  return <div className="card card-hover">{content}</div>
}
