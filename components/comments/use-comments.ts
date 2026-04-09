'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CommentType } from '@/types/database'

export interface Comment {
  id: string
  user_id: string
  match_id: string
  text: string
  comment_type: CommentType
  created_at: string
  user?: {
    display_name: string | null
    avatar_url: string | null
  }
}

export function useRealtimeComments(matchId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchComments() {
      const { data, error } = await supabase
        .from('comments')
        .select('*, user:users(display_name, avatar_url)')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
        .limit(100)

      if (!error && data) {
        setComments(data as Comment[])
      }
      setIsLoading(false)
    }

    fetchComments()

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`comments:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `match_id=eq.${matchId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('comments')
            .select('*, user:users(display_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (data) {
            setComments(prev => [...prev, data as Comment])
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setComments(prev => prev.filter(c => c.id !== payload.old.id))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [matchId])

  const addComment = useCallback(async (text: string, type: CommentType) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Must be logged in to comment')

    const { error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        match_id: matchId,
        text,
        comment_type: type,
      })

    if (error) throw error
  }, [matchId])

  const deleteComment = useCallback(async (commentId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error
  }, [])

  return { comments, isLoading, addComment, deleteComment }
}
