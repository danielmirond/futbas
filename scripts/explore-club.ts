import { chromium } from 'playwright'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // Go to classificacio to find a team link
  await page.goto('https://www.fcf.cat/classificacio/2526/futbol-11/primera-catalana/grup-1', {
    waitUntil: 'networkidle',
    timeout: 30000,
  })
  await page.click('#accept-btn').catch(() => {})

  const links = await page.$$eval('a[href*="/equip/"]', els =>
    els.slice(0, 3).map(el => (el as HTMLAnchorElement).href)
  )
  console.log('Equip links:', links)

  if (links.length === 0) {
    await browser.close()
    return
  }

  await page.goto(links[0], { waitUntil: 'networkidle', timeout: 30000 })

  const structure = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.textContent?.trim()

    // Get all text labels + values patterns
    const infoItems = Array.from(document.querySelectorAll('.dades-club li, .club-info li, .info li, .dades li, div.info p'))
      .map(el => (el.textContent || '').trim())
      .filter(Boolean)
      .slice(0, 20)

    // Images — logo
    const imgs = Array.from(document.querySelectorAll('img'))
      .filter(img => (img.src || '').includes('escut') || (img.src || '').includes('club') || (img.src || '').includes('logo'))
      .map(img => ({ src: img.src, alt: img.alt, className: img.className }))
      .slice(0, 5)

    // Body text
    const bodyText = document.body.innerText.substring(0, 3500)

    return { h1, infoItems, imgs, bodyText, url: window.location.href }
  })

  console.log('\nURL:', structure.url)
  console.log('H1:', structure.h1)
  console.log('\nInfo items:', structure.infoItems)
  console.log('\nImages:', structure.imgs)
  console.log('\nBody text:', structure.bodyText)

  await browser.close()
}

run().catch(console.error)
