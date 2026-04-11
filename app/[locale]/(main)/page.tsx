import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: { locale: string }
}

export default async function HomePage({ params: { locale } }: PageProps) {
  const t = await getTranslations('home')
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch favorite club IDs if logged in
  let favoriteClubIds: string[] = []
  if (user) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('club_id')
      .eq('user_id', user.id)
      .eq('favorite_type', 'club')
    favoriteClubIds = (favs || []).map((f: any) => f.club_id).filter(Boolean)
  }

  // Fetch recent matches (prefer favorites if any)
  let recentMatchesQuery = supabase
    .from('matches')
    .select(`
      id, matchday, home_score, away_score, status, matchday,
      home_team:home_team_id(id, team_name, club_id),
      away_team:away_team_id(id, team_name, club_id),
      competition:competition_id(name, group_name)
    `)
    .eq('status', 'finished')
    .order('matchday', { ascending: false })
    .limit(6)

  const { data: recentMatches } = await recentMatchesQuery

  // Fetch latest published chronicles
  const { data: chronicles } = await supabase
    .from('chronicles')
    .select(`
      id, headline, social_summary, mvp_player, generated_at, match_id,
      matches:match_id(
        home_score, away_score, matchday,
        home_team:home_team_id(team_name),
        away_team:away_team_id(team_name),
        competition:competition_id(name)
      )
    `)
    .eq('status', 'published')
    .order('generated_at', { ascending: false })
    .limit(3)

  // Fetch leading teams from favorite clubs or top teams overall
  let leadingTeamsQuery = supabase
    .from('teams')
    .select(`
      id, team_name, position, points, played, won, drawn, lost,
      goals_for, goals_against, form, club_id,
      competition:competition_id(name, group_name)
    `)
    .order('points', { ascending: false })
    .limit(5)

  if (favoriteClubIds.length > 0) {
    leadingTeamsQuery = leadingTeamsQuery.in('club_id', favoriteClubIds)
  }

  const { data: leadingTeams } = await leadingTeamsQuery

  // Count total clubs for stat card
  const { count: clubsCount } = await supabase
    .from('clubs')
    .select('*', { count: 'exact', head: true })

  const { count: matchesCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })

  const { count: chroniclesCount } = await supabase
    .from('chronicles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="hero p-6 md:p-12 relative overflow-hidden">
        <div className="hero-glow" />
        <div
          className="absolute -right-10 bottom-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,255,133,.08), transparent 65%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />

        <div className="relative z-10">
          <div className="eyebrow-light mb-4">
            {user ? `⚡ BENVINGUT ${(user.user_metadata?.full_name || user.email?.split('@')[0] || '').toUpperCase()}` : '⚡ FUTBOL AMATEUR CATALÀ · TEMPS REAL'}
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl lg:text-mega text-white uppercase tracking-tighter leading-[0.85]">
            FUT<span className="text-accent">BAS</span>
          </h1>
          <p className="font-sans text-white/70 mt-6 max-w-lg text-base md:text-lg">
            Classificacions, resultats i cròniques del futbol amateur català. Tot en un lloc, en temps real.
          </p>

          {!user && (
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link href={`/${locale}/signup`} className="btn-primary">
                REGISTRAR-SE
              </Link>
              <Link
                href={`/${locale}/login`}
                className="font-display font-black uppercase tracking-wider px-4 py-2.5 text-sm border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                INICIAR SESSIÓ
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-3 gap-[1px] bg-border">
        <div className="bg-card p-6 text-center">
          <div className="font-display font-black text-4xl md:text-5xl text-accent tabular-nums">
            {clubsCount || 0}
          </div>
          <div className="eyebrow mt-2">CLUBS</div>
        </div>
        <div className="bg-card p-6 text-center">
          <div className="font-display font-black text-4xl md:text-5xl text-accent tabular-nums">
            {matchesCount || 0}
          </div>
          <div className="eyebrow mt-2">PARTITS</div>
        </div>
        <div className="bg-card p-6 text-center">
          <div className="font-display font-black text-4xl md:text-5xl text-accent tabular-nums">
            {chroniclesCount || 0}
          </div>
          <div className="eyebrow mt-2">CRÒNIQUES IA</div>
        </div>
      </section>

      {/* Favorites section or Recent results */}
      {user && favoriteClubIds.length > 0 && leadingTeams && leadingTeams.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight">
              ⭐ ELS TEUS EQUIPS
            </h2>
            <Link
              href={`/${locale}/perfil`}
              className="font-mono text-[10px] uppercase tracking-wider text-accent hover:underline"
            >
              GESTIONAR FAVORITS →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadingTeams.map((team: any) => {
              const comp = Array.isArray(team.competition) ? team.competition[0] : team.competition
              const gd = (team.goals_for || 0) - (team.goals_against || 0)
              return (
                <Link
                  key={team.id}
                  href={`/${locale}/clubs/${team.club_id}`}
                  className="card card-hover block"
                >
                  <div className="eyebrow mb-2 truncate">
                    {comp?.name} · {comp?.group_name}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-display font-black text-4xl text-neon tabular-nums">
                      {team.position || '-'}r
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-black uppercase text-sm tracking-tight truncate">
                        {team.team_name}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-ink3 mt-1">
                        {team.won}V · {team.drawn}E · {team.lost}D · {gd >= 0 ? '+' : ''}{gd} DG
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-black text-3xl tabular-nums">{team.points}</div>
                      <div className="eyebrow">PTS</div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Latest chronicles */}
      {chronicles && chronicles.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight">
              📰 ÚLTIMES CRÒNIQUES
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chronicles.map((chr: any) => {
              const match = Array.isArray(chr.matches) ? chr.matches[0] : chr.matches
              const home = match?.home_team && (Array.isArray(match.home_team) ? match.home_team[0] : match.home_team)
              const away = match?.away_team && (Array.isArray(match.away_team) ? match.away_team[0] : match.away_team)
              return (
                <Link
                  key={chr.id}
                  href={`/${locale}/cronica/${chr.match_id}`}
                  className="card card-hover block"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="pill pill-red">🤖 IA</span>
                    <span className="eyebrow truncate">J{match?.matchday}</span>
                  </div>
                  {match && (
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink3 mb-3 truncate">
                      {home?.team_name} {match.home_score}-{match.away_score} {away?.team_name}
                    </div>
                  )}
                  <h3 className="font-display font-black uppercase text-lg leading-tight tracking-tight line-clamp-3">
                    {chr.headline}
                  </h3>
                  {chr.mvp_player && (
                    <div className="mt-3 eyebrow text-accent">🏆 MVP: {chr.mvp_player}</div>
                  )}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Recent matches */}
      {recentMatches && recentMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-black text-2xl md:text-3xl uppercase tracking-tight">
              ⚽ ÚLTIMS RESULTATS
            </h2>
            <Link
              href={`/${locale}/partits`}
              className="font-mono text-[10px] uppercase tracking-wider text-accent hover:underline"
            >
              VEURE TOTS →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentMatches.map((m: any) => {
              const home = Array.isArray(m.home_team) ? m.home_team[0] : m.home_team
              const away = Array.isArray(m.away_team) ? m.away_team[0] : m.away_team
              const comp = Array.isArray(m.competition) ? m.competition[0] : m.competition
              return (
                <Link key={m.id} href={`/${locale}/partits/${m.id}`} className="card card-hover block">
                  <div className="eyebrow mb-2 truncate">
                    {comp?.name} · {comp?.group_name} · J{m.matchday}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 text-right font-display font-bold uppercase text-sm truncate">
                      {home?.team_name}
                    </div>
                    <div className="score font-black text-2xl tabular-nums flex-shrink-0">
                      {m.home_score}
                      <span className="score-dash mx-1">-</span>
                      {m.away_score}
                    </div>
                    <div className="flex-1 text-left font-display font-bold uppercase text-sm truncate">
                      {away?.team_name}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Quick actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border">
        <Link href={`/${locale}/classificacio`} className="bg-card p-6 text-center hover:bg-surface transition-colors">
          <div className="text-3xl mb-2">🏆</div>
          <div className="eyebrow">{t('standings')}</div>
        </Link>
        <Link href={`/${locale}/partits`} className="bg-card p-6 text-center hover:bg-surface transition-colors">
          <div className="text-3xl mb-2">⚽</div>
          <div className="eyebrow">{t('todayMatches')}</div>
        </Link>
        <Link href={`/${locale}/clubs`} className="bg-card p-6 text-center hover:bg-surface transition-colors">
          <div className="text-3xl mb-2">🛡</div>
          <div className="eyebrow">CLUBS</div>
        </Link>
        <Link href={`/${locale}/perfil`} className="bg-card p-6 text-center hover:bg-surface transition-colors">
          <div className="text-3xl mb-2">👤</div>
          <div className="eyebrow">PERFIL</div>
        </Link>
      </section>
    </div>
  )
}
