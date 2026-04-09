const TTL = {
  classification: 2 * 60 * 60 * 1000,  // 2 hours
  results: 30 * 60 * 1000,              // 30 min on matchday, 2h otherwise
  clubs: 24 * 60 * 60 * 1000,           // 24 hours
  acta: Infinity,                         // permanent
} as const

export type CacheType = keyof typeof TTL

export function isCacheValid(scrapedAt: string | null, type: CacheType): boolean {
  if (!scrapedAt) return false
  if (type === 'acta') return true
  const elapsed = Date.now() - new Date(scrapedAt).getTime()
  return elapsed < TTL[type]
}
