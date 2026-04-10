'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface MvpVotingProps {
  matchId: string
}

interface PlayerVote {
  playerName: string
  votes: number
}

export function MvpVoting({ matchId }: MvpVotingProps) {
  const [votes, setVotes] = useState<PlayerVote[]>([])
  const [myVote, setMyVote] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function init() {
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!cancelled) setUserId(user?.id || null)

      // Get distinct player names from match_events (goal scorers)
      const { data: events } = await supabase
        .from('match_events')
        .select('player_name, event_type')
        .eq('match_id', matchId)

      const playersFromEvents = Array.from(
        new Set(
          (events || [])
            .filter((e) => e.event_type === 'goal' && e.player_name)
            .map((e) => e.player_name as string),
        ),
      )

      // Get all votes for this match
      const { data: allVotes } = await supabase
        .from('mvp_votes')
        .select('player_name, user_id')
        .eq('match_id', matchId)

      const voteCount: Record<string, number> = {}
      for (const v of allVotes || []) {
        voteCount[v.player_name] = (voteCount[v.player_name] || 0) + 1
      }

      // Combine players: those with events + those already voted for
      const allPlayers = Array.from(
        new Set([...playersFromEvents, ...Object.keys(voteCount)]),
      )

      // My vote
      const mine = (allVotes || []).find((v) => v.user_id === user?.id)

      if (!cancelled) {
        setPlayers(allPlayers)
        setVotes(
          allPlayers.map((p) => ({
            playerName: p,
            votes: voteCount[p] || 0,
          })),
        )
        setMyVote(mine?.player_name || null)
        setLoading(false)
      }
    }

    init()

    // Realtime subscription
    const channel = supabase
      .channel(`mvp_votes:${matchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mvp_votes', filter: `match_id=eq.${matchId}` },
        () => init(),
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [matchId])

  async function handleVote(playerName: string) {
    if (!userId) {
      window.location.href = '/ca/login'
      return
    }

    const supabase = createClient()

    if (myVote === playerName) return

    if (myVote) {
      // Update existing vote
      await supabase
        .from('mvp_votes')
        .update({ player_name: playerName })
        .eq('user_id', userId)
        .eq('match_id', matchId)
    } else {
      await supabase
        .from('mvp_votes')
        .insert({ user_id: userId, match_id: matchId, player_name: playerName })
    }
    setMyVote(playerName)
  }

  if (loading) {
    return (
      <div>
        <div className="eyebrow mb-4">🏆 MVP DEL PARTIT</div>
        <div className="card py-8 text-center eyebrow">CARREGANT...</div>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div>
        <div className="eyebrow mb-4">🏆 MVP DEL PARTIT</div>
        <div className="card py-8 text-center">
          <p className="eyebrow">SENSE CANDIDATS</p>
          <p className="font-sans text-xs text-ink3 mt-2">
            No hi ha gols registrats en aquest partit
          </p>
        </div>
      </div>
    )
  }

  const totalVotes = votes.reduce((sum, p) => sum + p.votes, 0)
  const maxVotes = Math.max(...votes.map((p) => p.votes), 0)
  const sorted = [...votes].sort((a, b) => b.votes - a.votes)

  return (
    <div>
      <div className="eyebrow mb-4">🏆 MVP DEL PARTIT · {totalVotes} vots</div>

      <div className="flex flex-col gap-2">
        {sorted.map((player) => {
          const pct = totalVotes > 0 ? (player.votes / totalVotes) * 100 : 0
          const isTop = player.votes === maxVotes && maxVotes > 0
          const isSelected = myVote === player.playerName

          return (
            <button
              key={player.playerName}
              onClick={() => handleVote(player.playerName)}
              className={`text-left p-3 border transition-colors ${
                isSelected
                  ? 'border-accent bg-accent/5'
                  : isTop
                  ? 'border-neon bg-neon/10'
                  : 'border-border bg-card hover:border-accent'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div
                    className={`font-display font-black uppercase text-sm tracking-tight truncate ${
                      isTop ? 'text-neon' : 'text-ink'
                    }`}
                  >
                    {player.playerName}
                  </div>
                  {isSelected && (
                    <div className="font-mono text-[9px] uppercase text-accent mt-0.5">
                      ★ EL TEU VOT
                    </div>
                  )}
                </div>
                <div className="text-right ml-2">
                  <div
                    className={`font-display font-black text-2xl tabular-nums leading-none ${
                      isTop ? 'text-neon' : 'text-accent'
                    }`}
                  >
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

      {!userId && (
        <p className="mt-4 text-center eyebrow">INICIA SESSIÓ PER VOTAR</p>
      )}
    </div>
  )
}
