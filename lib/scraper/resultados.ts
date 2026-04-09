export interface MatchResult {
  matchday: number
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  date: string
  venue: string
  actaUrl?: string
}

export async function scrapeResults(
  category: string,
  group: string,
  season: string,
  matchday?: number
): Promise<MatchResult[]> {
  console.log(`[scraper] resultados: ${category} ${group} ${season} jornada:${matchday}`)
  return []
}
