import type { CommentType } from '@/types/database'

interface CommentTypeBadgeProps {
  type: CommentType
}

const typeConfig: Record<CommentType, { label: string; className: string }> = {
  passio:    { label: 'PASSIÓ',     className: 'pill pill-red' },
  prediccio: { label: 'PREDICCIÓ',  className: 'pill border-blue-500/30 text-blue-600 bg-blue-500/10' },
  arbitre:   { label: 'ÀRBITRE',    className: 'pill pill-yellow' },
}

export function CommentTypeBadge({ type }: CommentTypeBadgeProps) {
  const config = typeConfig[type]
  return <span className={config.className}>{config.label}</span>
}
