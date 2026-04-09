/**
 * Full FCF scraping flow exploration
 * Run: npx tsx scripts/explore-fcf-flow.ts
 */
import { chromium } from 'playwright'

async function explore() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // Track XHR
  const xhrs: { url: string; body?: string; response?: string }[] = []
  page.on('response', async (res) => {
    const req = res.request()
    if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') {
      const url = req.url()
      if (url.includes('fcf.cat') && !url.includes('google') && !url.includes('pagead') && !url.includes('criteo') && !url.includes('quantserve') && !url.includes('adscale') && !url.includes('id5') && !url.includes('rubicon') && !url.includes('confiant') && !url.includes('yieldlove') && !url.includes('inmobi')) {
        try {
          const text = await res.text()
          xhrs.push({ url, body: req.postData() || undefined, response: text.substring(0, 3000) })
        } catch {}
      }
    }
  })

  console.log('=== Loading /competicio ===')
  await page.goto('https://www.fcf.cat/competicio', { waitUntil: 'networkidle', timeout: 30000 })
  await page.click('#accept-btn').catch(() => {})
  await page.waitForTimeout(500)

  // Find all discipline/category buttons
  const categories = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.categoria'))
      .map(el => ({ title: el.getAttribute('title'), text: (el.textContent || '').trim() }))
  })
  console.log('\nCategories (disciplines):', categories.length)
  for (const c of categories) console.log(`  title="${c.title}" => "${c.text}"`)

  // Click "Futbol 11" discipline if available
  const futbol11 = categories.find(c => c.text.includes('Futbol 11'))
  if (futbol11) {
    console.log(`\n=== Clicking Futbol 11 (title=${futbol11.title}) ===`)
    xhrs.length = 0
    await page.click(`.categoria[title="${futbol11.title}"]`)
    await page.waitForTimeout(5000) // wait for AJAX

    console.log('XHR calls:', xhrs.length)
    for (const x of xhrs) {
      console.log(`  URL: ${x.url}`)
      if (x.body) console.log(`  Body: ${x.body}`)
      console.log(`  Response (first 1500): ${x.response?.substring(0, 1500)}`)
    }

    // Get competitions that appeared
    const competitions = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.competicion, #lista_competiciones p, #lista_competiciones a, #lista_competiciones div'))
        .filter(el => el.getAttribute('title') || (el.textContent || '').trim().length > 2)
        .map(el => ({
          tag: el.tagName,
          title: el.getAttribute('title'),
          text: (el.textContent || '').trim().substring(0, 80),
          href: (el as HTMLAnchorElement).href || '',
          className: el.className,
        }))
        .slice(0, 30)
    })
    console.log('\nCompetitions loaded:', competitions.length)
    for (const c of competitions) {
      console.log(`  ${c.tag}.${c.className} title="${c.title}" => "${c.text}" href="${c.href}"`)
    }

    // Click "Primera Catalana" if found
    const primera = competitions.find(c => c.text.includes('Primera Catalana'))
    if (primera) {
      console.log(`\n=== Clicking Primera Catalana (title=${primera.title}) ===`)
      xhrs.length = 0

      const selector = primera.title
        ? `.competicion[title="${primera.title}"]`
        : `#lista_competiciones p:has-text("Primera Catalana")`

      await page.click(selector).catch(async () => {
        // Fallback: click by text
        const el = await page.locator('#lista_competiciones >> text=Primera Catalana').first()
        await el.click()
      })
      await page.waitForTimeout(5000)

      console.log('XHR calls:', xhrs.length)
      for (const x of xhrs) {
        console.log(`  URL: ${x.url}`)
        if (x.body) console.log(`  Body: ${x.body}`)
        console.log(`  Response (first 2000): ${x.response?.substring(0, 2000)}`)
      }

      // Get groups
      const groups = await page.evaluate(() => {
        const el = document.querySelector('#lista_grupos')
        if (!el) return { html: 'NOT FOUND', links: [] }
        return {
          html: el.innerHTML.substring(0, 3000),
          links: Array.from(el.querySelectorAll('a')).map(a => ({
            href: a.getAttribute('href'),
            text: (a.textContent || '').trim().substring(0, 80),
          })).slice(0, 20),
        }
      })
      console.log('\nGroups HTML:', groups.html.substring(0, 2000))
      console.log('\nGroup links:', groups.links.length)
      for (const l of groups.links) console.log(`  ${l.href} => "${l.text}"`)

      // Also check selects
      const selects = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('select'))
          .filter(s => s.id.includes('grupo') || s.id.includes('competi') || s.id.includes('jornada'))
          .map(s => ({
            id: s.id,
            options: Array.from(s.options).map(o => ({ value: o.value, text: (o.textContent || '').trim() })).slice(0, 15),
          }))
      })
      console.log('\nSelects:')
      for (const s of selects) {
        console.log(`  #${s.id}: ${s.options.length} options`)
        for (const o of s.options) console.log(`    "${o.value}" => "${o.text}"`)
      }
    }
  }

  // Also check the current URL
  console.log('\n\nFinal URL:', page.url())

  await browser.close()
  console.log('\n=== Done ===')
}

explore().catch(console.error)
