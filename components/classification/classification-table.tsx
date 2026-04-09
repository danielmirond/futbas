'use client'

import { useTranslations } from 'next-intl'
import { FormIndicator } from './form-indicator'
import { PositionBadge } from './position-badge'

type FormResult = 'W' | 'D' | 'L'

interface TeamRow {
  position: number
  team: string
  pj: number
  pg: number
  pe: number
  pp: number
  gf: number
  gc: number
  dg: number
  pts: number
  form: FormResult[]
}

const MOCK_DATA: TeamRow[] = [
  { position: 1,  team: 'CE Martinenc',        pj: 24, pg: 17, pe: 4, pp: 3, gf: 48, gc: 18, dg: 30,  pts: 55, form: ['W','W','D','W','W'] },
  { position: 2,  team: 'UE Cornellà B',       pj: 24, pg: 16, pe: 3, pp: 5, gf: 42, gc: 22, dg: 20,  pts: 51, form: ['W','D','W','W','L'] },
  { position: 3,  team: 'CF Gavà',             pj: 24, pg: 14, pe: 5, pp: 5, gf: 39, gc: 21, dg: 18,  pts: 47, form: ['D','W','W','L','W'] },
  { position: 4,  team: 'CE Europa B',         pj: 24, pg: 13, pe: 6, pp: 5, gf: 37, gc: 24, dg: 13,  pts: 45, form: ['W','L','W','W','D'] },
  { position: 5,  team: 'CF Damm',             pj: 24, pg: 12, pe: 6, pp: 6, gf: 35, gc: 25, dg: 10,  pts: 42, form: ['L','W','D','W','W'] },
  { position: 6,  team: 'UE Sants',            pj: 24, pg: 12, pe: 5, pp: 7, gf: 33, gc: 26, dg: 7,   pts: 41, form: ['W','W','L','D','W'] },
  { position: 7,  team: 'CF Badalona Futur',   pj: 24, pg: 11, pe: 5, pp: 8, gf: 30, gc: 27, dg: 3,   pts: 38, form: ['D','D','W','L','W'] },
  { position: 8,  team: 'UE Castelldefels',    pj: 24, pg: 10, pe: 6, pp: 8, gf: 28, gc: 25, dg: 3,   pts: 36, form: ['W','L','D','W','L'] },
  { position: 9,  team: "CE L'Hospitalet B",   pj: 24, pg: 9,  pe: 7, pp: 8, gf: 29, gc: 28, dg: 1,   pts: 34, form: ['L','D','W','D','W'] },
  { position: 10, team: 'FC Prat',             pj: 24, pg: 9,  pe: 5, pp: 10, gf: 26, gc: 30, dg: -4,  pts: 32, form: ['D','L','W','L','W'] },
  { position: 11, team: 'UE Sant Andreu B',    pj: 24, pg: 8,  pe: 6, pp: 10, gf: 25, gc: 31, dg: -6,  pts: 30, form: ['L','W','D','L','D'] },
  { position: 12, team: 'CF Sant Cugat',       pj: 24, pg: 7,  pe: 7, pp: 10, gf: 23, gc: 29, dg: -6,  pts: 28, form: ['D','L','L','W','D'] },
  { position: 13, team: 'CF Vilafranca',       pj: 24, pg: 7,  pe: 5, pp: 12, gf: 22, gc: 34, dg: -12, pts: 26, form: ['L','L','D','W','L'] },
  { position: 14, team: 'UE Figueres',         pj: 24, pg: 6,  pe: 5, pp: 13, gf: 20, gc: 36, dg: -16, pts: 23, form: ['L','D','L','L','W'] },
  { position: 15, team: 'CF Lloret',           pj: 24, pg: 5,  pe: 4, pp: 15, gf: 18, gc: 40, dg: -22, pts: 19, form: ['L','L','L','D','L'] },
  { position: 16, team: 'CD Roquetenc',        pj: 24, pg: 3,  pe: 5, pp: 16, gf: 14, gc: 43, dg: -29, pts: 14, form: ['L','D','L','L','L'] },
]

export function ClassificationTable() {
  const t = useTranslations('classification')

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
          {MOCK_DATA.map((row, i) => {
            const isPromotion = row.position <= 2
            const isRelegation = row.position >= 15

            return (
              <tr
                key={row.team}
                className={`
                  border-b border-border/50 transition-colors hover:bg-ink/[0.02]
                  ${i % 2 === 0 ? 'bg-white' : 'bg-surface'}
                  ${isPromotion ? 'border-l-2 border-l-win' : ''}
                  ${isRelegation ? 'border-l-2 border-l-loss' : ''}
                `}
              >
                <td className="py-2.5 px-2">
                  <PositionBadge position={row.position} />
                </td>
                <td className="py-2.5 px-2 font-medium text-ink whitespace-nowrap">
                  {row.team}
                </td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.pj}</td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.pg}</td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.pe}</td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.pp}</td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.gf}</td>
                <td className="py-2.5 px-2 text-center tabular-nums text-muted">{row.gc}</td>
                <td className="py-2.5 px-2 text-center tabular-nums font-medium">
                  <span className={row.dg > 0 ? 'text-win' : row.dg < 0 ? 'text-loss' : 'text-muted'}>
                    {row.dg > 0 ? `+${row.dg}` : row.dg}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center tabular-nums font-bold text-ink">{row.pts}</td>
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
