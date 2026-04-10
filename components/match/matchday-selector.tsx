'use client'

import { useState } from 'react'

interface MatchdaySelectorProps {
  totalMatchdays?: number
  initialMatchday?: number
  onSelect?: (matchday: number) => void
}

export function MatchdaySelector({
  totalMatchdays = 30,
  initialMatchday = 25,
  onSelect,
}: MatchdaySelectorProps) {
  const [selected, setSelected] = useState(initialMatchday)

  function handleSelect(matchday: number) {
    setSelected(matchday)
    onSelect?.(matchday)
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
      {Array.from({ length: totalMatchdays }, (_, i) => i + 1).map((matchday) => (
        <button
          key={matchday}
          onClick={() => handleSelect(matchday)}
          className={`
            flex-shrink-0 w-9 h-9 rounded-sm text-sm font-sans font-medium transition-colors
            ${selected === matchday
              ? 'bg-accent text-white'
              : 'bg-card border border-border text-muted hover:text-ink hover:border-ink/10'
            }
          `}
        >
          {matchday}
        </button>
      ))}
    </div>
  )
}
