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
      <div className="eyebrow mb-4">🏆 MVP DEL PARTIT</div>

      <div className="flex flex-col gap-2">
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
                className={`text-left p-3 border transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent/5'
                    : isTop
                    ? 'border-neon bg-neon/10'
                    : 'border-border bg-card hover:border-accent'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className={`font-display font-black uppercase text-sm tracking-tight ${isTop ? 'text-neon' : 'text-ink'}`}>
                      {player.name}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-ink3 mt-0.5">
                      {player.team}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-display font-black text-2xl tabular-nums leading-none ${isTop ? 'text-neon' : 'text-accent'}`}>
                      {player.votes}
                    </div>
                    <div className="font-mono text-[9px] uppercase text-ink3">{pct.toFixed(0)}%</div>
                  </div>
                </div>

                <div className="w-full h-1 bg-border">
                  <div
                    className={`h-full transition-all ${isTop ? 'bg-neon' : 'bg-accent'}`}
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
