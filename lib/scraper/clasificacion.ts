import { getBrowser } from './browser'

export interface ClassificationRow {
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
  zone?: 'promotion' | 'playoff' | 'relegation'
}

/**
 * Scrapes classification from fcf.cat
 * URL pattern: /classificacio/{season}/{sport}/{category}/{group}
 * Example: /classificacio/2526/futbol-11/primera-catalana/grup-1
 */
export async function scrapeClassification(
  season: string,
  sport: string,
  category: string,
  group: string,
): Promise<ClassificationRow[]> {
  const url = `https://www.fcf.cat/classificacio/${season}/${sport}/${category}/${group}`
  console.log(`[scraper] clasificacion: ${url}`)

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    // Dismiss cookie banner
    await page.click('#accept-btn').catch(() => {})

    const rows = await page.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('tr'))
      return trs.map(tr => {
        const cells = Array.from(tr.querySelectorAll('td'))
        if (cells.length < 5) return null

        const cellTexts = cells.map(c => (c.textContent || '').trim())

        // Find team link for slug
        const teamLink = tr.querySelector('a[href*="/equip/"]')
        const teamCalLink = tr.querySelector('a[href*="/calendari-equip/"]')
        const teamHref = (teamLink?.getAttribute('href') || teamCalLink?.getAttribute('href') || '')
        const teamSlug = teamHref.split('/').pop() || ''
        const teamName = teamCalLink?.textContent?.trim() || cellTexts[1] || ''

        // Parse form from acta links (last 5 results)
        const actaLinks = Array.from(tr.querySelectorAll('a[href*="/acta/"]'))
        const form = actaLinks.slice(-5).map(a => {
          const text = (a.textContent || '').trim()
          if (text.startsWith('G')) return 'W'
          if (text.startsWith('E')) return 'D'
          if (text.startsWith('P')) return 'L'
          return null
        }).filter(Boolean) as ('W' | 'D' | 'L')[]

        return { cellTexts, teamName, teamSlug, form }
      }).filter(Boolean)
    })

    // Parse the zone info from the last row
    const zoneRow = await page.evaluate(() => {
      const trs = Array.from(document.querySelectorAll('tr'))
      const lastRow = trs[trs.length - 1]
      return lastRow?.textContent?.trim() || ''
    })

    const classification: ClassificationRow[] = []

    for (const row of rows) {
      if (!row || !row.teamName || row.cellTexts.length < 10) continue

      const pos = parseInt(row.cellTexts[0])
      if (isNaN(pos)) continue

      // FCF table structure (23 cells per row, verified):
      // [0]=Pos [1]=badge(empty) [2]=name(detallada) [3]=name(resumida)
      // [4]=Points(float) [5]=empty [6]=Played [7]=Won [8]=Drawn [9]=Lost
      // [10]=empty [11-14]=local(J,W,D,L) [15-18]=away(J,W,D,L)
      // [19]=GF [20]=GC [21]=form(acta links) [22]=trailing 0
      const ct = row.cellTexts

      const points = Math.round(parseFloat(ct[4]) || 0)
      const played = parseInt(ct[6]) || 0
      const won = parseInt(ct[7]) || 0
      const drawn = parseInt(ct[8]) || 0
      const lost = parseInt(ct[9]) || 0
      const goalsFor = parseInt(ct[19]) || 0
      const goalsAgainst = parseInt(ct[20]) || 0

      // Determine zone based on position and total teams
      const totalTeams = rows.filter(r => r && parseInt(r.cellTexts[0]) > 0).length
      let zone: ClassificationRow['zone']
      if (pos <= 1) zone = 'promotion'
      else if (pos <= 4) zone = 'playoff'
      else if (pos > totalTeams - 2) zone = 'relegation'

      classification.push({
        position: pos,
        teamName: row.teamName,
        teamSlug: row.teamSlug,
        points,
        played,
        won,
        drawn,
        lost,
        goalsFor,
        goalsAgainst,
        form: row.form,
        zone,
      })
    }

    return classification
  } finally {
    await page.close()
  }
}

/**
 * Discover available competitions from FCF
 */
export async function discoverCompetitions(temporada: string = '21'): Promise<{
  disciplines: { code: string; name: string }[]
  competitions: { code: string; name: string }[]
}> {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest',
  }

  // Futbol 11 category code
  const FUTBOL_11 = '19308233'

  const res = await fetch('https://www.fcf.cat/cargar_competiciones', {
    method: 'POST',
    headers,
    body: `temporada=${temporada}&categoria=${FUTBOL_11}`,
  })
  const html = await res.text()

  // Parse competition items from HTML response
  const competitions: { code: string; name: string }[] = []
  const regex = /class="competicion"\s+title="(\d+)">([^<]+)</g
  let match
  while ((match = regex.exec(html)) !== null) {
    competitions.push({ code: match[1], name: match[2].trim() })
  }

  return {
    disciplines: [
      { code: '19308233', name: 'Futbol 11' },
      { code: '19308235', name: 'Futbol 7' },
      { code: '19308236', name: 'Futbol Sala' },
      { code: '19308237', name: 'Futbol Femení' },
    ],
    competitions,
  }
}

/**
 * Discover groups for a competition
 */
export async function discoverGroups(
  temporada: string,
  tipo: string,
  categoria: string,
  competicion: string,
): Promise<{ url: string; name: string }[]> {
  const res = await fetch('https://www.fcf.cat/cargar_grupos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: `tipo=${tipo}&categoria=${categoria}&competicion=${competicion}&temporada=${temporada}`,
  })
  const html = await res.text()

  const groups: { url: string; name: string }[] = []
  const regex = /href="([^"]+)"[^>]*><p>([^<]+)<\/p>/g
  let match
  while ((match = regex.exec(html)) !== null) {
    groups.push({ url: match[1], name: match[2].trim() })
  }

  return groups
}
