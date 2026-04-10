import { useTranslations } from 'next-intl'
import { ClassificationTable } from '@/components/classification/classification-table'
import { CompetitionSelector } from '@/components/classification/competition-selector'

export default function ClassificacioPage() {
  const t = useTranslations('classification')

  return (
    <div className="space-y-6">
      {/* Bento header */}
      <section className="bento-lime rounded-bento p-6 md:p-8">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-ink/60">
            Primera Catalana · Grup 1
          </span>
        </div>
        <h1 className="text-headline font-serif">{t('title')}</h1>
      </section>

      <CompetitionSelector />

      <div className="card">
        <ClassificationTable />
      </div>
    </div>
  )
}
