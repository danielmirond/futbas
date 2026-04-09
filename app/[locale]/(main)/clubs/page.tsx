import { useTranslations } from 'next-intl'
import { ClubDirectory } from '@/components/club/club-directory'

export default function ClubsPage() {
  const t = useTranslations('club')

  return (
    <div className="space-y-6">
      <h1 className="text-headline font-serif">{t('title')}</h1>
      <ClubDirectory />
    </div>
  )
}
