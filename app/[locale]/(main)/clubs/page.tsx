import { useTranslations } from 'next-intl'
import { ClubDirectory } from '@/components/club/club-directory'

export default function ClubsPage() {
  const t = useTranslations('club')

  return (
    <div className="space-y-6">
      <section className="bento-pink rounded-bento p-6 md:p-8">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-white/80">
            16 clubs · 3 delegacions
          </span>
        </div>
        <h1 className="text-headline font-serif text-white">{t('title')}</h1>
      </section>

      <ClubDirectory />
    </div>
  )
}
