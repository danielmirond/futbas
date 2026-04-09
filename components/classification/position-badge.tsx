interface PositionBadgeProps {
  position: number
  totalTeams?: number
}

export function PositionBadge({ position, totalTeams = 16 }: PositionBadgeProps) {
  let colorClass = 'text-muted'

  if (position <= 2) {
    colorClass = 'text-win font-bold'
  } else if (position > totalTeams - 2) {
    colorClass = 'text-loss'
  }

  return (
    <span className={`tabular-nums text-sm ${colorClass}`}>
      {position}
    </span>
  )
}
