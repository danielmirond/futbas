'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ClassificationTable } from '@/components/classification/classification-table'
import { CompetitionSelector } from '@/components/classification/competition-selector'

export default function ClassificacioPage() {
  const t = useTranslations('classification')
  const [filters, setFilters] = useState({
    category: 'primera-catalana',
    group: 'grup-1',
  })

  return (
    <div className="space-y-6">
      {/* Hero Premier */}
      <section className="hero p-6 md:p-10">
        <div className="hero-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
        <div className="relative z-10">
          <div className="eyebrow-light mb-3">
            TEMPORADA 2025/26 · DADES REALS FCF
          </div>
          <h1 className="font-display font-black text-4xl md:text-display text-white uppercase tracking-tight">
            {t('title')}
          </h1>
        </div>
      </section>

      <CompetitionSelector onChange={setFilters} />

      <div className="bg-card border border-border">
        <div className="section-head">
          {filters.category.replace(/-/g, ' ')} — {filters.group.replace(/-/g, ' ')}
        </div>
        <ClassificationTable
          season="2526"
          sport="futbol-11"
          category={filters.category}
          group={filters.group}
        />
      </div>
    </div>
  )
}
