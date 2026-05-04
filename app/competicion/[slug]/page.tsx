import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { COMPETITIONS, getCompBySlug, teamToSlug } from '../../../lib/competitions'

export const revalidate = 3600

/* ── Types ─────────────────────────────────────────────────────── */
interface MatchInfo {
  id: string
  date: string        // YYYY-MM-DD in Madrid time
  time: string        // HH:MM in Madrid time
  home: string
  away: string
  status: 'pre' | 'in' | 'post'
  homeScore?: number
  awayScore?: number
  startDate: string   // ISO string for JSON-LD
}

/* ── Static params ──────────────────────────────────────────────── */
export function generateStaticParams() {
  return COMPETITIONS.map(c => ({ slug: c.slug }))
}

/* ── Metadata ───────────────────────────────────────────────────── */
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const comp = getCompBySlug(params.slug)
  if (!comp) return {}
  return {
    title: `${comp.name} en TV | Partidos, horarios y canales`,
    description: `Todos los partidos de ${comp.name} en televisión. Horarios, canales y resultados actualizados.`,
    alternates: {
      canonical: `https://musing-snyder.vercel.app/competicion/${comp.slug}`,
    },
    openGraph: {
      title: `${comp.name} en TV | Partidos, horarios y canales`,
      description: `Todos los partidos de ${comp.name} en televisión. Horarios, canales y resultados actualizados.`,
      url: `https://musing-snyder.vercel.app/competicion/${comp.slug}`,
      siteName: 'Fútbol en la TV',
      locale: 'es_ES',
      type: 'website',
    },
  }
}

/* ── Data fetching ──────────────────────────────────────────────── */
async function fetchMatchesForCompetition(espnId: string): Promise<MatchInfo[]> {
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0].replace(/-/g, '')
  })

  const matches: MatchInfo[] = []

  await Promise.allSettled(
    dates.map(async (dateStr) => {
      try {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${espnId}/scoreboard?dates=${dateStr}`
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
            id: ev.id as string,
            date: dateKey,
            time: timeStr,
            home: homeTeam.displayName as string ?? homeTeam.name as string ?? 'Local',
            away: awayTeam.displayName as string ?? awayTeam.name as string ?? 'Visitante',
            status,
            homeScore: (status === 'in' || status === 'post') ? homeScore : undefined,
            awayScore: (status === 'in' || status === 'post') ? awayScore : undefined,
            startDate: startDateIso,
          })
        }
      } catch {
        // silently skip failed requests
      }
    })
  )

  // Sort by date then time
  matches.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  return matches
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
export default async function CompeticionPage({ params }: { params: { slug: string } }) {
  const comp = getCompBySlug(params.slug)
  if (!comp) notFound()

  const matches = await fetchMatchesForCompetition(comp.espnId)
  const grouped = groupByDate(matches)
  const upcomingMatches = matches.filter(m => m.status === 'pre')

  // JSON-LD for upcoming matches
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': upcomingMatches.slice(0, 20).map(m => ({
      '@type': 'SportsEvent',
      name: `${m.home} vs ${m.away}`,
      startDate: m.startDate,
      sport: 'Soccer',
      location: { '@type': 'Place', name: comp.name },
      homeTeam: { '@type': 'SportsTeam', name: m.home },
      awayTeam: { '@type': 'SportsTeam', name: m.away },
      superEvent: { '@type': 'SportsOrganization', name: comp.name },
    })),
  }

  return (
    <div style={S.page}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header style={S.header}>
        <a href="/" style={S.logo}>MD Fútbol TV</a>
        <a href="/" style={S.mainLink}>Ver en directo con canales de TV →</a>
      </header>

      {/* Main content */}
      <main style={S.container}>
        <h1 style={S.h1}>{comp.name}</h1>
        <p style={S.subtitle}>
          {comp.country} · Partidos de los próximos 14 días · Horario peninsular
        </p>

        {grouped.size === 0 && (
          <p style={S.emptyMsg}>No hay partidos programados en los próximos 14 días.</p>
        )}

        {Array.from(grouped.entries()).map(([dateKey, dayMatches]) => (
          <section key={dateKey}>
            <h2 style={S.h2}>{formatDateHeading(dateKey)}</h2>
            {dayMatches.map(match => (
              <article key={match.id} style={S.card}>
                <span style={S.time}>{match.time}</span>
                <div style={S.teams}>
                  <a
                    href={`/equipo/${teamToSlug(match.home)}`}
                    style={S.teamLink}
                  >
                    {match.home}
                  </a>
                  <span style={S.vs}>vs</span>
                  <a
                    href={`/equipo/${teamToSlug(match.away)}`}
                    style={S.teamLink}
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
