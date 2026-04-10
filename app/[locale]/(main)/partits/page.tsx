import { useTranslations } from 'next-intl'
import { MatchList } from '@/components/match/match-list'

export default function PartitsPage() {
  const t = useTranslations('match')

  return (
    <div className="space-y-6">
      <section className="bento-accent rounded-bento p-6 md:p-8">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-white/80">
            Jornada 25 · en joc
          </span>
        </div>
        <h1 className="text-headline font-serif text-white">{t('title')}</h1>
      </section>

      <MatchList />
    </div>
  )
}
