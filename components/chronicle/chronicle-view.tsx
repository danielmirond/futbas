'use client'

import { Badge } from '@/components/ui/badge'
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
    <article className="max-w-2xl">
      {/* Headline */}
      <h2 className="font-serif text-headline md:text-display italic mb-4 leading-tight">
        {chronicle.headline}
      </h2>

      {/* AI badge */}
      <div className="mb-6">
        <Badge variant="muted">Generada per IA</Badge>
      </div>

      {/* Body with drop cap */}
      <div className="font-sans text-sm leading-relaxed text-ink/85 space-y-4">
        {chronicle.body.split('\n\n').map((paragraph, i) => (
          <p key={i} className={i === 0 ? 'first-letter:text-4xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:leading-none first-letter:text-ink' : ''}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* MVP callout */}
      <div className="mt-8 border-l-2 border-accent bg-accent/10 rounded-r-sm p-4">
        <h4 className="text-xs uppercase tracking-wider text-accent font-sans font-medium mb-1">
          MVP del Partit
        </h4>
        <p className="font-serif text-title text-ink">{chronicle.mvpName}</p>
        <p className="text-sm text-muted font-sans mt-1">{chronicle.mvpReason}</p>
      </div>

      {/* Social share */}
      <div className="mt-8">
        <SocialShare summary={chronicle.socialSummary} />
      </div>
    </article>
  )
}
