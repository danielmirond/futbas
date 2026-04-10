import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const url = 'https://www.fcf.cat/resultats/2526/futbol-11/primera-catalana/grup-1'
  console.log('→', url)
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.click('#accept-btn').catch(() => {})

  // Dump the main content structure
  const result = await page.evaluate(() => {
    // Find all tables and major containers
    const tables = Array.from(document.querySelectorAll('table'))
    const tableInfo = tables.map((t, idx) => ({
      index: idx,
      className: t.className,
      id: t.id,
      rowCount: t.rows.length,
      firstRow: Array.from(t.rows[0]?.cells || []).map(c => (c.textContent || '').trim().substring(0, 30)),
      sampleRow: t.rows[1] ? Array.from(t.rows[1].cells).map((c, i) => ({
        idx: i,
        text: (c.textContent || '').trim().substring(0, 50),
        className: c.className,
      })) : null,
    }))

    // Look for matchday selector
    const jornadaSelects = Array.from(document.querySelectorAll('select'))
      .filter(s => s.id.includes('jornada') || s.id.includes('Jornada'))
      .map(s => ({
        id: s.id,
        optionCount: s.options.length,
        samples: Array.from(s.options).slice(0, 5).map(o => ({ value: o.value, text: o.textContent?.trim() })),
      }))

    return { tables: tableInfo.slice(0, 5), jornadaSelects }
  })

  console.log('\nTables found:')
  for (const t of result.tables) {
    console.log(`  [${t.index}] class="${t.className}" rows=${t.rowCount}`)
    console.log(`      First row:`, t.firstRow)
    if (t.sampleRow) {
      console.log(`      Sample row cells:`)
      t.sampleRow.forEach(c => console.log(`        [${c.idx}] "${c.text}" (class: ${c.className})`))
    }
  }

  console.log('\nJornada selects:')
  result.jornadaSelects.forEach(s => {
    console.log(`  #${s.id}: ${s.optionCount} options`)
    s.samples.forEach(o => console.log(`    "${o.value}" => "${o.text}"`))
  })

  // Also get the first match row in detail
  const matchDetails = await page.evaluate(() => {
    // Try common match row patterns
    const rows = Array.from(document.querySelectorAll('tr')).filter(tr => {
      const links = tr.querySelectorAll('a[href*="/acta/"]')
      return links.length > 0
    })
    return rows.slice(0, 3).map(tr => ({
      cellCount: tr.cells.length,
      cells: Array.from(tr.cells).map((c, i) => ({
        idx: i,
        text: (c.textContent || '').trim().substring(0, 60),
        innerHTML: c.innerHTML.substring(0, 150),
      })),
    }))
  })

  console.log('\nMatch rows with acta links:')
  matchDetails.forEach((m, i) => {
    console.log(`\n  Match ${i + 1} (${m.cellCount} cells):`)
    m.cells.forEach(c => console.log(`    [${c.idx}] "${c.text}"`))
  })

  await browser.close()
}

run().catch(console.error)
