export interface ClubData {
  fcfCode: string
  name: string
  shortName?: string
  delegation?: string
  municipality?: string
  province?: string
  stadiumName?: string
  stadiumAddress?: string
  foundedYear?: number
  website?: string
  badgeUrl?: string
}

export async function scrapeClub(clubUrl: string): Promise<ClubData | null> {
  console.log(`[scraper] club: ${clubUrl}`)
  return null
}

export async function scrapeClubDirectory(): Promise<ClubData[]> {
  console.log('[scraper] club directory')
  return []
}
