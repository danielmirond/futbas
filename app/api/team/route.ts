import { NextResponse } from 'next/server'

const LEAGUE_MAP: Record<string, string> = {
  'esp.1': 'LaLiga EA Sports', 'esp.2': 'LaLiga Hypermotion', 'eng.1': 'Premier League',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') || ''
  const league = searchParams.get('league') || 'esp.1'

  if (!name) return NextResponse.json({ error: 'name required' })

  try {
    // Get teams list
    const teamsRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
    )
    if (!teamsRes.ok) return NextResponse.json({ error: 'Teams fetch failed' })

    const teamsData = await teamsRes.json()
    const allTeams = teamsData?.sports?.[0]?.leagues?.[0]?.teams || []

    // Find team
    const normalize = (s: string) => s.toLowerCase().replace(/[.\-']/g, '').replace(/\s+/g, ' ').trim()
    const n = normalize(name)
    const nFirst = n.split(' ')[0]

    const found = allTeams.find((t: Record<string, unknown>) => {
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

    if (!found) return NextResponse.json({ error: `Team not found: ${name}` })

    const team = found.team as Record<string, unknown>
    const teamId = String(team.id || '')
    const displayName = String(team.displayName || '')
    const shortName = String(team.shortDisplayName || '')
    const logo = String(team.logo || '')

    // Get schedule
    const schedRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${teamId}/schedule`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) }
    )

    type MatchResult = { d: string; h: string; sh: number; sa: number; a: string; win: boolean | null }
    const lastMatches: MatchResult[] = []

    if (schedRes.ok) {
      const schedData = await schedRes.json()
      const events = schedData?.events || []

      for (const ev of events) {
        const c = (ev.competitions as Record<string, unknown>[])?.[0]
        if (!c) continue
        const state = String(((c.status as Record<string, unknown>)?.type as Record<string, unknown>)?.state || '')
        if (state !== 'post') continue

        const competitors = (c.competitors as Record<string, unknown>[]) || []
        if (competitors.length < 2) continue

        const homeComp = competitors.find((t: Record<string, unknown>) => t.homeAway === 'home') || competitors[0]
        const awayComp = competitors.find((t: Record<string, unknown>) => t.homeAway === 'away') || competitors[1]

        const hTeam = homeComp.team as Record<string, unknown>
        const aTeam = awayComp.team as Record<string, unknown>
        const hName = String(hTeam?.shortDisplayName || hTeam?.displayName || '')
        const aName = String(aTeam?.shortDisplayName || aTeam?.displayName || '')

        const hScore = homeComp.score
        const aScore = awayComp.score
        const sh = typeof hScore === 'object' ? Number((hScore as Record<string, unknown>)?.displayValue || 0) : Number(hScore || 0)
        const sa = typeof aScore === 'object' ? Number((aScore as Record<string, unknown>)?.displayValue || 0) : Number(aScore || 0)

        const dateStr = String(c.date || '').slice(0, 10)
        const dayStr = new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
          timeZone: 'Europe/Madrid', day: 'numeric', month: 'short'
        })

        // Determine if this team won
        const isHome = String(hTeam?.id || '') === teamId
        const teamScore = isHome ? sh : sa
        const oppScore = isHome ? sa : sh
        const win = teamScore > oppScore ? true : teamScore < oppScore ? false : null

        lastMatches.push({ d: dayStr, h: hName, sh, sa, a: aName, win })
      }
    }

    // Most recent first, limit to 5
    lastMatches.reverse()
    const last5 = lastMatches.slice(0, 5)
    const form = last5.map(m => m.win === true ? 'W' : m.win === false ? 'L' : 'D')

    return NextResponse.json({
      name: displayName,
      shortName,
      logo,
      league: LEAGUE_MAP[league] || league,
      last5,
      form,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) })
  }
}
