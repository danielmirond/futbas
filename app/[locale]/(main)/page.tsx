import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function HomePage() {
  const t = useTranslations('home')
  const tNav = useTranslations('nav')

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section>
        <h1 className="text-display font-serif">Futbas</h1>
        <p className="text-muted mt-2 text-lg">
          Classificacions, resultats i cròmiques del futbol amateur
        </p>
      </section>

      {/* Today's matches placeholder */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline font-serif">{t('todayMatches')}</h2>
        </div>
        <div className="card">
          <p className="text-muted text-sm">Els partits d&apos;avui apareixeran aquí quan el scraper estigui connectat.</p>
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-headline font-serif mb-4">{t('standings')}</h2>
        <div className="card">
          <p className="text-muted text-sm">La classificació apareixerà aquí quan el scraper estigui connectat.</p>
        </div>
      </section>

      {/* Latest chronicle */}
      <section>
        <h2 className="text-headline font-serif mb-4">{t('latestChronicle')}</h2>
        <div className="card">
          <p className="text-muted text-sm">Les cròmiques IA apareixeran aquí.</p>
        </div>
      </section>
    </div>
  )
}
