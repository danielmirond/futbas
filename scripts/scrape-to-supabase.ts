/**
 * Standalone scraper that reads from fcf.cat and writes to Supabase.
 * Runs in GitHub Actions (Node.js + Playwright) every 2 hours.
 *
 * Usage:
 *   npx tsx scripts/scrape-to-supabase.ts
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
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

// Competitions to scrape
const COMPETITIONS_TO_SCRAPE = [
  {
    season: '2526',
    sport: 'futbol-11',
    category: 'primera-catalana',
    group: 'grup-1',
    name: 'Primera Catalana',
    group_name: 'Grup 1',
  },
  {
    season: '2526',
    sport: 'futbol-11',
    category: 'primera-catalana',
    group: 'grup-2',
    name: 'Primera Catalana',
    group_name: 'Grup 2',
  },
  {
    season: '2526',
    sport: 'futbol-11',
    category: 'primera-catalana',
    group: 'grup-3',
    name: 'Primera Catalana',
    group_name: 'Grup 3',
  },
]

interface ScrapedRow {
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

async function scrapeClassification(
  page: Page,
  season: string,
  sport: string,
  category: string,
  group: string,
): Promise<ScrapedRow[]> {
  const url = `https://www.fcf.cat/classificacio/${season}/${sport}/${category}/${group}`
  console.log(`  → Fetching ${url}`)

  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
  await page.click('#accept-btn').catch(() => {})

  const rows = await page.evaluate(() => {
    const trs = Array.from(document.querySelectorAll('tr'))
    return trs
      .map((tr) => {
        const cells = Array.from(tr.querySelectorAll('td'))
        if (cells.length < 20) return null

        const cellTexts = cells.map((c) => (c.textContent || '').trim())
        const pos = parseInt(cellTexts[0])
        if (isNaN(pos)) return null

        const teamCalLink = tr.querySelector('a[href*="/calendari-equip/"]')
        const teamSlug = (
          tr.querySelector('a[href*="/equip/"]')?.getAttribute('href') ||
          teamCalLink?.getAttribute('href') ||
          ''
        )
          .split('/')
          .pop() || ''
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
      .filter(Boolean) as ScrapedRow[]
  })

  return rows
}

async function upsertCompetition(
  name: string,
  groupName: string,
  season: string,
  fcfSlug: string,
): Promise<string> {
  const fcfId = `${name}-${groupName}-${season}`.toLowerCase().replace(/\s+/g, '-')

  // Check if exists
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
      season,
      sport_type: 'futbol11',
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to insert competition: ${error.message}`)
  return data.id
}

async function upsertClub(teamName: string, teamSlug: string): Promise<string> {
  const { data: existing } = await supabase
    .from('clubs')
    .select('id')
    .eq('fcf_code', teamSlug)
    .maybeSingle()

  if (existing) return existing.id

  const { data, error } = await supabase
    .from('clubs')
    .insert({
      fcf_code: teamSlug,
      name: teamName,
      scraped_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to insert club ${teamName}: ${error.message}`)
  return data.id
}

async function upsertTeam(
  clubId: string,
  competitionId: string,
  row: ScrapedRow,
): Promise<void> {
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

  // Check if team already exists for this competition
  const { data: existing } = await supabase
    .from('teams')
    .select('id')
    .eq('club_id', clubId)
    .eq('competition_id', competitionId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from('teams').update(payload).eq('id', existing.id)
    if (error) throw new Error(`Failed to update team: ${error.message}`)
  } else {
    const { error } = await supabase.from('teams').insert(payload)
    if (error) throw new Error(`Failed to insert team: ${error.message}`)
  }
}

async function scrapeAll() {
  console.log('🚀 Starting FCF scraper → Supabase')
  console.log(`   Target: ${COMPETITIONS_TO_SCRAPE.length} competitions\n`)

  const browser: Browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  let totalTeamsProcessed = 0
  let errors = 0

  try {
    for (const comp of COMPETITIONS_TO_SCRAPE) {
      console.log(`\n📊 ${comp.name} — ${comp.group_name}`)
      try {
        const rows = await scrapeClassification(
          page,
          comp.season,
          comp.sport,
          comp.category,
          comp.group,
        )

        if (rows.length === 0) {
          console.log('  ⚠  No rows scraped')
          continue
        }

        console.log(`  ✓ Scraped ${rows.length} teams`)

        const competitionId = await upsertCompetition(
          comp.name,
          comp.group_name,
          comp.season,
          `${comp.category}-${comp.group}`,
        )

        for (const row of rows) {
          try {
            const clubId = await upsertClub(row.teamName, row.teamSlug)
            await upsertTeam(clubId, competitionId, row)
            totalTeamsProcessed++
          } catch (err) {
            console.error(`    ✗ ${row.teamName}: ${(err as Error).message}`)
            errors++
          }
        }
        console.log(`  ✓ Saved to Supabase`)
      } catch (err) {
        console.error(`  ✗ Failed: ${(err as Error).message}`)
        errors++
      }
    }
  } finally {
    await browser.close()
  }

  console.log(`\n✅ Done. Teams processed: ${totalTeamsProcessed}, errors: ${errors}`)
  if (errors > 0) process.exit(1)
}

scrapeAll().catch((err) => {
  console.error('💥 Fatal error:', err)
  process.exit(1)
})
