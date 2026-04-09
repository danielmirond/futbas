'use client'

import { useRealtimeComments } from './use-comments'
import { CommentCard } from './comment-card'
import { CommentInput } from './comment-input'

interface CommentFeedProps {
  matchId: string
}

export function CommentFeed({ matchId }: CommentFeedProps) {
  const { comments, isLoading, addComment } = useRealtimeComments(matchId)

  if (isLoading) {
    return <p className="text-sm text-muted font-sans py-4">Carregant comentaris...</p>
  }

  return (
    <div>
      <div className="divide-y divide-border/50">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            displayName={comment.displayName}
            text={comment.text}
            type={comment.type}
            relativeTime={comment.relativeTime}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-sm text-muted font-sans py-6 text-center">
          Encara no hi ha comentaris. Sigues el primer!
        </p>
      )}

      <CommentInput onSubmit={addComment} />
    </div>
  )
}
