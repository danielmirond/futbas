import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChronicleView } from '@/components/chronicle/chronicle-view'
import { GenerateChronicleButton } from '@/components/chronicle/generate-chronicle-button'

interface PageProps {
  params: { matchId: string; locale: string }
}

export default async function CronicaPage({ params: { matchId, locale } }: PageProps) {
  const supabase = createClient()

  const { data: match } = await supabase
    .from('matches')
    .select(`
      id, matchday, home_score, away_score, status,
      home_team:home_team_id(team_name),
      away_team:away_team_id(team_name),
      competition:competition_id(name, group_name)
    `)
    .eq('id', matchId)
    .maybeSingle()

  if (!match) {
    return (
      <div className="max-w-3xl">
        <div className="card text-center py-12">
          <div className="eyebrow mb-2">404</div>
          <h1 className="font-display font-black text-3xl uppercase mb-4">Partit no trobat</h1>
          <Link href={`/${locale}/partits`} className="btn-ghost inline-block">← Tornar als partits</Link>
        </div>
      </div>
    )
  }

  const { data: chronicle } = await supabase
    .from('chronicles')
    .select('headline, body, social_summary, mvp_player, mvp_justification, language, generated_at')
    .eq('match_id', matchId)
    .maybeSingle()

  const home = Array.isArray(match.home_team) ? match.home_team[0] : match.home_team
  const away = Array.isArray(match.away_team) ? match.away_team[0] : match.away_team
  const competition = Array.isArray(match.competition) ? match.competition[0] : match.competition

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Match summary header */}
      <div className="bg-primary text-white p-6 md:p-8 relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
        <Link href={`/${locale}/partits/${matchId}`} className="eyebrow-light hover:text-accent transition-colors">
          ← TORNAR AL PARTIT
        </Link>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="eyebrow-light mb-2">
              {competition?.name} · {competition?.group_name} · J{match.matchday}
            </div>
            <div className="font-display font-black text-2xl md:text-4xl uppercase tracking-tight">
              {home?.team_name}
              <span className="text-accent mx-3">
                {match.home_score}-{match.away_score}
              </span>
              {away?.team_name}
            </div>
          </div>
        </div>
      </div>

      {/* Chronicle content or generate button */}
      {chronicle && chronicle.body ? (
        <ChronicleView
          matchId={matchId}
          headline={chronicle.headline}
          body={chronicle.body}
          mvpPlayer={chronicle.mvp_player}
          mvpJustification={chronicle.mvp_justification}
          socialSummary={chronicle.social_summary}
          generatedAt={chronicle.generated_at}
        />
      ) : (
        <div className="card text-center py-16">
          <div className="eyebrow mb-3">🤖 CRÒNICA IA</div>
          <h2 className="font-display font-black text-3xl uppercase mb-4">
            Encara no s&apos;ha generat la crònica
          </h2>
          <p className="font-sans text-ink2 max-w-md mx-auto mb-8">
            Claude IA analitzarà el partit i generarà una crònica editorial completa amb MVP i resum
            per xarxes socials.
          </p>
          <GenerateChronicleButton matchId={matchId} />
        </div>
      )}
    </div>
  )
}
