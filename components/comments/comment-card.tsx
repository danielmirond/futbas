import { CommentTypeBadge } from './comment-type-badge'

type CommentType = 'passio' | 'prediccio' | 'arbitre'

interface CommentCardProps {
  displayName: string
  text: string
  type: CommentType
  relativeTime: string
}

export function CommentCard({ displayName, text, type, relativeTime }: CommentCardProps) {
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex gap-3 py-3">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-ink/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-ink">{initial}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-ink font-sans">{displayName}</span>
          <CommentTypeBadge type={type} />
          <span className="text-xs text-muted font-sans">{relativeTime}</span>
        </div>
        <p className="text-sm text-ink/80 font-sans">{text}</p>
      </div>
    </div>
  )
}
