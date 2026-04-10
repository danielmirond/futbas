'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { FormIndicator } from './form-indicator'
import { PositionBadge } from './position-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'

type FormResult = 'W' | 'D' | 'L'

interface TeamRow {
  position: number
  teamName: string
  teamSlug: string
  points: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  form: FormResult[]
  zone?: string
}

interface ClassificationTableProps {
  season?: string
  sport?: string
  category?: string
  group?: string
}

export function ClassificationTable({
  season = '2526',
  sport = 'futbol-11',
  category = 'primera-catalana',
  group = 'grup-1',
}: ClassificationTableProps = {}) {
  const t = useTranslations('classification')
  const [data, setData] = useState<TeamRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchFromSupabase() {
      const supabase = createClient()

      // Map URL slugs to display names
      const categoryName = category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const groupName = group.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

      // Find competition
      const { data: comp, error: compErr } = await supabase
        .from('competitions')
        .select('id')
        .eq('category', categoryName)
        .eq('group_name', groupName)
        .eq('season', season)
        .maybeSingle()

      if (compErr || !comp) {
        throw new Error('No s\'ha trobat la competició')
      }

      // Get teams for this competition ordered by position
      const { data: teams, error: teamsErr } = await supabase
        .from('teams')
        .select('*')
        .eq('competition_id', comp.id)
        .order('position', { ascending: true })

      if (teamsErr) throw new Error(teamsErr.message)

      const rows: TeamRow[] = (teams || []).map((t: any) => {
        const totalTeams = teams?.length || 16
        let zone: string | undefined
        if (t.position <= 1) zone = 'promotion'
        else if (t.position <= 4) zone = 'playoff'
        else if (t.position > totalTeams - 2) zone = 'relegation'

        return {
          position: t.position,
          teamName: t.team_name,
          teamSlug: t.team_name.toLowerCase().replace(/\s+/g, '-'),
          points: t.points,
          played: t.played,
          won: t.won,
          drawn: t.drawn,
          lost: t.lost,
          goalsFor: t.goals_for,
          goalsAgainst: t.goals_against,
          form: (t.form || []) as ('W' | 'D' | 'L')[],
          zone,
        }
      })

      if (!cancelled) setData(rows)
    }

    fetchFromSupabase()
      .catch(err => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))

    return () => { cancelled = true }
  }, [season, sport, category, group])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 16 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="card text-loss text-sm">{error}</div>
  }

  if (data.length === 0) {
    return <div className="card text-muted text-sm">No hi ha dades de classificació.</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-sans">
        <thead>
          <tr className="border-b border-ink/10 text-left text-xs text-muted uppercase tracking-wider">
            <th className="py-3 px-2 w-10">Pos</th>
            <th className="py-3 px-2">{t('team')}</th>
            <th className="py-3 px-2 text-center w-10">PJ</th>
            <th className="py-3 px-2 text-center w-10">PG</th>
            <th className="py-3 px-2 text-center w-10">PE</th>
            <th className="py-3 px-2 text-center w-10">PP</th>
            <th className="py-3 px-2 text-center w-10">GF</th>
            <th className="py-3 px-2 text-center w-10">GC</th>
            <th className="py-3 px-2 text-center w-10">DG</th>
            <th className="py-3 px-2 text-center w-12 font-bold">Pts</th>
            <th className="py-3 px-2">{t('form')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const isPromotion = row.zone === 'promotion'
            const isPlayoff = row.zone === 'playoff'
            const isRelegation = row.zone === 'relegation'
            const gd = row.goalsFor - row.goalsAgainst

            return (
              <tr
                key={row.teamSlug || row.teamName}
                className={`
                  border-b border-border/50 transition-colors hover:bg-ink/[0.03]
                  ${i % 2 === 0 ? 'bg-card' : 'bg-surface'}
                  ${isPromotion ? 'border-l-2 border-l-win' : ''}
                  ${isPlayoff ? 'border-l-2 border-l-accent' : ''}
                  ${isRelegation ? 'border-l-2 border-l-loss' : ''}
                `}
              >
                <td className="py-2.5 px-2">
                  <PositionBadge position={row.position} />
                </td>
                <td className="py-2.5 px-2 font-medium text-ink whitespace-nowrap">
                  {row.teamName}
                </td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.played}</td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.won}</td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.drawn}</td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.lost}</td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.goalsFor}</td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.goalsAgainst}</td>
                <td className="py-2.5 px-2 text-center tabular-nums font-medium">
                  <span className={gd > 0 ? 'text-win' : gd < 0 ? 'text-loss' : 'text-muted'}>
                    {gd > 0 ? `+${gd}` : gd}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center tabular-nums font-bold text-ink">{row.points}</td>
                <td className="py-2.5 px-2">
                  <FormIndicator form={row.form} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
