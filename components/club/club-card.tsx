import Link from 'next/link'
import { KitSvg } from './kit-svg'
import { Badge } from '@/components/ui/badge'

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
    <Link href={`/${locale}/clubs/${id}`} className="block">
      <div className="card hover:border-ink/10 transition-colors flex items-center gap-4">
        <KitSvg
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          className="flex-shrink-0"
        />
        <div className="min-w-0">
          <h3 className="font-serif text-title truncate">{name}</h3>
          <Badge variant="muted" className="mt-1">{delegation}</Badge>
          <p className="text-xs text-muted mt-1 font-sans">{municipality}</p>
        </div>
      </div>
    </Link>
  )
}
