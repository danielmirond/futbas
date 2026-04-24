'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FavoriteButtonProps {
  clubId?: string
  teamId?: string
  competitionId?: string
  className?: string
}

export function FavoriteButton({
  clubId,
  teamId,
  competitionId,
  className = '',
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const favoriteType = clubId ? 'club' : teamId ? 'team' : competitionId ? 'competition' : null
  const targetId = clubId || teamId || competitionId || null

  useEffect(() => {
    if (!favoriteType || !targetId) return

    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      const column = `${favoriteType}_id`
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('favorite_type', favoriteType)
        .eq(column, targetId)
        .maybeSingle()

      setIsFavorited(!!data)
      setLoading(false)
    }

    check()
  }, [favoriteType, targetId])

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!userId || !favoriteType || !targetId) {
      // Not logged in — redirect to login
      window.location.href = '/ca/login'
      return
    }

    const supabase = createClient()
    const column = `${favoriteType}_id`

    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('favorite_type', favoriteType)
        .eq(column, targetId)
      setIsFavorited(false)
    } else {
      await supabase.from('favorites').insert({
        user_id: userId,
        favorite_type: favoriteType,
        [column]: targetId,
      })
      setIsFavorited(true)
    }
  }

  if (loading) {
    return <div className={`w-8 h-8 ${className}`} />
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={isFavorited ? 'Treure de favorits' : 'Afegir a favorits'}
      className={`p-1.5 transition-colors hover:bg-accent/5 ${className}`}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={isFavorited ? '#E30613' : 'none'}
        stroke={isFavorited ? '#E30613' : '#8a8a8a'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
