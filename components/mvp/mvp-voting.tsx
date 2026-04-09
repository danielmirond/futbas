'use client'

import { useState } from 'react'

interface Player {
  id: string
  name: string
  team: string
  votes: number
}

interface MvpVotingProps {
  matchId: string
}

const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'Marc Pujol',    team: 'CE Martinenc', votes: 42 },
  { id: '2', name: 'Biel Torres',   team: 'CE Martinenc', votes: 35 },
  { id: '3', name: 'Pau Garcia',    team: 'UE Sants',     votes: 28 },
  { id: '4', name: 'Arnau Mas',     team: 'CE Martinenc', votes: 15 },
  { id: '5', name: 'Oriol Ferrer',  team: 'CE Martinenc', votes: 10 },
  { id: '6', name: 'Jordi Vila',    team: 'UE Sants',     votes: 8 },
]

export function MvpVoting({ matchId: _matchId }: MvpVotingProps) {
  const [players, setPlayers] = useState(MOCK_PLAYERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const totalVotes = players.reduce((sum, p) => sum + p.votes, 0)
  const maxVotes = Math.max(...players.map((p) => p.votes))

  function handleVote(playerId: string) {
    if (selectedId === playerId) return

    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) return { ...p, votes: p.votes + 1 }
        if (p.id === selectedId) return { ...p, votes: p.votes - 1 }
        return p
      })
    )
    setSelectedId(playerId)
  }

  return (
    <div>
      <h3 className="font-serif text-headline mb-4">MVP del Partit</h3>

      <div className="flex flex-col gap-3">
        {players
          .sort((a, b) => b.votes - a.votes)
          .map((player) => {
            const pct = totalVotes > 0 ? (player.votes / totalVotes) * 100 : 0
            const isTop = player.votes === maxVotes
            const isSelected = selectedId === player.id

            return (
              <button
                key={player.id}
                onClick={() => handleVote(player.id)}
                className={`text-left p-3 rounded-sm border transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent-light'
                    : 'border-border bg-white hover:border-ink/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className={`text-sm font-medium font-sans ${isTop ? 'text-accent' : 'text-ink'}`}>
                      {player.name}
                    </span>
                    <span className="text-xs text-muted font-sans ml-2">{player.team}</span>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-muted">
                    {player.votes} vots ({pct.toFixed(0)}%)
                  </span>
                </div>

                {/* Bar */}
                <div className="w-full h-1.5 bg-border/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isTop ? 'bg-accent' : 'bg-ink/20'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            )
          })}
      </div>
    </div>
  )
}
