'use client'

import { useState } from 'react'

interface FavoriteButtonProps {
  initialFavorited?: boolean
  onToggle?: (isFavorited: boolean) => void
}

export function FavoriteButton({ initialFavorited = false, onToggle }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited)

  function handleToggle() {
    const next = !isFavorited
    setIsFavorited(next)
    onToggle?.(next)
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={isFavorited ? 'Treure de favorits' : 'Afegir a favorits'}
      className="p-1.5 rounded-sm transition-colors hover:bg-ink/5"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={isFavorited ? '#DC2626' : 'none'}
        stroke={isFavorited ? '#DC2626' : '#71717A'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
