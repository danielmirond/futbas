import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()

  return (
    <div className="space-y-6">
      {/* Premier hero — match preview */}
      <section className="hero p-6 md:p-10">
        <div className="hero-glow" />
        <div className="absolute -right-10 bottom-0 w-80 h-80 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(0,255,133,.08), transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />

        <div className="relative z-10">
          <div className="eyebrow-light mb-4">
            ⚽ PROPER PARTIT · 1ª CATALANA · J29
          </div>

          <div className="flex items-center justify-between gap-4 md:gap-8 mb-8">
            <div className="text-center flex-1">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#e8001d] to-[#800010] border-2 border-white/20 flex items-center justify-center">
                <span className="font-display font-black text-xl md:text-2xl text-white">FCM</span>
              </div>
              <div className="font-display font-black text-sm md:text-base text-white uppercase tracking-tight">
                FC Martinenc
              </div>
            </div>

            <div className="text-center">
              <div className="font-display font-black text-4xl md:text-6xl text-white/20 tracking-tighter">VS</div>
              <div className="eyebrow text-accent mt-1 md:mt-2">CASA · 18:00H</div>
            </div>

            <div className="text-center flex-1">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#1565c0] to-[#0d3b80] border-2 border-white/20 flex items-center justify-center">
                <span className="font-display font-black text-xl md:text-2xl text-white">UEC</span>
              </div>
              <div className="font-display font-black text-sm md:text-base text-white uppercase tracking-tight">
                UE Cornellà B
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
            <div className="bg-black/25 p-3 text-center">
              <div className="eyebrow-light mb-1">KO</div>
              <div className="font-display font-black text-2xl text-white">18:00h</div>
              <div className="eyebrow-light mt-0.5">DG 29/03</div>
            </div>
            <div className="bg-black/25 p-3 text-center">
              <div className="eyebrow-light mb-1">DISPONIBILITAT</div>
              <div className="font-display font-black text-2xl text-neon">8 ✓</div>
              <div className="eyebrow-light mt-0.5">5 PENDENTS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border">
        <Link href={`/${locale}/classificacio`} className="bg-card p-5 text-center hover:bg-surface transition-colors">
          <div className="text-3xl mb-2">🏆</div>
          <div className="eyebrow">{t('standings')}</div>
        </Link>
        <Link href={`/${locale}/partits`} className="bg-card p-5 text-center hover:bg-surface transition-colors">
          <div className="text-3xl mb-2">⚽</div>
          <div className="eyebrow">{t('todayMatches')}</div>
        </Link>
        <Link href={`/${locale}/clubs`} className="bg-card p-5 text-center hover:bg-surface transition-colors">
          <div className="text-3xl mb-2">🛡</div>
          <div className="eyebrow">Clubs</div>
        </Link>
        <Link href={`/${locale}/perfil`} className="bg-card p-5 text-center hover:bg-surface transition-colors">
          <div className="text-3xl mb-2">👤</div>
          <div className="eyebrow">Perfil</div>
        </Link>
      </section>

      {/* Last result card — magenta border-left */}
      <section className="card border-l-neon">
        <div className="eyebrow mb-3">ÚLTIM RESULTAT · J28 · 22/03/2026</div>
        <div className="flex items-center justify-between">
          <div className="font-display font-bold text-lg md:text-2xl uppercase tracking-tight">
            FCM <span className="score-dash">–</span> CE Júpiter
          </div>
          <div className="flex items-center gap-3">
            <div className="score text-3xl md:text-5xl">
              2<span className="score-dash">–</span>1
            </div>
            <div className="form-dot form-dot-w">V</div>
          </div>
        </div>
        <div className="mt-3 font-mono text-[10px] text-ink3 uppercase tracking-wider">
          ⚽ A.Díaz 23' · J.Torres 51' · 🏆 MVP: J.Torres
        </div>
      </section>

      {/* Chronicle card */}
      <section className="card">
        <div className="flex items-center gap-2 mb-3">
          <span className="tag tag-magenta">IA</span>
          <span className="eyebrow">Crònica · fa 2 hores</span>
        </div>
        <h3 className="font-display font-black text-xl md:text-2xl uppercase leading-tight">
          FCM consolida el liderat amb un doblet de Torres
        </h3>
        <p className="mt-3 font-sans text-sm text-ink2 leading-relaxed">
          Victòria a domicili per 1-3 davant del Figueres amb una actuació destacada del davanter local.
          El Martinenc manté els 5 punts d&apos;avantatge sobre el segon classificat.
        </p>
      </section>
    </div>
  )
}
