import { useTranslations } from 'next-intl'
import { ClassificationTable } from '@/components/classification/classification-table'
import { CompetitionSelector } from '@/components/classification/competition-selector'

export default function ClassificacioPage() {
  const t = useTranslations('classification')

  return (
    <div className="space-y-6">
      <h1 className="text-headline font-serif">{t('title')}</h1>
      <CompetitionSelector />
      <ClassificationTable />
    </div>
  )
}
