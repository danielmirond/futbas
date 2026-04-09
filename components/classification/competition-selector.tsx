'use client'

import { useState } from 'react'

const COMPETITIONS = [
  'Primera Catalana',
  'Segona Catalana',
  'Tercera Catalana',
  'Lliga Elit',
  "Divisió d'Honor",
]

const GROUPS = ['Grup 1', 'Grup 2', 'Grup 3', 'Grup 4']

export function CompetitionSelector() {
  const [competition, setCompetition] = useState(COMPETITIONS[0])
  const [group, setGroup] = useState(GROUPS[0])

  return (
    <div className="flex items-center gap-3">
      <select
        value={competition}
        onChange={(e) => setCompetition(e.target.value)}
        className="text-sm border border-border rounded-sm px-3 py-1.5 bg-white font-sans text-ink focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {COMPETITIONS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={group}
        onChange={(e) => setGroup(e.target.value)}
        className="text-sm border border-border rounded-sm px-3 py-1.5 bg-white font-sans text-ink focus:outline-none focus:ring-1 focus:ring-accent"
      >
        {GROUPS.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
    </div>
  )
}
