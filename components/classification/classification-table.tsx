'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { FormIndicator } from './form-indicator'
import { PositionBadge } from './position-badge'
import { Skeleton } from '@/components/ui/skeleton'

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
    setLoading(true)
    setError(null)

    fetch(`/api/scraper/clasificacion?season=${season}&sport=${sport}&category=${category}&group=${group}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error)
        setData(json.data || [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
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
          <tr className="border-b border-white/10 text-left text-xs text-muted uppercase tracking-wider">
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
                  border-b border-border/50 transition-colors hover:bg-white/[0.03]
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
