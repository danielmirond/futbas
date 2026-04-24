'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ClubCard } from './club-card'
import { Skeleton } from '@/components/ui/skeleton'

interface Club {
  id: string
  name: string
  fcf_code: string | null
  delegation: string | null
  municipality: string | null
  primary_color: string | null
  secondary_color: string | null
}

// Deterministic color palette derived from club name hash
const PALETTE = [
  { p: '#37003C', s: '#FF2882' },
  { p: '#00FF85', s: '#37003C' },
  { p: '#FF2882', s: '#0A0A0A' },
  { p: '#FFFFFF', s: '#37003C' },
  { p: '#0A0A0A', s: '#FFFFFF' },
  { p: '#1B4FFF', s: '#FFFFFF' },
  { p: '#A16207', s: '#0A0A0A' },
  { p: '#15803D', s: '#FFFFFF' },
]

function hashColors(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

export function ClubDirectory() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function fetchClubs() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, fcf_code, delegation, municipality, primary_color, secondary_color')
        .order('name', { ascending: true })
        .limit(200)

      if (error) throw new Error(error.message)
      if (!cancelled) setClubs(data || [])
    }

    fetchClubs()
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!search) return clubs
    const q = search.toLowerCase()
    return clubs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.delegation?.toLowerCase().includes(q) ||
        c.municipality?.toLowerCase().includes(q),
    )
  }, [clubs, search])

  if (loading) {
    return (
      <div>
        <Skeleton className="h-12 w-full mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="card text-loss text-sm">{error}</div>
  }

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`CERCAR CLUB... (${clubs.length} clubs)`}
        className="w-full border border-border px-4 py-3 text-sm font-mono uppercase tracking-wider bg-card text-ink placeholder:text-ink3 focus:outline-none focus:border-accent mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((club) => {
          const colors = club.primary_color
            ? { p: club.primary_color, s: club.secondary_color || '#FFFFFF' }
            : hashColors(club.name)
          return (
            <ClubCard
              key={club.id}
              id={club.id}
              name={club.name}
              delegation={club.delegation || 'FCF'}
              municipality={club.municipality || ''}
              primaryColor={colors.p}
              secondaryColor={colors.s}
            />
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center eyebrow py-12">Cap club trobat.</p>
      )}
    </div>
  )
}
