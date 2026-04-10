import Link from 'next/link'
import { KitSvg } from './kit-svg'
import { FavoriteButton } from '@/components/favorites/favorite-button'

interface ClubCardProps {
  id: string
  name: string
  delegation: string
  municipality: string
  primaryColor: string
  secondaryColor: string
  locale?: string
}

export function ClubCard({
  id,
  name,
  delegation,
  municipality,
  primaryColor,
  secondaryColor,
  locale = 'ca',
}: ClubCardProps) {
  return (
    <div className="card card-hover flex items-center gap-4 relative">
      <Link href={`/${locale}/clubs/${id}`} className="absolute inset-0" aria-label={name} />
      <KitSvg
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        className="flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <h3 className="font-display font-black uppercase text-lg tracking-tight text-ink leading-none truncate">
          {name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="pill pill-muted">{delegation}</span>
        </div>
        <p className="font-mono text-[10px] text-ink3 uppercase tracking-wider mt-2">
          {municipality}
        </p>
      </div>
      <div className="relative z-10">
        <FavoriteButton clubId={id} />
      </div>
    </div>
  )
}
