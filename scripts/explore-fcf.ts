/**
 * FCF Website Explorer
 * Run with: npx tsx scripts/explore-fcf.ts
 *
 * Discovers competition codes, URL patterns, and DOM structure
 * for building the real scraper.
 */

import { chromium } from 'playwright'

async function explore() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  console.log('\n=== 1. Exploring /competicio ===\n')

  await page.goto('https://www.fcf.cat/competicio', { waitUntil: 'networkidle', timeout: 30000 })

  // Capture all select dropdowns
  const selects = await page.$$eval('select', (els) =>
    els.map(el => ({
      id: el.id,
      name: el.name,
      className: el.className,
      options: Array.from(el.options).map(o => ({ value: o.value, text: o.textContent?.trim() }))
    }))
  )

  console.log('Selects found:', selects.length)
  for (const s of selects) {
    console.log(`\n  Select: id="${s.id}" name="${s.name}" class="${s.className}"`)
    console.log(`  Options (${s.options.length}):`)
    for (const o of s.options.slice(0, 10)) {
      console.log(`    "${o.value}" => "${o.text}"`)
    }
    if (s.options.length > 10) console.log(`    ... and ${s.options.length - 10} more`)
  }

  // Capture all links on the page
  const links = await page.$$eval('a[href*="/classificacio"], a[href*="/resultats"], a[href*="/acta"], a[href*="/club"]', (els) =>
    els.slice(0, 20).map(el => ({ href: el.href, text: el.textContent?.trim()?.substring(0, 50) }))
  )

  console.log('\n\nRelevant links found:', links.length)
  for (const l of links) {
    console.log(`  ${l.href} => "${l.text}"`)
  }

  // Try intercepting XHR/fetch calls
  console.log('\n\n=== 2. Intercepting network requests ===\n')

  const requests: string[] = []
  page.on('request', (req) => {
    if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') {
      requests.push(`${req.method()} ${req.url()}`)
    }
  })

  // Try selecting a season if there's a select
  if (selects.length > 0) {
    const firstSelect = selects[0]
    if (firstSelect.options.length > 1) {
      const val = firstSelect.options[1].value
      console.log(`Selecting first option: "${val}" from select #${firstSelect.id || firstSelect.name}`)
      const selector = firstSelect.id ? `#${firstSelect.id}` : `select[name="${firstSelect.name}"]`
      await page.selectOption(selector, val).catch(() => console.log('  Failed to select'))
      await page.waitForTimeout(2000)
    }
  }

  console.log('XHR/Fetch requests captured:', requests.length)
  for (const r of requests) {
    console.log(`  ${r}`)
  }

  // Try direct classification URL patterns
  console.log('\n\n=== 3. Testing direct URL patterns ===\n')

  const testUrls = [
    'https://www.fcf.cat/classificacio',
    'https://www.fcf.cat/resultats',
    'https://www.fcf.cat/acta',
    'https://www.fcf.cat/club',
  ]

  for (const url of testUrls) {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => null)
    const status = resp?.status() || 'ERROR'
    const finalUrl = page.url()
    const title = await page.title().catch(() => '')
    console.log(`  ${url} => HTTP ${status} | Final: ${finalUrl} | Title: "${title.substring(0, 60)}"`)
  }

  // Now let's check /competicio more carefully — look for the actual page HTML structure
  console.log('\n\n=== 4. Page structure of /competicio ===\n')

  await page.goto('https://www.fcf.cat/competicio', { waitUntil: 'networkidle', timeout: 30000 })

  // Dump the page HTML structure (first 5000 chars of body)
  const bodyHtml = await page.evaluate(() => {
    const body = document.body
    // Get a simplified version
    const tables = document.querySelectorAll('table')
    const forms = document.querySelectorAll('form')
    const divIds = Array.from(document.querySelectorAll('[id]')).map(el => `${el.tagName}#${el.id}`).slice(0, 30)

    return {
      tablesCount: tables.length,
      formsCount: forms.length,
      mainIds: divIds,
      bodyText: body.innerText?.substring(0, 2000),
    }
  })

  console.log('Tables:', bodyHtml.tablesCount)
  console.log('Forms:', bodyHtml.formsCount)
  console.log('Main IDs:', bodyHtml.mainIds.join(', '))
  console.log('\nBody text (first 2000 chars):')
  console.log(bodyHtml.bodyText)

  await browser.close()
  console.log('\n=== Done ===')
}

explore().catch(console.error)
