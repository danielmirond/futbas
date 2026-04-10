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
    home:  { primary: '#37003C', secondary: '#FF2882' },
    away:  { primary: '#FFFFFF', secondary: '#37003C' },
    third: { primary: '#0A0A0A', secondary: '#00FF85' },
  },
}

export function ClubHeader({ clubId: _clubId }: ClubHeaderProps) {
  const club = MOCK

  return (
    <div className="hero p-6 md:p-10">
      <div className="hero-glow" />
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />

      <div className="relative z-10">
        <div className="eyebrow-light mb-3">
          {club.delegation} · FUNDACIÓ {club.founded} · {club.stadium}
        </div>

        <h1 className="font-display font-black text-5xl md:text-6xl text-white uppercase tracking-tighter leading-none mb-6">
          {club.name}
        </h1>

        <div className="flex flex-wrap gap-8 items-end">
          <div className="text-center">
            <KitSvg primaryColor={club.kits.home.primary} secondaryColor={club.kits.home.secondary} />
            <p className="eyebrow-light mt-2">Local</p>
          </div>
          <div className="text-center">
            <KitSvg primaryColor={club.kits.away.primary} secondaryColor={club.kits.away.secondary} />
            <p className="eyebrow-light mt-2">Visitant</p>
          </div>
          <div className="text-center">
            <KitSvg primaryColor={club.kits.third.primary} secondaryColor={club.kits.third.secondary} />
            <p className="eyebrow-light mt-2">Tercera</p>
          </div>
        </div>
      </div>
    </div>
  )
}
