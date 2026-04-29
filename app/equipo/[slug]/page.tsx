import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { COMPETITIONS, teamToSlug } from '../../../lib/competitions'

export const revalidate = 3600

/* ── Known teams map ────────────────────────────────────────────── */
const KNOWN_TEAMS: Record<string, string> = {
  'atletico-de-madrid': 'Atlético de Madrid',
  'real-madrid': 'Real Madrid',
  'fc-barcelona': 'FC Barcelona',
  'athletic-club': 'Athletic Club',
  'real-sociedad': 'Real Sociedad',
  'villarreal': 'Villarreal CF',
  'real-betis': 'Real Betis',
  'manchester-city': 'Manchester City',
  'manchester-united': 'Manchester United',
  'liverpool': 'Liverpool',
  'arsenal': 'Arsenal',
  'chelsea': 'Chelsea',
  'tottenham-hotspur': 'Tottenham Hotspur',
  'paris-saint-germain': 'Paris Saint-Germain',
  'inter-milan': 'Inter Milán',
  'fc-barcelona-2': 'FC Barcelona',
  'fc-bayern-munchen': 'FC Bayern München',
  'borussia-dortmund': 'Borussia Dortmund',
  'juventus': 'Juventus',
  'ac-milan': 'AC Milán',
  'as-roma': 'AS Roma',
  'crystal-palace': 'Crystal Palace',
  'sevilla': 'Sevilla FC',
  'valencia': 'Valencia CF',
  'osasuna': 'CA Osasuna',
  'celta-vigo': 'RC Celta',
  'getafe': 'Getafe CF',
  'girona': 'Girona FC',
  'rayo-vallecano': 'Rayo Vallecano',
  'cadiz': 'Cádiz CF',
  'espanyol': 'RCD Espanyol',
  'mallorca': 'RCD Mallorca',
  'alaves': 'Deportivo Alavés',
  'las-palmas': 'UD Las Palmas',
  'leicester-city': 'Leicester City',
  'newcastle-united': 'Newcastle United',
  'west-ham-united': 'West Ham United',
  'aston-villa': 'Aston Villa',
  'brighton': 'Brighton & Hove Albion',
  'bayer-leverkusen': 'Bayer Leverkusen',
  'rb-leipzig': 'RB Leipzig',
  'eintracht-frankfurt': 'Eintracht Frankfurt',
  'napoli': 'SSC Nápoli',
  'lazio': 'SS Lazio',
  'atalanta': 'Atalanta BC',
  'lyon': 'Olympique de Lyon',
  'marseille': 'Olympique de Marseille',
  'ajax': 'Ajax',
  'porto': 'FC Porto',
  'benfica': 'SL Benfica',
  'sporting-cp': 'Sporting CP',
}

/* ── Slug to display name ───────────────────────────────────────── */
function slugToTeamName(slug: string): string {
  if (KNOWN_TEAMS[slug]) return KNOWN_TEAMS[slug]
  // Fallback: convert slug to title case
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/* ── Types ─────────────────────────────────────────────────────── */
interface MatchInfo {
  id: string
  date: string
  time: string
  home: string
  away: string
  homeSlug: string
  awaySlug: string
  competition: string
  status: 'pre' | 'in' | 'post'
  homeScore?: number
  awayScore?: number
  startDate: string
}

/* ── Data fetching ──────────────────────────────────────────────── */
function normalizeTeamName(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

async function fetchMatchesForTeam(teamSlug: string): Promise<MatchInfo[]> {
  const teamName = slugToTeamName(teamSlug)
  const normalizedTarget = normalizeTeamName(teamName)

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0].replace(/-/g, '')
  })

  const matches: MatchInfo[] = []

  await Promise.allSettled(
    COMPETITIONS.flatMap(comp =>
      dates.map(async (dateStr) => {
        try {
          const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${comp.espnId}/scoreboard?dates=${dateStr}`
          const res = await fetch(url, { next: { revalidate: 3600 } })
          if (!res.ok) return
          const data = await res.json()
          const events: unknown[] = data?.events ?? []

          for (const event of events) {
            const ev = event as Record<string, unknown>
            const comp0 = (ev.competitions as Record<string, unknown>[])?.[0]
            if (!comp0) continue

            const competitors = (comp0.competitors as Record<string, unknown>[]) ?? []
            const homeComp = competitors.find((c: Record<string, unknown>) => c.homeAway === 'home')
            const awayComp = competitors.find((c: Record<string, unknown>) => c.homeAway === 'away')
            if (!homeComp || !awayComp) continue

            const homeTeam = homeComp.team as Record<string, unknown>
            const awayTeam = awayComp.team as Record<string, unknown>

            const homeName = (homeTeam.displayName ?? homeTeam.name ?? '') as string
            const awayName = (awayTeam.displayName ?? awayTeam.name ?? '') as string

            const normalizedHome = normalizeTeamName(homeName)
            const normalizedAway = normalizeTeamName(awayName)

            // Fuzzy match: check if normalized target matches home or away
            const isMatch =
              normalizedHome.includes(normalizedTarget) ||
              normalizedAway.includes(normalizedTarget) ||
              normalizedTarget.includes(normalizedHome) ||
              normalizedTarget.includes(normalizedAway) ||
              // Also check slug match
              teamToSlug(homeName) === teamSlug ||
              teamToSlug(awayName) === teamSlug

            if (!isMatch) continue

            const startDateIso = ev.date as string
            const startDate = new Date(startDateIso)

            const madridDate = new Intl.DateTimeFormat('es-ES', {
              timeZone: 'Europe/Madrid',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).format(startDate)
            const [dd, mm, yyyy] = madridDate.split('/')
            const dateKey = `${yyyy}-${mm}-${dd}`

            const timeStr = startDate.toLocaleTimeString('es-ES', {
              timeZone: 'Europe/Madrid',
              hour: '2-digit',
              minute: '2-digit',
            })

            const statusType = ((ev.status as Record<string, unknown>)?.type as Record<string, unknown>)?.name as string ?? ''
            let status: 'pre' | 'in' | 'post' = 'pre'
            if (statusType.toLowerCase().includes('in')) status = 'in'
            else if (statusType.toLowerCase().includes('post') || statusType.toLowerCase().includes('final')) status = 'post'

            const homeScore = homeComp.score !== undefined ? Number(homeComp.score) : undefined
            const awayScore = awayComp.score !== undefined ? Number(awayComp.score) : undefined

            matches.push({
              id: `${comp.espnId}-${ev.id as string}`,
              date: dateKey,
              time: timeStr,
              home: homeName,
              away: awayName,
              homeSlug: teamToSlug(homeName),
              awaySlug: teamToSlug(awayName),
              competition: comp.name,
              status,
              homeScore: (status === 'in' || status === 'post') ? homeScore : undefined,
              awayScore: (status === 'in' || status === 'post') ? awayScore : undefined,
              startDate: startDateIso,
            })
          }
        } catch {
          // silently skip
        }
      })
    )
  )

  // Deduplicate by id
  const seen = new Set<string>()
  const unique = matches.filter(m => {
    if (seen.has(m.id)) return false
    seen.add(m.id)
    return true
  })

  unique.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  return unique
}

/* ── Helpers ────────────────────────────────────────────────────── */
function formatDateHeading(dateKey: string): string {
  const [yyyy, mm, dd] = dateKey.split('-')
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function groupByDate(matches: MatchInfo[]): Map<string, MatchInfo[]> {
  const map = new Map<string, MatchInfo[]>()
  for (const m of matches) {
    const list = map.get(m.date) ?? []
    list.push(m)
    map.set(m.date, list)
  }
  return map
}

/* ── Metadata ───────────────────────────────────────────────────── */
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const teamName = slugToTeamName(params.slug)
  return {
    title: `${teamName} en TV | Próximos partidos, horarios y canales`,
    description: `Todos los partidos del ${teamName} en televisión. Horarios, canales y próximos encuentros.`,
    alternates: {
      canonical: `https://musing-snyder.vercel.app/equipo/${params.slug}`,
    },
    openGraph: {
      title: `${teamName} en TV | Próximos partidos`,
      description: `Partidos del ${teamName} en TV: horarios y canales.`,
      url: `https://musing-snyder.vercel.app/equipo/${params.slug}`,
      siteName: 'Fútbol en la TV',
      locale: 'es_ES',
      type: 'website',
    },
  }
}

/* ── Styles ─────────────────────────────────────────────────────── */
const S = {
  page: {
    background: '#0d0d0d',
    color: '#eee',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    minHeight: '100vh',
    margin: 0,
    padding: 0,
  } as React.CSSProperties,
  header: {
    background: '#111',
    borderBottom: '1px solid #222',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap' as const,
    gap: '8px',
  } as React.CSSProperties,
  logo: {
    color: '#E30613',
    fontSize: '20px',
    fontWeight: 700,
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  } as React.CSSProperties,
  mainLink: {
    color: '#E30613',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  } as React.CSSProperties,
  container: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '24px 16px 48px',
  } as React.CSSProperties,
  h1: {
    fontSize: '28px',
    fontWeight: 700,
    margin: '0 0 8px',
    color: '#fff',
  } as React.CSSProperties,
  subtitle: {
    color: '#888',
    fontSize: '14px',
    margin: '0 0 32px',
  } as React.CSSProperties,
  h2: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#E30613',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '28px 0 10px',
    paddingBottom: '6px',
    borderBottom: '1px solid #222',
  } as React.CSSProperties,
  card: {
    background: '#111',
    border: '1px solid #222',
    borderRadius: '6px',
    padding: '12px 16px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,
  time: {
    color: '#888',
    fontSize: '13px',
    minWidth: '44px',
    flexShrink: 0,
  } as React.CSSProperties,
  compBadge: {
    color: '#555',
    fontSize: '12px',
    minWidth: '100px',
    flexShrink: 0,
  } as React.CSSProperties,
  teams: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  teamLink: {
    color: '#eee',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 500,
  } as React.CSSProperties,
  teamLinkHighlight: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 700,
  } as React.CSSProperties,
  vs: {
    color: '#555',
    fontSize: '13px',
  } as React.CSSProperties,
  score: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 700,
    minWidth: '60px',
    textAlign: 'center' as const,
    flexShrink: 0,
  } as React.CSSProperties,
  scoreDash: {
    color: '#555',
    fontSize: '13px',
    minWidth: '60px',
    textAlign: 'center' as const,
    flexShrink: 0,
  } as React.CSSProperties,
  liveTag: {
    background: '#E30613',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '3px',
    letterSpacing: '0.5px',
    flexShrink: 0,
  } as React.CSSProperties,
  emptyMsg: {
    color: '#555',
    fontSize: '15px',
    padding: '20px 0',
  } as React.CSSProperties,
  footer: {
    borderTop: '1px solid #222',
    padding: '20px 16px',
    textAlign: 'center' as const,
    marginTop: '32px',
  } as React.CSSProperties,
}

/* ── Page ───────────────────────────────────────────────────────── */
export default async function EquipoPage({ params }: { params: { slug: string } }) {
  const teamName = slugToTeamName(params.slug)
  const matches = await fetchMatchesForTeam(params.slug)

  if (matches.length === 0) notFound()

  const grouped = groupByDate(matches)

  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <a href="/" style={S.logo}>MD Fútbol TV</a>
        <a href="/" style={S.mainLink}>Ver en directo con canales de TV →</a>
      </header>

      {/* Main content */}
      <main style={S.container}>
        <h1 style={S.h1}>{teamName}</h1>
        <p style={S.subtitle}>
          Próximos partidos · Horario peninsular
        </p>

        {Array.from(grouped.entries()).map(([dateKey, dayMatches]) => (
          <section key={dateKey}>
            <h2 style={S.h2}>{formatDateHeading(dateKey)}</h2>
            {dayMatches.map(match => (
              <article key={match.id} style={S.card}>
                <span style={S.time}>{match.time}</span>
                <span style={S.compBadge}>{match.competition}</span>
                <div style={S.teams}>
                  <a
                    href={`/equipo/${match.homeSlug}`}
                    style={match.homeSlug === params.slug ? S.teamLinkHighlight : S.teamLink}
                  >
                    {match.home}
                  </a>
                  <span style={S.vs}>vs</span>
                  <a
                    href={`/equipo/${match.awaySlug}`}
                    style={match.awaySlug === params.slug ? S.teamLinkHighlight : S.teamLink}
                  >
                    {match.away}
                  </a>
                </div>
                {match.status === 'in' && (
                  <span style={S.liveTag}>EN DIRECTO</span>
                )}
                {(match.status === 'in' || match.status === 'post') &&
                  match.homeScore !== undefined && match.awayScore !== undefined ? (
                  <span style={S.score}>{match.homeScore} - {match.awayScore}</span>
                ) : (
                  <span style={S.scoreDash}>-</span>
                )}
              </article>
            ))}
          </section>
        ))}

        <footer style={S.footer}>
          <a href="/" style={S.mainLink}>
            ← Ver todos los partidos con canales de TV en directo
          </a>
        </footer>
      </main>
    </div>
  )
}
