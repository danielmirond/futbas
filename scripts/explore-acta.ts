import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // First go to resultats to find an acta link
  await page.goto('https://www.fcf.cat/resultats/2526/futbol-11/primera-catalana/grup-1', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })
  await page.click('#accept-btn').catch(() => {})

  const actaLinks = await page.$$eval('a[href*="/acta/"]', els =>
    els.slice(0, 3).map(el => (el as HTMLAnchorElement).href)
  )
  console.log('Acta links found:')
  actaLinks.forEach(l => console.log('  ' + l))

  if (actaLinks.length === 0) {
    await browser.close()
    return
  }

  // Go to first acta
  const actaUrl = actaLinks[0]
  console.log('\n→ Loading:', actaUrl)
  await page.goto(actaUrl, { waitUntil: 'networkidle', timeout: 30000 })

  // Capture page structure
  const structure = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.textContent?.trim()
    const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()).slice(0, 5)

    // Find score
    const scoreElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = (el.textContent || '').trim()
      return /^\d+\s*[-–]\s*\d+$/.test(text) && el.children.length === 0
    }).slice(0, 3).map(el => ({
      tag: el.tagName,
      className: (el as HTMLElement).className,
      text: el.textContent?.trim(),
    }))

    // Find main tables
    const tables = Array.from(document.querySelectorAll('table')).map((t, i) => ({
      index: i,
      className: t.className,
      rowCount: t.rows.length,
      firstRowCells: Array.from(t.rows[0]?.cells || []).slice(0, 6).map(c => (c.textContent || '').trim().substring(0, 40)),
    }))

    // Find lineup info
    const bodyText = document.body.innerText.substring(0, 3000)

    return { h1, h2s, scoreElements, tables: tables.slice(0, 8), bodyText }
  })

  console.log('\nH1:', structure.h1)
  console.log('H2s:', structure.h2s)
  console.log('\nScore elements:')
  structure.scoreElements.forEach(s => console.log(`  ${s.tag}.${s.className} => "${s.text}"`))
  console.log('\nTables:')
  structure.tables.forEach(t => {
    console.log(`  [${t.index}] class="${t.className}" rows=${t.rowCount}`)
    console.log(`    First row:`, t.firstRowCells)
  })
  console.log('\nBody text preview (first 3000 chars):')
  console.log(structure.bodyText)

  await browser.close()
}

run().catch(console.error)
