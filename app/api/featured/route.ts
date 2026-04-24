import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { FEATURED_MATCH_QUERY } from '@/lib/sanity/queries'

export async function GET() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  if (!projectId) {
    return NextResponse.json({ match: null })
  }
  try {
    const client = createClient({
      projectId,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: '2024-01-01',
      useCdn: true,
    })
    const match = await client.fetch(FEATURED_MATCH_QUERY, {}, { next: { revalidate: 60 } })
    return NextResponse.json({ match: match ?? null })
  } catch {
    return NextResponse.json({ match: null })
  }
}
