'use client'

import { SocialShare } from './social-share'

interface ChronicleViewProps {
  matchId: string
}

const MOCK = {
  headline: 'El Martinenc remunta i consolida el liderat amb un gol de Biel Torres al minut 78',
  body: `El CE Martinenc va protagonitzar una remuntada emocionant al Camp Municipal davant d'una UE Sants que va plantar cara durant tot el partit. Marc Pujol va obrir el marcador al minut 12 amb un xut des de fora de l'area que va sorprendre el porter visitant.

Pero el Sants no es va rendir. Pau Garcia va empatar al minut 38 amb un cop de cap impecable despres d'un corner servit per la banda esquerra. La primera part va acabar amb empat a un gol i la sensacio que qualsevol dels dos equips podia endur-se la victoria.

A la represa, el Martinenc va dominar la possessio pero no trobava la manera de superar la defensa visitant. L'entrada d'Arnau Mas al minut 55 va donar mes profunditat a l'atac local. Finalment, al minut 78, Biel Torres va rebre una passada filtrada i va definir amb classe per posar el 2-1 definitiu.

Els darrers minuts van ser de patiment, amb el Sants buscant l'empat amb un jugador menys despres de l'expulsio de Jordi Vila. El Martinenc va saber gestionar el temps i es va endur tres punts d'or que el mantenen lider de la Primera Catalana.`,
  mvpName: 'Marc Pujol',
  mvpReason: 'Gol inaugural i lideratge constant al mig del camp durant tot el partit.',
  socialSummary: `CE Martinenc 2-1 UE Sants | Primera Catalana J25

Gols de Marc Pujol (12') i Biel Torres (78'). El Martinenc remunta i segueix lider!

MVP: Marc Pujol

#PrimeraCatalana #CEMartinenc #Futbas`,
}

export function ChronicleView({ matchId: _matchId }: ChronicleViewProps) {
  const chronicle = MOCK

  return (
    <article className="max-w-3xl">
      {/* AI tag */}
      <div className="mb-4 flex items-center gap-2">
        <span className="pill pill-red">🤖 IA</span>
        <span className="eyebrow">CRÒNICA · J25 · FA 2 HORES</span>
      </div>

      {/* Headline */}
      <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-[0.95] mb-8 text-ink">
        {chronicle.headline}
      </h2>

      {/* Body with drop cap */}
      <div className="font-sans text-base md:text-lg leading-relaxed text-ink2 space-y-5">
        {chronicle.body.split('\n\n').map((paragraph, i) => (
          <p
            key={i}
            className={
              i === 0
                ? 'first-letter:text-8xl first-letter:font-display first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-accent'
                : ''
            }
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* MVP callout */}
      <div className="mt-10 bg-primary text-white p-6 border-l-[3px] border-l-neon">
        <div className="eyebrow-light mb-2 text-neon">🏆 MVP DEL PARTIT</div>
        <p className="font-display font-black text-3xl md:text-4xl uppercase tracking-tighter text-neon leading-none">
          {chronicle.mvpName}
        </p>
        <p className="font-sans text-sm text-white/70 mt-3 leading-relaxed">
          {chronicle.mvpReason}
        </p>
      </div>

      {/* Social share */}
      <div className="mt-10">
        <SocialShare summary={chronicle.socialSummary} />
      </div>
    </article>
  )
}
