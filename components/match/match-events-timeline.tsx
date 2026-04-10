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

const EVENT_BORDER: Record<MatchEvent['type'], string> = {
  goal: 'border-l-neon',
  yellow_card: 'border-l-[#F5C800]',
  red_card: 'border-l-accent',
  substitution: 'border-l-ink3',
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
    <div className="bg-primary text-white p-5">
      <h3 className="eyebrow-light mb-4">Events</h3>

      <div className="flex flex-col gap-2">
        {MOCK_EVENTS.map((event) => {
          const isGoal = event.type === 'goal'
          return (
            <div
              key={event.id}
              className={`flex items-start gap-4 border-l-[3px] pl-3 py-2 bg-white/5 ${EVENT_BORDER[event.type]}`}
            >
              {/* Minute */}
              <div className="w-12 flex-shrink-0">
                <span
                  className={`font-display font-black text-2xl tabular-nums leading-none ${
                    isGoal ? 'text-neon' : 'text-white'
                  }`}
                >
                  {event.minute}&apos;
                </span>
              </div>

              {/* Icon */}
              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-sm">
                {EVENT_ICONS[event.type]}
              </div>

              {/* Description */}
              <div className="flex-1 pt-0.5">
                <p className="font-sans font-semibold text-white text-sm">
                  {event.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
