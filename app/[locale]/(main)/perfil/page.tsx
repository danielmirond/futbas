'use client'

import { useTranslations } from 'next-intl'

export default function PerfilPage() {
  const t = useTranslations('profile')

  return (
    <div className="space-y-6">
      <h1 className="text-headline font-serif">{t('title')}</h1>

      <section className="card space-y-4">
        <h2 className="text-title font-serif">{t('favorites')}</h2>
        <p className="text-muted text-sm">{t('noFavorites')}</p>
      </section>

      <section className="card space-y-4">
        <h2 className="text-title font-serif">{t('language')}</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-sm border border-accent text-accent rounded-sm">
            {t('catalan')}
          </button>
          <button className="px-3 py-1.5 text-sm border border-border text-muted rounded-sm hover:border-ink/30 transition-colors">
            {t('spanish')}
          </button>
        </div>
      </section>
    </div>
  )
}
