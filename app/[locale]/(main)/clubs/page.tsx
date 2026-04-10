import { useTranslations } from 'next-intl'
import { ClubDirectory } from '@/components/club/club-directory'

export default function ClubsPage() {
  const t = useTranslations('club')

  return (
    <div className="space-y-6">
      <section className="bento-pink rounded-bento p-6 md:p-10">
        <div className="eyebrow text-white/80 mb-4">
          16 clubs · 3 delegacions
        </div>
        <h1 className="text-headline font-display uppercase text-white">{t('title')}</h1>
      </section>

      <ClubDirectory />
    </div>
  )
}
