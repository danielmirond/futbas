import { getClaudeClient } from './client'
import type { ActaData } from '../scraper/acta'

export interface ChronicleInput {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  competition: string
  matchday: number
  acta: ActaData
  language: 'ca' | 'es'
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

  const systemPrompt = input.language === 'ca'
    ? `Ets un periodista esportiu català especialitzat en futbol amateur. Escrius cròmiques per a una publicació editorial de qualitat. El teu estil és precís, viu i apassionat però mai sensacionalista. Escriu sempre en català.`
    : `Eres un periodista deportivo especializado en fútbol amateur catalán. Escribes crónicas para una publicación editorial de calidad. Tu estilo es preciso, vivo y apasionado pero nunca sensacionalista. Escribe siempre en castellano.`

  const eventsDescription = input.acta.events
    .map(e => `Minut ${e.minute}: ${e.type} - ${e.playerName} (${e.team})`)
    .join('\n')

  const userPrompt = `Genera una crònica del partit:

${input.homeTeam} ${input.homeScore} - ${input.awayScore} ${input.awayTeam}
Competició: ${input.competition}, Jornada ${input.matchday}
Àrbitre: ${input.acta.referee}
Camp: ${input.acta.venue}

Esdeveniments:
${eventsDescription}

Alineació local: ${input.acta.homeLineup.filter(p => p.isStarter).map(p => p.name).join(', ')}
Alineació visitant: ${input.acta.awayLineup.filter(p => p.isStarter).map(p => p.name).join(', ')}

Respon en format JSON amb exactament aquests camps:
{
  "headline": "titular SEO (màx 100 caràcters)",
  "body": "crònica completa (~800 paraules, amb paràgrafs separats per \\n\\n)",
  "socialSummary": "resum per xarxes socials (màx 280 caràcters)",
  "mvpPlayer": "nom del millor jugador",
  "mvpJustification": "justificació en 2 frases del per què és l'MVP"
}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse chronicle JSON from Claude response')
  }

  return JSON.parse(jsonMatch[0]) as ChronicleOutput
}
