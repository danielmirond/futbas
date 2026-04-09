import type { Browser } from 'playwright'

let browser: Browser | null = null

export async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    try {
      const { chromium } = await import('playwright')
      browser = await chromium.launch({ headless: true })
    } catch {
      throw new Error(
        'Playwright is not available in this environment. ' +
        'The scraper only runs locally or in GitHub Actions.',
      )
    }
  }
  return browser
}

export async function closeBrowser() {
  if (browser) {
    await browser.close()
    browser = null
  }
}
