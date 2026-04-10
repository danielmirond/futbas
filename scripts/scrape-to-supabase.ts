/**
 * Standalone scraper that reads from fcf.cat and writes to Supabase.
 * Runs in GitHub Actions (Node.js + Playwright) every 2 hours.
 *
 * Scrapes:
 *  - Classification (teams + points) for multiple competitions
 *  - Results per matchday (last 3 matchdays)
 *  - Actas (goals + cards) for finished matches
 *
 * Usage:  npx tsx scripts/scrape-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import { chromium, type Browser, type Page } from 'playwright'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// Competitions to scrape — Primera, Segona, Tercera Catalana (all groups)
const COMPETITIONS_TO_SCRAPE = [
  { name: 'Primera Catalana', group_name: 'Grup 1', slug: 'primera-catalana', group: 'grup-1' },
  { name: 'Primera Catalana', group_name: 'Grup 2', slug: 'primera-catalana', group: 'grup-2' },
  { name: 'Primera Catalana', group_name: 'Grup 3', slug: 'primera-catalana', group: 'grup-3' },
  { name: 'Segona Catalana', group_name: 'Grup 1', slug: 'segona-catalana', group: 'grup-1' },
  { name: 'Segona Catalana', group_name: 'Grup 2', slug: 'segona-catalana', group: 'grup-2' },
  { name: 'Segona Catalana', group_name: 'Grup 3', slug: 'segona-catalana', group: 'grup-3' },
  { name: 'Segona Catalana', group_name: 'Grup 4', slug: 'segona-catalana', group: 'grup-4' },
  { name: 'Segona Catalana', group_name: 'Grup 5', slug: 'segona-catalana', group: 'grup-5' },
  { name: 'Tercera Catalana', group_name: 'Grup 1', slug: 'tercera-catalana', group: 'grup-1' },
  { name: 'Tercera Catalana', group_name: 'Grup 5', slug: 'tercera-catalana', group: 'grup-5' },
  { name: 'Tercera Catalana', group_name: 'Grup 10', slug: 'tercera-catalana', group: 'grup-10' },
]

const SEASON = '2526'
const SPORT = 'futbol-11'
const MATCHDAYS_TO_SCRAPE = 3 // last 3 matchdays per competition
const MAX_ACTAS_PER_COMP = 5 // limit acta scraping to avoid timeouts

interface ClassRow {
  position: number
  teamName: string
  teamSlug: string
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  form: ('W' | 'D' | 'L')[]
}

interface ResultRow {
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  actaUrl: string | null
  venue: string | null
  status: 'scheduled' | 'finished' | 'live'
}

interface ActaEvent {
  type: 'goal' | 'yellow_card' | 'red_card'
  minute: number | null
  playerName: string
  team: 'home' | 'away' // home index 0, away index 1
}

// ───── SCRAPERS ─────

async function scrapeClassification(
  page: Page,
  categorySlug: string,
  group: string,
): Promise<ClassRow[]> {
  const url = `https://www.fcf.cat/classificacio/${SEASON}/${SPORT}/${categorySlug}/${group}`
  console.log(`  → ${url}`)

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
    await page.click('#accept-btn').catch(() => {})
  } catch {
    return []
  }

  return await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll('tr'))
    return trs
      .map((tr) => {
        const cells = Array.from(tr.querySelectorAll('td'))
        if (cells.length < 20) return null

        const cellTexts = cells.map((c) => (c.textContent || '').trim())
        const pos = parseInt(cellTexts[0])
        if (isNaN(pos)) return null

        const teamCalLink = tr.querySelector('a[href*="/calendari-equip/"]')
        const teamHref =
          tr.querySelector('a[href*="/equip/"]')?.getAttribute('href') ||
          teamCalLink?.getAttribute('href') || ''
        const teamSlug = teamHref.split('/').pop() || ''
        const teamName = teamCalLink?.textContent?.trim() || cellTexts[2] || ''

        const actaLinks = Array.from(tr.querySelectorAll('a[href*="/acta/"]'))
        const form = actaLinks
          .slice(-5)
          .map((a) => {
            const text = (a.textContent || '').trim()
            if (text.startsWith('G')) return 'W'
            if (text.startsWith('E')) return 'D'
            if (text.startsWith('P')) return 'L'
            return null
          })
          .filter(Boolean) as ('W' | 'D' | 'L')[]

        return {
          position: pos,
          teamName,
          teamSlug,
          points: Math.round(parseFloat(cellTexts[4]) || 0),
          played: parseInt(cellTexts[6]) || 0,
          won: parseInt(cellTexts[7]) || 0,
          drawn: parseInt(cellTexts[8]) || 0,
          lost: parseInt(cellTexts[9]) || 0,
          goalsFor: parseInt(cellTexts[19]) || 0,
          goalsAgainst: parseInt(cellTexts[20]) || 0,
          form,
        }
      })
      .filter(Boolean) as ClassRow[]
  })
}

async function scrapeResults(
  page: Page,
  categorySlug: string,
  group: string,
  matchday: number,
): Promise<ResultRow[]> {
  const url = `https://www.fcf.cat/resultats/${SEASON}/${SPORT}/${categorySlug}/${group}/jornada-${matchday}`
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  } catch {
    return []
  }

  return await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table.table_resultats'))
    return tables
      .map((tbl): ResultRow | null => {
        const cells = Array.from(tbl.querySelectorAll('td'))
        if (cells.length < 6) return null

        const homeTeam = (cells[1]?.textContent || '').trim()
        const awayTeam = (cells[3]?.textContent || '').trim()
        const scoreText = (cells[2]?.textContent || '').trim()
        const venue = (cells[5]?.textContent || '').trim().split(/(?=[A-Z]{2,})/)[0]?.trim() || null

        // Parse score "ACTA TANCADA 1 - 0" or "17:00" for scheduled
        const scoreMatch = scoreText.match(/(\d+)\s*[-–]\s*(\d+)/)
        const actaLink = tbl.querySelector('a[href*="/acta/"]')?.getAttribute('href') || null

        let status: 'scheduled' | 'finished' | 'live' = 'scheduled'
        let homeScore: number | null = null
        let awayScore: number | null = null

        if (scoreMatch) {
          homeScore = parseInt(scoreMatch[1])
          awayScore = parseInt(scoreMatch[2])
          status = 'finished'
        }

        if (!homeTeam || !awayTeam) return null

        return { homeTeam, awayTeam, homeScore, awayScore, actaUrl: actaLink, venue, status }
      })
      .filter(Boolean) as ResultRow[]
  })
}

async function scrapeActa(page: Page, actaUrl: string): Promise<ActaEvent[]> {
  try {
    await page.goto(actaUrl, { waitUntil: 'networkidle', timeout: 20000 })
  } catch {
    return []
  }

  return await page.evaluate(() => {
    const events: Array<{ type: string; minute: number | null; playerName: string; team: 'home' | 'away' }> = []

    // Find all acta-table sections
    const tables = Array.from(document.querySelectorAll('table.acta-table'))

    for (const table of tables) {
      const header = (table.rows[0]?.textContent || '').trim().toLowerCase()

      if (header.includes('gols')) {
        // Goals table: minute | player | team
        for (let i = 1; i < table.rows.length; i++) {
          const cells = Array.from(table.rows[i].cells).map(c => (c.textContent || '').trim())
          if (cells.length >= 2) {
            const minMatch = cells[0]?.match(/\d+/)
            const minute = minMatch ? parseInt(minMatch[0]) : null
            // Team column is usually 2 or 3 — we infer home/away by club name if available
            events.push({
              type: 'goal',
              minute,
              playerName: cells[1] || cells[2] || '',
              team: 'home', // placeholder — refined below if needed
            })
          }
        }
      } else if (header.includes('targetes')) {
        // Cards table
        for (let i = 1; i < table.rows.length; i++) {
          const cells = Array.from(table.rows[i].cells).map(c => (c.textContent || '').trim())
          if (cells.length >= 2) {
            const minMatch = cells[0]?.match(/\d+/)
            const minute = minMatch ? parseInt(minMatch[0]) : null
            const text = cells.join(' ').toLowerCase()
            const type = text.includes('vermella') || text.includes('roja') ? 'red_card' : 'yellow_card'
            events.push({
              type,
              minute,
              playerName: cells[1] || cells[2] || '',
              team: 'home',
            })
          }
        }
      }
    }

    return events as ActaEvent[]
  })
}

// ───── SUPABASE UPSERTS ─────

async function upsertCompetition(name: string, groupName: string, categorySlug: string, group: string): Promise<string> {
  const fcfId = `${categorySlug}-${group}-${SEASON}`

  const { data: existing } = await supabase
    .from('competitions')
    .select('id')
    .eq('fcf_id', fcfId)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from('competitions')
    .insert({
      fcf_id: fcfId,
      name,
      category: name,
      group_name: groupName,
      season: SEASON,
      sport_type: 'futbol11',
    })
    .select('id')
    .single()

  if (error) throw new Error(`insertCompetition: ${error.message}`)
  return data.id
}

async function upsertClub(teamName: string, teamSlug: string): Promise<string> {
  const fcfCode = teamSlug || teamName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const { data: existing } = await supabase
    .from('clubs')
    .select('id')
    .eq('fcf_code', fcfCode)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from('clubs')
    .insert({
      fcf_code: fcfCode,
      name: teamName,
      scraped_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) throw new Error(`insertClub ${teamName}: ${error.message}`)
  return data.id
}

async function upsertTeam(clubId: string, competitionId: string, row: ClassRow): Promise<string> {
  const payload = {
    club_id: clubId,
    competition_id: competitionId,
    team_name: row.teamName,
    position: row.position,
    points: row.points,
    played: row.played,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goals_for: row.goalsFor,
    goals_against: row.goalsAgainst,
    form: row.form,
    scraped_at: new Date().toISOString(),
  }

  const { data: existing } = await supabase
    .from('teams')
    .select('id')
    .eq('club_id', clubId)
    .eq('competition_id', competitionId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('teams').update(payload).eq('id', existing.id)
    if (error) throw new Error(`updateTeam: ${error.message}`)
    return existing.id
  } else {
    const { data, error } = await supabase.from('teams').insert(payload).select('id').single()
    if (error) throw new Error(`insertTeam: ${error.message}`)
    return data.id
  }
}

async function lookupTeamByName(teamName: string, competitionId: string): Promise<string | null> {
  const { data } = await supabase
    .from('teams')
    .select('id')
    .eq('competition_id', competitionId)
    .ilike('team_name', teamName)
    .maybeSingle()
  return data?.id || null
}

async function upsertMatch(
  competitionId: string,
  matchday: number,
  homeTeamId: string,
  awayTeamId: string,
  result: ResultRow,
): Promise<string | null> {
  const payload = {
    competition_id: competitionId,
    matchday,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    home_score: result.homeScore,
    away_score: result.awayScore,
    venue: result.venue,
    status: result.status,
    acta_url: result.actaUrl,
    scraped_at: new Date().toISOString(),
  }

  const { data: existing } = await supabase
    .from('matches')
    .select('id')
    .eq('competition_id', competitionId)
    .eq('home_team_id', homeTeamId)
    .eq('away_team_id', awayTeamId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('matches').update(payload).eq('id', existing.id)
    if (error) {
      console.error(`    ✗ update match: ${error.message}`)
      return null
    }
    return existing.id
  } else {
    const { data, error } = await supabase.from('matches').insert(payload).select('id').single()
    if (error) {
      console.error(`    ✗ insert match: ${error.message}`)
      return null
    }
    return data.id
  }
}

async function saveEvents(matchId: string, homeTeamId: string, events: ActaEvent[]) {
  if (events.length === 0) return

  // Delete old events for this match
  await supabase.from('match_events').delete().eq('match_id', matchId)

  const rows = events.map((e) => ({
    match_id: matchId,
    team_id: homeTeamId, // simplified — team attribution needs name matching
    event_type: e.type,
    minute: e.minute,
    player_name: e.playerName,
  }))

  const { error } = await supabase.from('match_events').insert(rows)
  if (error) console.error(`    ✗ events: ${error.message}`)
}

// ───── ORCHESTRATOR ─────

async function main() {
  console.log('🚀 FCF Scraper → Supabase (full)')
  console.log(`   Competitions: ${COMPETITIONS_TO_SCRAPE.length}`)
  console.log(`   Matchdays per comp: ${MATCHDAYS_TO_SCRAPE}\n`)

  const browser: Browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  page.setDefaultTimeout(30000)

  const stats = { teams: 0, matches: 0, events: 0, errors: 0 }

  try {
    for (const comp of COMPETITIONS_TO_SCRAPE) {
      console.log(`\n📊 ${comp.name} — ${comp.group_name}`)

      try {
        // 1. Classification
        const classRows = await scrapeClassification(page, comp.slug, comp.group)
        if (classRows.length === 0) {
          console.log('   ⚠  Empty classification, skipping')
          continue
        }

        const competitionId = await upsertCompetition(comp.name, comp.group_name, comp.slug, comp.group)
        const teamIdsByName = new Map<string, string>()

        for (const row of classRows) {
          try {
            const clubId = await upsertClub(row.teamName, row.teamSlug)
            const teamId = await upsertTeam(clubId, competitionId, row)
            teamIdsByName.set(row.teamName.toUpperCase(), teamId)
            stats.teams++
          } catch (err) {
            console.error(`     ✗ ${row.teamName}: ${(err as Error).message}`)
            stats.errors++
          }
        }
        console.log(`   ✓ ${classRows.length} teams`)

        // 2. Results — last N matchdays
        const maxPlayed = Math.max(...classRows.map((r) => r.played))
        const startMd = Math.max(1, maxPlayed - MATCHDAYS_TO_SCRAPE + 1)
        const endMd = maxPlayed

        const actasToScrape: Array<{ matchId: string; homeTeamId: string; actaUrl: string }> = []

        for (let md = startMd; md <= endMd; md++) {
          const results = await scrapeResults(page, comp.slug, comp.group, md)
          if (results.length === 0) continue

          for (const r of results) {
            const homeId = teamIdsByName.get(r.homeTeam.toUpperCase()) ||
              (await lookupTeamByName(r.homeTeam, competitionId))
            const awayId = teamIdsByName.get(r.awayTeam.toUpperCase()) ||
              (await lookupTeamByName(r.awayTeam, competitionId))

            if (!homeId || !awayId) continue

            const matchId = await upsertMatch(competitionId, md, homeId, awayId, r)
            if (matchId) {
              stats.matches++
              if (r.actaUrl && r.status === 'finished' && actasToScrape.length < MAX_ACTAS_PER_COMP) {
                actasToScrape.push({ matchId, homeTeamId: homeId, actaUrl: r.actaUrl })
              }
            }
          }
          console.log(`   ✓ J${md}: ${results.length} matches`)
        }

        // 3. Actas — limited batch
        for (const a of actasToScrape) {
          const events = await scrapeActa(page, a.actaUrl)
          if (events.length > 0) {
            await saveEvents(a.matchId, a.homeTeamId, events)
            stats.events += events.length
          }
        }
        if (actasToScrape.length > 0) {
          console.log(`   ✓ ${actasToScrape.length} actes processades`)
        }
      } catch (err) {
        console.error(`   ✗ ${(err as Error).message}`)
        stats.errors++
      }
    }
  } finally {
    await browser.close()
  }

  console.log(`\n✅ Done`)
  console.log(`   Teams:  ${stats.teams}`)
  console.log(`   Matches: ${stats.matches}`)
  console.log(`   Events: ${stats.events}`)
  console.log(`   Errors: ${stats.errors}`)
}

main().catch((err) => {
  console.error('💥 Fatal:', err)
  process.exit(1)
})
