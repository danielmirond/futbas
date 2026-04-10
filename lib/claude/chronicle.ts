import { getClaudeClient } from './client'

export interface ChronicleMatchEvent {
  type: string
  minute: number | null
  playerName: string | null
  team?: 'home' | 'away'
}

export interface ChronicleInput {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  competition: string
  groupName?: string
  matchday: number
  venue?: string
  events: ChronicleMatchEvent[]
  language?: 'ca' | 'es'
}

export interface ChronicleOutput {
  headline: string
  body: string
  socialSummary: string
  mvpPlayer: string
  mvpJustification: string
}

export async function generateChronicle(input: ChronicleInput): Promise<ChronicleOutput> {
  const client = getClaudeClient()
  const lang = input.language || 'ca'

  const systemPrompt =
    lang === 'ca'
      ? `Ets un periodista esportiu català especialitzat en futbol amateur de la Federació Catalana de Futbol. Escrius cròmiques editorials de qualitat per a Futbas. El teu estil és precís, viu i apassionat però mai sensacionalista. Escriu sempre en català amb un to editorial.`
      : `Eres un periodista deportivo especializado en fútbol amateur catalán de la Federació Catalana de Futbol. Escribes crónicas editoriales de calidad para Futbas. Tu estilo es preciso, vivo y apasionado pero nunca sensacionalista. Escribe siempre en castellano con un tono editorial.`

  const goalEvents = input.events.filter((e) => e.type === 'goal')
  const cardEvents = input.events.filter((e) => e.type.includes('card'))

  const eventsDesc = input.events.length
    ? input.events
        .map((e) => `Minut ${e.minute || '?'}: ${e.type} — ${e.playerName || 'Jugador desconegut'}`)
        .join('\n')
    : 'No hi ha events disponibles.'

  const userPrompt = `Genera una crònica del següent partit de futbol amateur:

${input.homeTeam} ${input.homeScore} - ${input.awayScore} ${input.awayTeam}
Competició: ${input.competition}${input.groupName ? ` · ${input.groupName}` : ''}
Jornada ${input.matchday}
${input.venue ? `Camp: ${input.venue}` : ''}

Events del partit:
${eventsDesc}

Gols: ${goalEvents.length}
Targetes: ${cardEvents.length}

Respon ÚNICAMENT en format JSON vàlid amb aquests camps exactes:
{
  "headline": "titular SEO curt i potent (màx 100 caràcters)",
  "body": "crònica completa de 600-800 paraules amb paràgrafs separats per doble salt de línia",
  "socialSummary": "resum per xarxes socials (màx 280 caràcters)",
  "mvpPlayer": "nom del jugador MVP del partit",
  "mvpJustification": "justificació breu del per què és MVP (màx 150 caràcters)"
}

No incloguis text abans ni després del JSON. Només el JSON.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 3072,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Extract JSON from response (in case Claude wraps it in markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse chronicle JSON from Claude response')
  }

  return JSON.parse(jsonMatch[0]) as ChronicleOutput
}
