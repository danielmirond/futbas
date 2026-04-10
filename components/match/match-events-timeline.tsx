interface MatchEvent {
  id: string
  minute: number
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution'
  description: string
  team: 'home' | 'away'
}

interface MatchEventsTimelineProps {
  matchId: string
  events?: MatchEvent[]
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

export function MatchEventsTimeline({ events = [] }: MatchEventsTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="bg-primary text-white p-5">
        <h3 className="eyebrow-light mb-4">EVENTS</h3>
        <p className="font-sans text-sm text-white/50">
          No hi ha events registrats per aquest partit.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-primary text-white p-5">
      <h3 className="eyebrow-light mb-4">EVENTS</h3>

      <div className="flex flex-col gap-2">
        {events.map((event) => {
          const isGoal = event.type === 'goal'
          return (
            <div
              key={event.id}
              className={`flex items-start gap-4 border-l-[3px] pl-3 py-2 bg-white/5 ${EVENT_BORDER[event.type]}`}
            >
              <div className="w-12 flex-shrink-0">
                <span
                  className={`font-display font-black text-2xl tabular-nums leading-none ${
                    isGoal ? 'text-neon' : 'text-white'
                  }`}
                >
                  {event.minute}&apos;
                </span>
              </div>

              <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-sm">
                {EVENT_ICONS[event.type]}
              </div>

              <div className="flex-1 pt-0.5">
                <p className="font-sans font-semibold text-white text-sm">{event.description}</p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-white/40 mt-0.5">
                  {event.team === 'home' ? 'LOCAL' : 'VISITANT'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
