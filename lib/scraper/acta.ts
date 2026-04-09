export interface ActaPlayer {
  number: number
  name: string
  isStarter: boolean
  minuteIn?: number
  minuteOut?: number
  goals: number
  yellowCards: number
  redCard: boolean
}

export interface ActaEvent {
  minute: number
  type: 'goal' | 'own_goal' | 'penalty' | 'yellow_card' | 'red_card' | 'substitution'
  team: 'home' | 'away'
  playerName: string
  relatedPlayer?: string
}

export interface ActaData {
  homeLineup: ActaPlayer[]
  awayLineup: ActaPlayer[]
  events: ActaEvent[]
  referee: string
  venue: string
  attendance?: number
}

export async function scrapeActa(actaUrl: string): Promise<ActaData | null> {
  console.log(`[scraper] acta: ${actaUrl}`)
  return null
}
