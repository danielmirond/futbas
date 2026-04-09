'use client'

import { useEffect, useState } from 'react'
import { useRealtimeComments } from './use-comments'
import { CommentCard } from './comment-card'
import { CommentInput } from './comment-input'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import type { User } from '@supabase/supabase-js'
import type { CommentType } from '@/types/database'

interface CommentFeedProps {
  matchId: string
}

export function CommentFeed({ matchId }: CommentFeedProps) {
  const { comments, isLoading, addComment } = useRealtimeComments(matchId)
  const t = useTranslations('comments')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function handleSubmit(text: string, type: CommentType) {
    try {
      await addComment(text, type)
    } catch (err) {
      console.error('Failed to add comment:', err)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted font-sans py-4">{t('title')}...</p>
  }

  return (
    <div>
      <h3 className="text-title font-serif mb-4">{t('title')}</h3>

      <div className="divide-y divide-border/50">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            displayName={comment.user?.display_name || 'Anònim'}
            text={comment.text}
            type={comment.comment_type}
            createdAt={comment.created_at}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-sm text-muted font-sans py-6 text-center">
          Encara no hi ha comentaris. Sigues el primer!
        </p>
      )}

      {user ? (
        <CommentInput onSubmit={handleSubmit} />
      ) : (
        <div className="border-t border-border pt-4 text-center">
          <p className="text-sm text-muted">{t('loginToComment')}</p>
        </div>
      )}
    </div>
  )
}
