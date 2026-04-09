import { CommentTypeBadge } from './comment-type-badge'
import type { CommentType } from '@/types/database'

interface CommentCardProps {
  displayName: string
  text: string
  type: CommentType
  createdAt: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'ara'
  if (minutes < 60) return `fa ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `fa ${hours}h`
  const days = Math.floor(hours / 24)
  return `fa ${days}d`
}

export function CommentCard({ displayName, text, type, createdAt }: CommentCardProps) {
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="flex gap-3 py-3">
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-ink">{initial}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-ink font-sans">{displayName}</span>
          <CommentTypeBadge type={type} />
          <span className="text-xs text-muted font-sans">{timeAgo(createdAt)}</span>
        </div>
        <p className="text-sm text-ink/80 font-sans">{text}</p>
      </div>
    </div>
  )
}
