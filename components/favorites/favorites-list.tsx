'use client'

import { ClubCard } from '@/components/club/club-card'

interface FavoriteClub {
  id: string
  name: string
  delegation: string
  municipality: string
  primaryColor: string
  secondaryColor: string
}

interface FavoritesListProps {
  favorites: FavoriteClub[]
  locale?: string
}

export function FavoritesList({ favorites, locale = 'ca' }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <p className="text-sm text-muted font-sans py-8 text-center">
        Encara no tens cap club favorit.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {favorites.map((club) => (
        <ClubCard key={club.id} {...club} locale={locale} />
      ))}
    </div>
  )
}
