import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()

  return (
    <div className="space-y-6">
      {/* Hero — dark bento card */}
      <section className="bento-dark rounded-bento p-8 md:p-14 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent eyebrow mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Primera Catalana · Grup 1
          </div>
          <h1 className="text-mega font-display text-ink-dark uppercase leading-[0.85]">
            FUTBAS
          </h1>
          <p className="text-ink-dark/60 mt-6 text-lg max-w-md font-sans font-light">
            Classificacions, resultats i cròmiques del futbol amateur català. Tot en un lloc.
          </p>
        </div>
        {/* Decorative gradient */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-20 w-64 h-64 rounded-full bg-violet/10 blur-3xl pointer-events-none" />
      </section>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6">
        {/* Partits avui — large orange card */}
        <Link
          href={`/${locale}/partits`}
          className="bento-accent rounded-bento p-6 md:col-span-3 md:row-span-2 card-hover relative overflow-hidden group"
        >
          <div className="flex items-start justify-between mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-white/80">
              {t('todayMatches')}
            </span>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-white group-hover:translate-x-1 transition-transform">
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="space-y-4">
            <div className="text-6xl md:text-7xl font-display text-white leading-none">
              4
            </div>
            <p className="text-white/90 text-sm font-sans max-w-xs">
              partits programats per avui a la teva competició
            </p>
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-accent" />
                <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-accent" />
                <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-accent" />
              </div>
              <span className="text-xs text-white/80 font-mono">+ 5 en directe</span>
            </div>
          </div>
        </Link>

        {/* Classificació — lime card */}
        <Link
          href={`/${locale}/classificacio`}
          className="bento-lime rounded-bento p-6 md:col-span-3 card-hover relative overflow-hidden group"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-ink/60">
              {t('standings')}
            </span>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform">
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-5xl leading-none">1</span>
            <span className="font-display text-xl uppercase tracking-tight">Argentona</span>
          </div>
          <div className="mt-3 text-xs font-mono text-ink/70">45 PTS · +14 DG · 24J</div>
        </Link>

        {/* Clubs — pink card */}
        <Link
          href={`/${locale}/clubs`}
          className="bento-pink rounded-bento p-6 md:col-span-2 card-hover group"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-white/80">
              Clubs
            </span>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-white group-hover:translate-x-1 transition-transform">
              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="font-display text-6xl text-white leading-none">16</div>
          <div className="text-xs font-mono text-white/80 mt-2 uppercase tracking-wider">equips federats</div>
        </Link>

        {/* Crònica — violet card */}
        <div className="bento-violet rounded-bento p-6 md:col-span-4 group">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-white/80">
              {t('latestChronicle')} · IA
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono uppercase">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              Nova
            </span>
          </div>
          <h3 className="font-sans text-2xl text-white leading-tight mb-3 font-bold">
            Argentona consolida el liderat amb una victòria clau
          </h3>
          <p className="text-white/75 text-sm font-sans line-clamp-2 font-light">
            Victòria a domicili per 1-3 davant del Figueres amb una actuació destacada del davanter local...
          </p>
        </div>

        {/* Crònica stats — small amber card */}
        <div className="bento-amber rounded-bento p-6 md:col-span-2 group">
          <span className="text-xs font-mono uppercase tracking-wider text-ink/60">
            Cròmiques IA
          </span>
          <div className="font-display text-7xl mt-3 leading-none">127</div>
          <div className="text-xs font-mono text-ink/70 mt-2 uppercase tracking-wider">generades aquesta temporada</div>
        </div>

        {/* Sky — real-time card */}
        <div className="bento-sky rounded-bento p-6 md:col-span-4 group flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-white/80">
              En directe
            </span>
            <h3 className="font-sans text-xl text-white mt-2 leading-tight font-bold">
              Comentaris en temps real durant cada partit
            </h3>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/90">
            <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span className="font-mono text-xs uppercase">Live</span>
          </div>
        </div>
      </div>
    </div>
  )
}
