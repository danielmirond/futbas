import { MetadataRoute } from 'next'
import { COMPETITIONS } from '../lib/competitions'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://musing-snyder.vercel.app'
  return [
    { url: base, changeFrequency: 'hourly', priority: 1 },
    ...COMPETITIONS.map(c => ({
      url: `${base}/competicion/${c.slug}`,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    })),
  ]
}
