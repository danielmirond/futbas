import { NextResponse } from 'next/server'

const LEAGUE_IDS = ['esp.1', 'esp.2', 'eng.1', 'uefa.champions', 'uefa.europa']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const home = searchParams.get('home') || ''
  const away = searchParams.get('away') || ''
  const league = searchParams.get('league') || 'esp.1'

  if (!home || !away) {
    return NextResponse.json({ matches: [], error: 'home and away required' })
  }

  try {
    // First get team IDs
    const teamsRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
    )
    if (!teamsRes.ok) return NextResponse.json({ matches: [] })

    const teamsData = await teamsRes.json()
    const allTeams = teamsData?.sports?.[0]?.leagues?.[0]?.teams || []

    // Find team ID (fuzzy match — handles partial names, abbreviations, nicknames)
    const normalize = (s: string) => s.toLowerCase().replace(/[.\-']/g, '').replace(/\s+/g, ' ').trim()
    const findTeamId = (name: string) => {
      const n = normalize(name)
      const nFirst = n.split(' ')[0]
      const team = allTeams.find((t: Record<string, unknown>) => {
        const tm = t.team as Record<string, unknown>
        const dn = normalize(String(tm?.displayName || ''))
        const sn = normalize(String(tm?.shortDisplayName || ''))
        const abbr = normalize(String(tm?.abbreviation || ''))
        const slug = normalize(String(tm?.slug || ''))
        return dn === n || sn === n || dn.includes(n) || n.includes(dn)
          || sn.includes(n) || n.includes(sn) || abbr === n
          || slug.includes(n.replace(/ /g, '_'))
          || (nFirst.length >= 4 && (dn.startsWith(nFirst) || sn.startsWith(nFirst)))
      })
      return (team?.team as Record<string, unknown>)?.id as string | undefined
    }

    const homeId = findTeamId(home)
    if (!homeId) return NextResponse.json({ matches: [], error: `Team not found: ${home}` })

    const awayId = findTeamId(away)
    if (!awayId) return NextResponse.json({ matches: [], error: `Team not found: ${away}` })

    // Get schedule for home team
    const schedRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${homeId}/schedule`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) }
    )
    if (!schedRes.ok) return NextResponse.json({ matches: [] })

    const schedData = await schedRes.json()
    const events = schedData?.events || []

    // Filter for matches against the away team
    const awayLower = away.toLowerCase()
    type H2HMatch = { d: string; h: string; sh: number; sa: number; a: string }
    const h2hMatches: H2HMatch[] = []

    for (const ev of events) {
      const comps = (ev.competitions as Record<string, unknown>[]) || []
      const c = comps[0]
      if (!c) continue

      const status = c.status as Record<string, unknown> | undefined
      const state = String((status?.type as Record<string, unknown>)?.state || '')
      if (state !== 'post') continue

      const competitors = (c.competitors as Record<string, unknown>[]) || []
      if (competitors.length < 2) continue

      const homeComp = competitors.find((t: Record<string, unknown>) => t.homeAway === 'home') || competitors[0]
      const awayComp = competitors.find((t: Record<string, unknown>) => t.homeAway === 'away') || competitors[1]

      const hTeam = homeComp.team as Record<string, unknown>
      const aTeam = awayComp.team as Record<string, unknown>
      const hName = String(hTeam?.shortDisplayName || hTeam?.displayName || '')
      const aName = String(aTeam?.shortDisplayName || aTeam?.displayName || '')

      // Check if the opponent is in this match by team ID
      const hId = String((hTeam?.id as string) || '')
      const aId = String((aTeam?.id as string) || '')
      if (hId !== awayId && aId !== awayId) continue

      const hScore = homeComp.score
      const aScore = awayComp.score
      const sh = typeof hScore === 'object' ? Number((hScore as Record<string, unknown>)?.displayValue || 0) : Number(hScore || 0)
      const sa = typeof aScore === 'object' ? Number((aScore as Record<string, unknown>)?.displayValue || 0) : Number(aScore || 0)

      const dateStr = String(c.date || '').slice(0, 10)
      const dayStr = new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
        timeZone: 'Europe/Madrid', day: 'numeric', month: 'short', year: 'numeric'
      })

      h2hMatches.push({ d: dayStr, h: hName, sh, sa, a: aName })
    }

    // Most recent first, limit to 5
    h2hMatches.reverse()

    return NextResponse.json({ matches: h2hMatches.slice(0, 5), home, away })
  } catch (err) {
    return NextResponse.json({ matches: [], error: String(err) })
  }
}
