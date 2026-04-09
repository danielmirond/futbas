export interface ClassificationRow {
  position: number
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
  form: ('W' | 'D' | 'L')[]
}

export async function scrapeClassification(
  category: string,
  group: string,
  season: string
): Promise<ClassificationRow[]> {
  // Implementation will use Playwright to:
  // 1. Navigate to https://www.fcf.cat/competicio
  // 2. Wait for page load and dynamic content
  // 3. Select season from dropdown
  // 4. Select sport type (Futbol 11)
  // 5. Select category (e.g., "Primera Catalana")
  // 6. Select group (e.g., "Grup 1")
  // 7. Wait for classification table to render
  // 8. Parse table rows

  // For now, return empty array — real implementation requires
  // reverse-engineering the fcf.cat selector interactions
  console.log(`[scraper] clasificacion: ${category} ${group} ${season}`)
  return []
}
