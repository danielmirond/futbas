import { useTranslations } from 'next-intl'
import { ClassificationTable } from '@/components/classification/classification-table'
import { CompetitionSelector } from '@/components/classification/competition-selector'

export default function ClassificacioPage() {
  const t = useTranslations('classification')

  return (
    <div className="space-y-6">
      {/* Bento header */}
      <section className="bento-lime rounded-bento p-6 md:p-10">
        <div className="eyebrow text-ink/60 mb-4">
          Primera Catalana · Grup 1
        </div>
        <h1 className="text-headline font-display uppercase">{t('title')}</h1>
      </section>

      <CompetitionSelector />

      <div className="card">
        <ClassificationTable />
      </div>
    </div>
  )
}
