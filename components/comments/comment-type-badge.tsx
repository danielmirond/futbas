import type { CommentType } from '@/types/database'

interface CommentTypeBadgeProps {
  type: CommentType
}

const typeConfig: Record<CommentType, { label: string; className: string }> = {
  passio:    { label: 'Passio',     className: 'bg-rose-100 text-rose-700' },
  prediccio: { label: 'Prediccio',  className: 'bg-blue-100 text-blue-700' },
  arbitre:   { label: 'Arbitre',    className: 'bg-amber-100 text-amber-700' },
}

export function CommentTypeBadge({ type }: CommentTypeBadgeProps) {
  const config = typeConfig[type]

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-sans ${config.className}`}>
      {config.label}
    </span>
  )
}
