import { useTranslations } from 'next-intl'
import { MatchList } from '@/components/match/match-list'

export default function PartitsPage() {
  const t = useTranslations('match')

  return (
    <div className="space-y-6">
      <h1 className="text-headline font-serif">{t('title')}</h1>
      <MatchList />
    </div>
  )
}
