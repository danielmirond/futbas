import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const home = searchParams.get('home') || ''
  const away = searchParams.get('away') || ''
  const league = searchParams.get('league') || 'esp.1'

  if (!home || !away) {
    return NextResponse.json({ matches: [], error: 'home and away required' })
  }

  try {
    // Get team list for this league
    const teamsRes = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) }
    )
    if (!teamsRes.ok) return NextResponse.json({ matches: [] })

    const teamsData = await teamsRes.json()
    const allTeams = teamsData?.sports?.[0]?.leagues?.[0]?.teams || []

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
          || (nFirst.length >= 5 && (dn.startsWith(nFirst) || sn.startsWith(nFirst)))
      })
      return (team?.team as Record<string, unknown>)?.id as string | undefined
    }

    const homeId = findTeamId(home)
    if (!homeId) return NextResponse.json({ matches: [], error: `Team not found: ${home}` })
    const awayId = findTeamId(away)
    if (!awayId) return NextResponse.json({ matches: [], error: `Team not found: ${away}` })

    // Fetch last 2 seasons in parallel for better H2H coverage
    // ESPN uses season START year (e.g. 2025 = 2025-26 season, 2024 = 2024-25)
    const currentYear = new Date().getFullYear()
    const seasons = [currentYear - 1, currentYear - 2]

    const allEvents: Record<string, unknown>[] = []
    const schedResults = await Promise.allSettled(
      seasons.map(yr =>
        fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${homeId}/schedule?season=${yr}`,
          { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) }
        ).then(r => r.ok ? r.json() : null)
      )
    )
    for (const r of schedResults) {
      if (r.status === 'fulfilled' && r.value?.events) {
        allEvents.push(...r.value.events)
      }
    }

    type H2HMatch = { d: string; h: string; sh: number; sa: number; a: string; dateRaw: string }
    const h2hMatches: H2HMatch[] = []

    for (const ev of allEvents) {
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
      const hId = String(hTeam?.id || '')
      const aId = String(aTeam?.id || '')

      // Check if both teams are in this match
      const bothPresent =
        (hId === homeId && aId === awayId) ||
        (hId === awayId && aId === homeId)
      if (!bothPresent) continue

      const hScore = homeComp.score
      const aScore = awayComp.score
      const sh = typeof hScore === 'object' ? Number((hScore as Record<string, unknown>)?.displayValue || 0) : Number(hScore || 0)
      const sa = typeof aScore === 'object' ? Number((aScore as Record<string, unknown>)?.displayValue || 0) : Number(aScore || 0)

      const dateRaw = String(c.date || '').slice(0, 10)
      const dayStr = new Date(dateRaw + 'T12:00:00').toLocaleDateString('es-ES', {
        timeZone: 'Europe/Madrid', day: 'numeric', month: 'short', year: 'numeric'
      })

      h2hMatches.push({
        d: dayStr,
        h: String(hTeam?.shortDisplayName || hTeam?.displayName || ''),
        sh, sa,
        a: String(aTeam?.shortDisplayName || aTeam?.displayName || ''),
        dateRaw,
      })
    }

    // Sort newest first, deduplicate by date, take 5
    h2hMatches.sort((a, b) => b.dateRaw.localeCompare(a.dateRaw))
    const seen = new Set<string>()
    const deduped = h2hMatches.filter(m => {
      if (seen.has(m.dateRaw)) return false
      seen.add(m.dateRaw)
      return true
    })

    return NextResponse.json({
      matches: deduped.slice(0, 5).map(({ dateRaw: _, ...rest }) => rest),
      home, away,
    })
  } catch (err) {
    return NextResponse.json({ matches: [], error: String(err) })
  }
}
