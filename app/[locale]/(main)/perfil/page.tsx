'use client'

import { useTranslations } from 'next-intl'

export default function PerfilPage() {
  const t = useTranslations('profile')

  return (
    <div className="space-y-6">
      <section className="bento-violet rounded-bento p-6 md:p-10">
        <h1 className="text-headline font-display uppercase text-white">{t('title')}</h1>
      </section>

      <section className="card space-y-4">
        <h2 className="text-title font-serif">{t('favorites')}</h2>
        <p className="text-muted text-sm">{t('noFavorites')}</p>
      </section>

      <section className="card space-y-4">
        <h2 className="text-title font-serif">{t('language')}</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm bg-accent text-white rounded-full font-medium">
            {t('catalan')}
          </button>
          <button className="px-4 py-2 text-sm border border-border text-muted rounded-full hover:border-ink/30 transition-colors">
            {t('spanish')}
          </button>
        </div>
      </section>
    </div>
  )
}
