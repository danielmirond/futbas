/**
 * Deep exploration of fcf.cat competition page
 * Run with: npx tsx scripts/explore-fcf-deep.ts
 */

import { chromium } from 'playwright'

async function explore() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // Intercept ALL network requests
  const xhrRequests: { method: string; url: string; body?: string }[] = []
  page.on('request', (req) => {
    if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') {
      xhrRequests.push({
        method: req.method(),
        url: req.url(),
        body: req.postData() || undefined,
      })
    }
  })

  console.log('=== Loading /competicio ===\n')
  await page.goto('https://www.fcf.cat/competicio', { waitUntil: 'networkidle', timeout: 30000 })

  // Dismiss cookie banner
  await page.click('#accept-btn').catch(() => {})
  await page.waitForTimeout(1000)

  // Check what's in lista_competiciones
  const listaComp = await page.evaluate(() => {
    const el = document.querySelector('#lista_competiciones')
    return {
      html: el?.innerHTML?.substring(0, 3000) || 'NOT FOUND',
      childCount: el?.children?.length || 0,
    }
  })
  console.log('lista_competiciones children:', listaComp.childCount)
  console.log('lista_competiciones HTML (first 3000):', listaComp.html.substring(0, 1500))

  // Type in autocomplete to trigger search
  console.log('\n\n=== Typing "Primera Catalana" in autocomplete ===\n')
  xhrRequests.length = 0

  await page.fill('#autocomplete_competicion', 'Primera Catalana')
  await page.waitForTimeout(2000)

  console.log('XHR after typing:', xhrRequests.length)
  for (const r of xhrRequests) {
    console.log(`  ${r.method} ${r.url}`)
    if (r.body) console.log(`    Body: ${r.body.substring(0, 200)}`)
  }

  // Check what appeared
  const afterType = await page.evaluate(() => {
    const el = document.querySelector('#lista_competiciones')
    return {
      html: el?.innerHTML?.substring(0, 3000) || 'NOT FOUND',
      visible: el ? getComputedStyle(el).display : 'N/A',
    }
  })
  console.log('\nlista_competiciones after typing:', afterType.html.substring(0, 2000))

  // Look for any clickable competition items
  const compItems = await page.$$eval('#lista_competiciones a, #lista_competiciones li, #lista_competiciones div[onclick], #lista_competiciones .competicion', (els) =>
    els.slice(0, 10).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim()?.substring(0, 80),
      href: (el as HTMLAnchorElement).href || '',
      onclick: el.getAttribute('onclick') || '',
      dataId: el.getAttribute('data-id') || el.getAttribute('data-value') || '',
    }))
  )
  console.log('\nClickable items in lista_competiciones:', compItems.length)
  for (const item of compItems) {
    console.log(`  ${item.tag}: "${item.text}" href="${item.href}" onclick="${item.onclick}" data="${item.dataId}"`)
  }

  // Try clicking on the first competition if found
  if (compItems.length > 0) {
    console.log('\n\n=== Clicking first competition item ===\n')
    xhrRequests.length = 0

    const firstItem = compItems[0]
    if (firstItem.href) {
      await page.click(`#lista_competiciones a`).catch(() => console.log('Failed to click link'))
    } else {
      await page.click(`#lista_competiciones ${firstItem.tag.toLowerCase()}`).catch(() => console.log('Failed to click'))
    }
    await page.waitForTimeout(3000)

    console.log('XHR after click:', xhrRequests.length)
    for (const r of xhrRequests) {
      console.log(`  ${r.method} ${r.url}`)
      if (r.body) console.log(`    Body: ${r.body.substring(0, 200)}`)
    }

    // Check lista_grupos
    const listaGrupos = await page.evaluate(() => {
      const el = document.querySelector('#lista_grupos')
      return {
        html: el?.innerHTML?.substring(0, 3000) || 'NOT FOUND',
        childCount: el?.children?.length || 0,
      }
    })
    console.log('\nlista_grupos children:', listaGrupos.childCount)
    console.log('lista_grupos HTML:', listaGrupos.html.substring(0, 2000))
  }

  // Check for any tables that appeared
  const tables = await page.$$eval('table', (els) =>
    els.map(el => ({
      className: el.className,
      id: el.id,
      rows: el.rows?.length || 0,
      firstRowText: el.rows?.[0]?.textContent?.trim()?.substring(0, 200) || '',
    }))
  )
  console.log('\n\nAll tables on page:', tables.length)
  for (const t of tables) {
    console.log(`  Table id="${t.id}" class="${t.className}" rows=${t.rows}`)
    console.log(`    First row: "${t.firstRowText}"`)
  }

  // Check current URL
  console.log('\nCurrent URL:', page.url())

  // Dump all inline scripts that might contain API URLs
  const scripts = await page.evaluate(() => {
    const scriptTags = document.querySelectorAll('script:not([src])')
    return Array.from(scriptTags)
      .map(s => s.textContent || '')
      .filter(s => s.includes('ajax') || s.includes('fetch') || s.includes('competici') || s.includes('classif') || s.includes('api'))
      .map(s => s.substring(0, 1000))
  })
  console.log('\n\n=== Inline scripts with API/AJAX references ===\n')
  for (const s of scripts) {
    console.log(s)
    console.log('---')
  }

  await browser.close()
  console.log('\n=== Done ===')
}

explore().catch(console.error)
