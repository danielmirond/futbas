import { useTranslations } from 'next-intl'
import { MatchList } from '@/components/match/match-list'

export default function PartitsPage() {
  const t = useTranslations('match')

  return (
    <div className="space-y-6">
      <section className="hero p-6 md:p-10">
        <div className="hero-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
        <div className="relative z-10">
          <div className="eyebrow-light mb-3">
            JORNADA 25 · EN JOC · 1ª CATALANA
          </div>
          <h1 className="font-display font-black text-4xl md:text-display text-white uppercase tracking-tight">
            {t('title')}
          </h1>
        </div>
      </section>

      <MatchList />
    </div>
  )
}
