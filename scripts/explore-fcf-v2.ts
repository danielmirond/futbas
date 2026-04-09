import { chromium } from 'playwright'

async function explore() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const xhrReqs: { method: string; url: string; body?: string }[] = []
  page.on('request', r => {
    if (r.resourceType() === 'xhr' || r.resourceType() === 'fetch') {
      xhrReqs.push({ method: r.method(), url: r.url(), body: r.postData() || undefined })
    }
  })

  await page.goto('https://www.fcf.cat/competicio', { waitUntil: 'networkidle', timeout: 30000 })
  await page.click('#accept-btn').catch(() => {})
  await page.waitForTimeout(500)

  // Get all relevant links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]'))
      .map(el => ({ href: el.getAttribute('href') || '', text: (el.textContent || '').trim().substring(0, 60) }))
      .filter(l => {
        const h = l.href
        return h.includes('competicio') || h.includes('classif') || h.includes('resultat') ||
               h.includes('club') || h.includes('acta') || h.includes('grup') || h.includes('lliga')
      })
      .slice(0, 30)
  })

  console.log('Relevant links:', links.length)
  for (const l of links) console.log(`  ${l.href} => "${l.text}"`)

  // Get script sources (non-ad)
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script[src]'))
      .map(el => (el as HTMLScriptElement).src)
      .filter(s => !s.includes('google') && !s.includes('analytics') && !s.includes('ads') && !s.includes('yieldlove'))
  })
  console.log('\nApp scripts:')
  for (const s of scripts) console.log(`  ${s}`)

  // Get inline scripts with competicio/ajax references
  const inlineScripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent || '')
      .filter(s => s.includes('ajax') || s.includes('competici') || s.includes('classif') || s.includes('/api'))
      .map(s => s.substring(0, 2000))
  })
  console.log('\nInline scripts with ajax/competicio refs:', inlineScripts.length)
  for (let i = 0; i < inlineScripts.length; i++) {
    console.log(`\n--- Script ${i + 1} ---`)
    console.log(inlineScripts[i])
  }

  // Select temporada and capture network
  console.log('\n\n=== Selecting temporada 21 (2025-2026) ===')
  xhrReqs.length = 0
  await page.selectOption('#selector_temporada', '21')
  await page.waitForTimeout(3000)

  const apiCalls = xhrReqs.filter(r => !r.url.includes('google') && !r.url.includes('pagead') && !r.url.includes('quantserve'))
  console.log('API calls after select:', apiCalls.length)
  for (const r of apiCalls) {
    console.log(`  ${r.method} ${r.url}`)
    if (r.body) console.log(`    Body: ${r.body.substring(0, 300)}`)
  }

  // Check competitions div again
  const compDiv = await page.evaluate(() => {
    const el = document.querySelector('#lista_competiciones')
    if (!el) return 'NOT FOUND'
    const children = el.querySelectorAll('*')
    const anchors = el.querySelectorAll('a')
    return `Children: ${children.length}, Anchors: ${anchors.length}, HTML: ${el.innerHTML.substring(0, 2000)}`
  })
  console.log('\nlista_competiciones:', compDiv)

  // Check if there are visible competition links/items anywhere
  const compLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .filter(a => a.offsetParent !== null) // visible only
      .filter(a => {
        const text = (a.textContent || '').toLowerCase()
        return text.includes('primera') || text.includes('segona') || text.includes('tercera') ||
               text.includes('preferent') || text.includes('juvenil') || text.includes('cadet')
      })
      .map(a => ({ href: a.getAttribute('href'), text: a.textContent?.trim()?.substring(0, 80) }))
      .slice(0, 20)
  })
  console.log('\nVisible competition links:', compLinks.length)
  for (const l of compLinks) console.log(`  ${l.href} => "${l.text}"`)

  await browser.close()
  console.log('\n=== Done ===')
}

explore().catch(console.error)
