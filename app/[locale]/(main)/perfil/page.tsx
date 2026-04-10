'use client'

import { useTranslations } from 'next-intl'

export default function PerfilPage() {
  const t = useTranslations('profile')

  return (
    <div className="space-y-6">
      <section className="hero p-6 md:p-10">
        <div className="hero-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
        <div className="relative z-10">
          <h1 className="font-display font-black text-4xl md:text-display text-white uppercase tracking-tight">
            {t('title')}
          </h1>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="eyebrow">{t('favorites')}</div>
        <p className="font-sans text-sm text-ink2">{t('noFavorites')}</p>
      </section>

      <section className="card space-y-4">
        <div className="eyebrow">{t('language')}</div>
        <div className="flex gap-2">
          <button className="btn-primary">
            {t('catalan')}
          </button>
          <button className="btn-ghost">
            {t('spanish')}
          </button>
        </div>
      </section>
    </div>
  )
}
