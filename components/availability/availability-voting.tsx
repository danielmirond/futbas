'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'yes' | 'no' | 'maybe' | 'pending'

interface AvailabilityVotingProps {
  matchId: string
}

interface UserAvail {
  id: string
  user_id: string
  status: Status
  note: string | null
  user?: { display_name: string | null }
}

export function AvailabilityVoting({ matchId }: AvailabilityVotingProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const [myStatus, setMyStatus] = useState<Status>('pending')
  const [votes, setVotes] = useState<UserAvail[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      setUserId(user?.id || null)

      const { data } = await supabase
        .from('availability')
        .select('id, user_id, status, note, user:users(display_name)')
        .eq('match_id', matchId)

      const rows = (data || []) as unknown as UserAvail[]
      if (!cancelled) {
        setVotes(rows)
        const mine = rows.find((r) => r.user_id === user?.id)
        if (mine) setMyStatus(mine.status)
        setLoading(false)
      }
    }

    init()

    const channel = supabase
      .channel(`availability:${matchId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'availability', filter: `match_id=eq.${matchId}` },
        () => init(),
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [matchId])

  async function handleVote(status: Status) {
    if (!userId) {
      window.location.href = '/ca/login'
      return
    }

    const supabase = createClient()
    const existing = votes.find((v) => v.user_id === userId)

    if (existing) {
      await supabase
        .from('availability')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('availability')
        .insert({ user_id: userId, match_id: matchId, status })
    }
    setMyStatus(status)
  }

  const counts = {
    yes: votes.filter((v) => v.status === 'yes').length,
    no: votes.filter((v) => v.status === 'no').length,
    maybe: votes.filter((v) => v.status === 'maybe').length,
  }

  if (loading) {
    return (
      <div>
        <div className="eyebrow mb-4">✅ DISPONIBILITAT</div>
        <div className="card py-8 text-center eyebrow">CARREGANT...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="eyebrow mb-4">✅ DISPONIBILITAT · {votes.length} jugadors</div>

      {/* Summary counters */}
      <div className="grid grid-cols-3 gap-[1px] bg-border mb-4">
        <div className="bg-card p-4 text-center border-t-[3px] border-t-neon">
          <div className="font-display font-black text-3xl text-neon tabular-nums leading-none">{counts.yes}</div>
          <div className="eyebrow mt-1">SÍ</div>
        </div>
        <div className="bg-card p-4 text-center border-t-[3px] border-t-loss">
          <div className="font-display font-black text-3xl text-loss tabular-nums leading-none">{counts.no}</div>
          <div className="eyebrow mt-1">NO</div>
        </div>
        <div className="bg-card p-4 text-center border-t-[3px] border-t-[#F5C800]">
          <div className="font-display font-black text-3xl text-[#b88a00] tabular-nums leading-none">{counts.maybe}</div>
          <div className="eyebrow mt-1">POTSER</div>
        </div>
      </div>

      {/* Your response buttons */}
      <div className="bg-primary p-4 mb-4">
        <div className="eyebrow-light mb-3">LA TEVA RESPOSTA</div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleVote('yes')}
            className={`font-display font-black uppercase tracking-wider text-sm py-3 border-2 transition-all ${
              myStatus === 'yes'
                ? 'bg-neon text-primary border-neon'
                : 'bg-transparent text-neon border-neon/40 hover:border-neon'
            }`}
          >
            ✓ SÍ
          </button>
          <button
            onClick={() => handleVote('no')}
            className={`font-display font-black uppercase tracking-wider text-sm py-3 border-2 transition-all ${
              myStatus === 'no'
                ? 'bg-loss text-white border-loss'
                : 'bg-transparent text-loss border-loss/40 hover:border-loss'
            }`}
          >
            ✗ NO
          </button>
          <button
            onClick={() => handleVote('maybe')}
            className={`font-display font-black uppercase tracking-wider text-sm py-3 border-2 transition-all ${
              myStatus === 'maybe'
                ? 'bg-[#F5C800] text-primary border-[#F5C800]'
                : 'bg-transparent text-[#F5C800] border-[#F5C800]/40 hover:border-[#F5C800]'
            }`}
          >
            ? POTSER
          </button>
        </div>
      </div>

      {/* List of respondents */}
      {votes.length > 0 && (
        <div className="bg-card border border-border divide-y divide-border">
          {votes.map((v) => (
            <div key={v.id} className="p-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center font-display font-black text-[10px] text-white flex-shrink-0">
                {(v.user?.display_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-sm text-ink truncate">
                  {v.user?.display_name || 'Anònim'}
                </div>
              </div>
              <span
                className={
                  v.status === 'yes'
                    ? 'pill pill-green'
                    : v.status === 'no'
                    ? 'pill pill-red'
                    : 'pill pill-yellow'
                }
              >
                {v.status === 'yes' ? '✓ SÍ' : v.status === 'no' ? '✗ NO' : '? POTSER'}
              </span>
            </div>
          ))}
        </div>
      )}

      {!userId && (
        <p className="mt-4 text-center eyebrow">INICIA SESSIÓ PER RESPONDRE</p>
      )}
    </div>
  )
}
