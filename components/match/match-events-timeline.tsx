'use client'

interface MatchEvent {
  id: string
  minute: number
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution'
  description: string
  team: 'home' | 'away'
}

interface MatchEventsTimelineProps {
  matchId: string
}

const EVENT_ICONS: Record<MatchEvent['type'], string> = {
  goal: '\u26BD',
  yellow_card: '\uD83D\uDFE8',
  red_card: '\uD83D\uDFE5',
  substitution: '\uD83D\uDD04',
}

const MOCK_EVENTS: MatchEvent[] = [
  { id: '1', minute: 12, type: 'goal',         description: 'Gol de Marc Pujol (CE Martinenc)', team: 'home' },
  { id: '2', minute: 23, type: 'yellow_card',  description: 'Targeta groga per Jordi Vila (UE Sants)', team: 'away' },
  { id: '3', minute: 38, type: 'goal',         description: 'Gol de Pau Garcia (UE Sants)', team: 'away' },
  { id: '4', minute: 55, type: 'substitution', description: 'Canvi: Entra Arnau Mas, surt David Roca (CE Martinenc)', team: 'home' },
  { id: '5', minute: 67, type: 'yellow_card',  description: 'Targeta groga per Oriol Ferrer (CE Martinenc)', team: 'home' },
  { id: '6', minute: 78, type: 'goal',         description: 'Gol de Biel Torres (CE Martinenc)', team: 'home' },
  { id: '7', minute: 85, type: 'red_card',     description: 'Targeta vermella per Jordi Vila (UE Sants)', team: 'away' },
]

export function MatchEventsTimeline({ matchId: _matchId }: MatchEventsTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[3.25rem] top-0 bottom-0 w-px bg-border" />

      <div className="flex flex-col gap-0">
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} className="flex items-start gap-4 py-3 relative">
            {/* Minute */}
            <div className="w-10 text-right flex-shrink-0">
              <span className="text-sm font-mono tabular-nums text-muted">{event.minute}&apos;</span>
            </div>

            {/* Icon dot */}
            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-white border border-border rounded-full z-10 text-sm">
              {EVENT_ICONS[event.type]}
            </div>

            {/* Description */}
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-sans text-ink">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
