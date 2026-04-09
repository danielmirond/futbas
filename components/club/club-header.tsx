import { KitSvg } from './kit-svg'

interface ClubHeaderProps {
  clubId: string
}

// Mock data - will be replaced with real fetch
const MOCK = {
  name: 'CE Martinenc',
  delegation: 'Barcelona',
  municipality: 'Barcelona',
  stadium: 'Camp Municipal de Martinenc',
  founded: 1909,
  kits: {
    home:  { primary: '#1B4FFF', secondary: '#FFFFFF' },
    away:  { primary: '#FFFFFF', secondary: '#1B4FFF' },
    third: { primary: '#0A0A0A', secondary: '#1B4FFF' },
  },
}

export function ClubHeader({ clubId: _clubId }: ClubHeaderProps) {
  const club = MOCK

  return (
    <div className="py-8">
      <h1 className="font-serif text-display mb-2">{club.name}</h1>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted font-sans mb-6">
        <span>{club.delegation}</span>
        <span className="text-border">|</span>
        <span>{club.municipality}</span>
        <span className="text-border">|</span>
        <span>{club.stadium}</span>
        <span className="text-border">|</span>
        <span>Fundat el {club.founded}</span>
      </div>

      <div className="flex items-end gap-6">
        <div className="text-center">
          <KitSvg primaryColor={club.kits.home.primary} secondaryColor={club.kits.home.secondary} />
          <p className="text-xs text-muted mt-1 font-sans">Local</p>
        </div>
        <div className="text-center">
          <KitSvg primaryColor={club.kits.away.primary} secondaryColor={club.kits.away.secondary} />
          <p className="text-xs text-muted mt-1 font-sans">Visitant</p>
        </div>
        <div className="text-center">
          <KitSvg primaryColor={club.kits.third.primary} secondaryColor={club.kits.third.secondary} />
          <p className="text-xs text-muted mt-1 font-sans">Tercera</p>
        </div>
      </div>
    </div>
  )
}
