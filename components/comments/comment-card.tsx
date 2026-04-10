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
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <span className="font-display font-black text-xs text-white">{initial}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-sans font-bold text-ink text-sm">{displayName}</span>
          <CommentTypeBadge type={type} />
          <span className="font-mono text-[10px] text-ink3 uppercase tracking-wider">
            {timeAgo(createdAt)}
          </span>
        </div>
        <p className="font-sans text-sm text-ink2 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}
