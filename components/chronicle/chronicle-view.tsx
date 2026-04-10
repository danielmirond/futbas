'use client'

import { SocialShare } from './social-share'

interface ChronicleViewProps {
  matchId: string
  headline: string | null
  body: string | null
  mvpPlayer?: string | null
  mvpJustification?: string | null
  socialSummary?: string | null
  generatedAt?: string | null
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = Date.now()
  const diffHours = Math.floor((now - d.getTime()) / 3_600_000)
  if (diffHours < 1) return 'ARA MATEIX'
  if (diffHours < 24) return `FA ${diffHours}H`
  const days = Math.floor(diffHours / 24)
  return `FA ${days}D`
}

export function ChronicleView({
  headline,
  body,
  mvpPlayer,
  mvpJustification,
  socialSummary,
  generatedAt,
}: ChronicleViewProps) {
  if (!body || !headline) return null

  return (
    <article className="max-w-3xl">
      {/* AI tag */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <span className="pill pill-red">🤖 IA</span>
        <span className="eyebrow">CRÒNICA · {formatDate(generatedAt)}</span>
      </div>

      {/* Headline */}
      <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter leading-[0.95] mb-8 text-ink">
        {headline}
      </h2>

      {/* Body with drop cap */}
      <div className="font-sans text-base md:text-lg leading-relaxed text-ink2 space-y-5">
        {body.split('\n\n').map((paragraph, i) => (
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
      {mvpPlayer && (
        <div className="mt-10 bg-primary text-white p-6 border-l-[3px] border-l-neon">
          <div className="eyebrow-light mb-2 text-neon">🏆 MVP DEL PARTIT</div>
          <p className="font-display font-black text-3xl md:text-4xl uppercase tracking-tighter text-neon leading-none">
            {mvpPlayer}
          </p>
          {mvpJustification && (
            <p className="font-sans text-sm text-white/70 mt-3 leading-relaxed">{mvpJustification}</p>
          )}
        </div>
      )}

      {/* Social share */}
      {socialSummary && (
        <div className="mt-10">
          <SocialShare summary={socialSummary} />
        </div>
      )}
    </article>
  )
}
