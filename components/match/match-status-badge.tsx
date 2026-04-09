import { Badge } from '@/components/ui/badge'

type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'

interface MatchStatusBadgeProps {
  status: MatchStatus
}

const statusConfig: Record<MatchStatus, { label: string; variant: 'default' | 'accent' | 'win' | 'loss' | 'muted' }> = {
  scheduled: { label: 'Programat', variant: 'accent' },
  live: { label: 'En directe', variant: 'loss' },
  finished: { label: 'Finalitzat', variant: 'muted' },
  postponed: { label: 'Ajornat', variant: 'default' },
  cancelled: { label: 'Cancel\u00B7lat', variant: 'loss' },
}

export function MatchStatusBadge({ status }: MatchStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant}>
      {status === 'live' && (
        <span className="relative mr-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-loss opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-loss" />
        </span>
      )}
      {config.label}
    </Badge>
  )
}
