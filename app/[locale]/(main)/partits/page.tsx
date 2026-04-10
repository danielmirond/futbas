import { useTranslations } from 'next-intl'
import { MatchList } from '@/components/match/match-list'

export default function PartitsPage() {
  const t = useTranslations('match')

  return (
    <div className="space-y-6">
      <section className="bento-accent rounded-bento p-6 md:p-10">
        <div className="eyebrow text-white/80 mb-4">
          Jornada 25 · en joc
        </div>
        <h1 className="text-headline font-display uppercase text-white">{t('title')}</h1>
      </section>

      <MatchList />
    </div>
  )
}
