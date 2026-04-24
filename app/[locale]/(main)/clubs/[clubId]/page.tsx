import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { KitSvg } from '@/components/club/kit-svg'
import { FavoriteButton } from '@/components/favorites/favorite-button'

interface PageProps {
  params: { clubId: string; locale: string }
}

const PALETTE = [
  { p: '#000000', s: '#FFD100' },
  { p: '#FFD100', s: '#000000' },
  { p: '#E30613', s: '#FFFFFF' },
  { p: '#FFFFFF', s: '#E30613' },
]

function hashColors(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

export default async function ClubDetailPage({ params: { clubId, locale } }: PageProps) {
  const supabase = createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select('id, name, fcf_code, delegation, municipality, stadium_name, founded_year, primary_color, secondary_color')
    .eq('id', clubId)
    .maybeSingle()

  if (!club) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <div className="eyebrow mb-2">404</div>
          <h1 className="font-display font-black text-3xl uppercase mb-4">Club no trobat</h1>
          <Link href={`/${locale}/clubs`} className="btn-ghost inline-block">← Tornar als clubs</Link>
        </div>
      </div>
    )
  }

  // Get teams for this club (across competitions)
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      id, team_name, position, points, played, won, drawn, lost, goals_for, goals_against, form,
      competition:competition_id(id, name, group_name)
    `)
    .eq('club_id', clubId)
    .order('points', { ascending: false })

  // Get recent matches for this club's teams
  const teamIds = (teams || []).map((t: any) => t.id)
  const { data: recentMatches } = teamIds.length > 0
    ? await supabase
        .from('matches')
        .select(`
          id, matchday, home_score, away_score, status,
          home_team:home_team_id(id, team_name, club_id),
          away_team:away_team_id(id, team_name, club_id)
        `)
        .or(`home_team_id.in.(${teamIds.join(',')}),away_team_id.in.(${teamIds.join(',')})`)
        .order('matchday', { ascending: false })
        .limit(5)
    : { data: [] as any[] }

  const colors = club.primary_color
    ? { p: club.primary_color, s: club.secondary_color || '#FFFFFF' }
    : hashColors(club.name)

  const topTeam = (teams || [])[0]

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="hero p-6 md:p-10">
        <div className="hero-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="eyebrow-light mb-3">
                {club.delegation || 'FCF'}
                {club.municipality ? ` · ${club.municipality}` : ''}
                {club.founded_year ? ` · FUNDACIÓ ${club.founded_year}` : ''}
              </div>
              <h1 className="font-display font-black text-3xl md:text-5xl lg:text-6xl text-white uppercase tracking-tighter leading-[0.9]">
                {club.name}
              </h1>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <a
                href={`/api/calendar/${club.id}`}
                download
                title="Exportar calendari (iCal)"
                className="font-mono text-[10px] uppercase tracking-wider px-3 py-2 border border-white/30 text-white hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
              >
                📅 CALENDARI
              </a>
              <FavoriteButton clubId={club.id} className="bg-white/10 p-2" />
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <KitSvg primaryColor={colors.p} secondaryColor={colors.s} />
            {topTeam && (
              <div className="flex-1 grid grid-cols-4 gap-4 min-w-[240px]">
                <div>
                  <div className="font-display font-black text-3xl text-neon">{topTeam.position || '-'}r</div>
                  <div className="eyebrow-light mt-1">POSICIÓ</div>
                </div>
                <div>
                  <div className="font-display font-black text-3xl text-white">{topTeam.points}</div>
                  <div className="eyebrow-light mt-1">PUNTS</div>
                </div>
                <div>
                  <div className="font-display font-black text-3xl text-white">{topTeam.won}</div>
                  <div className="eyebrow-light mt-1">VICTÒRIES</div>
                </div>
                <div>
                  <div className="font-display font-black text-3xl text-white">
                    {(topTeam.goals_for || 0) - (topTeam.goals_against || 0) >= 0 ? '+' : ''}
                    {(topTeam.goals_for || 0) - (topTeam.goals_against || 0)}
                  </div>
                  <div className="eyebrow-light mt-1">DIF. GOLS</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-[1px] bg-border">
        <Link
          href={`/${locale}/botiga/${clubId}`}
          className="bg-card p-4 text-center hover:bg-surface transition-colors"
        >
          <div className="text-2xl mb-1">🛒</div>
          <div className="eyebrow">BOTIGA</div>
        </Link>
        <a
          href={`/api/calendar/${clubId}`}
          download
          className="bg-card p-4 text-center hover:bg-surface transition-colors"
        >
          <div className="text-2xl mb-1">📅</div>
          <div className="eyebrow">CALENDARI</div>
        </a>
        <Link
          href={`/${locale}/admin/${clubId}`}
          className="bg-card p-4 text-center hover:bg-surface transition-colors"
        >
          <div className="text-2xl mb-1">🔐</div>
          <div className="eyebrow">ADMIN</div>
        </Link>
      </div>

      {/* Teams in competitions */}
      {teams && teams.length > 0 && (
        <section className="bg-card border border-border">
          <div className="section-head">EQUIPS · {teams.length}</div>
          <div className="divide-y divide-border">
            {teams.map((t: any) => {
              const comp = Array.isArray(t.competition) ? t.competition[0] : t.competition
              return (
                <div key={t.id} className="p-4 flex items-center gap-4">
                  <div className="font-display font-black text-2xl text-neon tabular-nums w-10 text-right">
                    {t.position || '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold uppercase text-sm tracking-tight truncate">
                      {t.team_name}
                    </div>
                    <div className="font-mono text-[10px] text-ink3 uppercase tracking-wider mt-0.5">
                      {comp?.name || ''} {comp?.group_name ? `· ${comp.group_name}` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-black text-xl tabular-nums">{t.points}</div>
                    <div className="font-mono text-[9px] text-ink3 uppercase">{t.played}J</div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Recent matches */}
      {recentMatches && recentMatches.length > 0 && (
        <section className="bg-card border border-border">
          <div className="section-head">ÚLTIMS PARTITS</div>
          <div className="divide-y divide-border">
            {recentMatches.map((m: any) => {
              const home = Array.isArray(m.home_team) ? m.home_team[0] : m.home_team
              const away = Array.isArray(m.away_team) ? m.away_team[0] : m.away_team
              const isHome = home?.club_id === clubId
              return (
                <Link
                  key={m.id}
                  href={`/${locale}/partits/${m.id}`}
                  className="block p-4 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-[10px] text-ink3 uppercase w-12">J{m.matchday}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${isHome ? 'font-bold' : ''}`}>
                        {home?.team_name}
                      </div>
                      <div className={`text-sm truncate ${!isHome ? 'font-bold' : ''}`}>
                        {away?.team_name}
                      </div>
                    </div>
                    <div className="font-display font-black text-2xl tabular-nums">
                      {m.home_score ?? '-'}<span className="text-accent mx-1">-</span>{m.away_score ?? '-'}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
