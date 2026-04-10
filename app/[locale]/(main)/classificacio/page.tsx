import { useTranslations } from 'next-intl'
import { ClassificationTable } from '@/components/classification/classification-table'
import { CompetitionSelector } from '@/components/classification/competition-selector'

export default function ClassificacioPage() {
  const t = useTranslations('classification')

  return (
    <div className="space-y-6">
      {/* Hero Premier */}
      <section className="hero p-6 md:p-10">
        <div className="hero-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
        <div className="relative z-10">
          <div className="eyebrow-light mb-3">
            1ª CATALANA · GRUP 1 · TEMPORADA 2025/26
          </div>
          <h1 className="font-display font-black text-4xl md:text-display text-white uppercase tracking-tight">
            {t('title')}
          </h1>
        </div>
      </section>

      <CompetitionSelector />

      <div className="bg-card border border-border">
        <div className="section-head">Classificació Primera Catalana — Grup 1</div>
        <ClassificationTable />
      </div>
    </div>
  )
}
