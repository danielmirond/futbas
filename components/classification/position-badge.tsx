interface PositionBadgeProps {
  position: number
  totalTeams?: number
}

export function PositionBadge({ position, totalTeams = 16 }: PositionBadgeProps) {
  let colorClass = 'text-ink3'

  if (position <= 2) {
    colorClass = 'text-neon'
  } else if (position <= 4) {
    colorClass = 'text-accent'
  } else if (position > totalTeams - 2) {
    colorClass = 'text-loss'
  }

  return (
    <span className={`font-display font-black tabular-nums text-base ${colorClass}`}>
      {position}
    </span>
  )
}
