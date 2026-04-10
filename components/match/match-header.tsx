import { MatchStatusBadge } from './match-status-badge'

interface MatchHeaderProps {
  matchId: string
  competition?: string
  groupName?: string
  matchday?: number
  homeTeam?: string
  awayTeam?: string
  homeScore?: number | null
  awayScore?: number | null
  status?: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
  venue?: string
}

export function MatchHeader({
  competition = '',
  groupName = '',
  matchday = 0,
  homeTeam = '',
  awayTeam = '',
  homeScore,
  awayScore,
  status = 'scheduled',
  venue = '',
}: MatchHeaderProps) {
  const isFinished = status === 'finished' && homeScore !== null && awayScore !== null
  const scoreDisplay = isFinished ? `${homeScore} - ${awayScore}` : 'VS'

  return (
    <div className="bg-primary text-white p-6 md:p-10 relative overflow-hidden">
      <div className="text-center">
        <div className="eyebrow-light mb-1">
          {competition} {groupName && `· ${groupName}`}
        </div>
        {matchday > 0 && (
          <div className="eyebrow-light mb-8">Jornada {matchday}</div>
        )}

        <div className="flex items-center justify-center gap-6 md:gap-10">
          <div className="flex-1 text-right">
            <h2 className="font-display font-black uppercase text-xl md:text-3xl tracking-tight text-white">
              {homeTeam}
            </h2>
          </div>

          <div className="flex-shrink-0">
            <span className="font-display font-black text-5xl md:text-7xl tabular-nums tracking-tighter text-white">
              {isFinished ? (
                <>
                  {homeScore}
                  <span className="text-accent mx-2">-</span>
                  {awayScore}
                </>
              ) : (
                scoreDisplay
              )}
            </span>
          </div>

          <div className="flex-1 text-left">
            <h2 className="font-display font-black uppercase text-xl md:text-3xl tracking-tight text-white">
              {awayTeam}
            </h2>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <MatchStatusBadge status={status} />
          {venue && (
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/60">
              {venue}
            </p>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
    </div>
  )
}
