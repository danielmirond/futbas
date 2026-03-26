'use client'

import { useState, useEffect, useCallback } from 'react'

type MatchRaw = Record<string, unknown>

interface ApiResponse {
  matches?: MatchRaw[]
  raw?: unknown
  endpoint?: string
  count?: number
  error?: string
  date?: string
}

function normalize(m: MatchRaw) {
  const str = (v: unknown): string => (typeof v === 'string' ? v : '')
  const time        = str(m.time)        || '??:??'
  const home        = str(m.home)        || '—'
  const away        = str(m.away)        || '—'
  const homeBadge   = str(m.homeBadge)
  const awayBadge   = str(m.awayBadge)
  const competition = str(m.competition) || ''
  const channels: string[] = Array.isArray(m.channels)
    ? (m.channels as unknown[]).map(String)
    : []
  return { time, home, away, homeBadge, awayBadge, competition, channels }
}

function chColor(name: string) {
  const n = name.toLowerCase()
  if (n.includes('dazn'))       return { bg: '#fff3cd', text: '#856404', border: '#ffc107' }
  if (n.includes('movistar') || n.includes('laliga')) return { bg: '#e8f0fe', text: '#1a56db', border: '#3f83f8' }
  if (n.includes('gol'))        return { bg: '#fde8e8', text: '#c81e1e', border: '#f05252' }
  if (n.includes('teledeporte') || n.includes('tdp')) return { bg: '#fde8e8', text: '#c81e1e', border: '#f05252' }
  if (n.includes('antena'))     return { bg: '#fff3e0', text: '#c05621', border: '#ed8936' }
  if (n.includes('la 1') || n.includes('la1')) return { bg: '#ebf5fb', text: '#1a56db', border: '#3f83f8' }
  if (n.includes('vamos'))      return { bg: '#e6fffa', text: '#047481', border: '#0d9488' }
  if (n.includes('champions'))  return { bg: '#ede9fe', text: '#5521b5', border: '#7e3af2' }
  return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' }
}

function pad(n: number) { return String(n).padStart(2, '0') }
function nowStr() { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}` }
function isPast(time: string) { return time !== '??:??' && time < nowStr() }
function dur(s: string, e: string) {
  const m = (parseInt(e) * 60 + parseInt(e.split(':')[1])) - (parseInt(s) * 60 + parseInt(s.split(':')[1]))
  return m > 0 ? (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`) : ''
}

export default function GuiaFutbolMD() {
  const [data, setData]       = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [clock, setClock]     = useState(nowStr())
  const [filter, setFilter]   = useState('all')
  const [rawMode, setRawMode] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setClock(nowStr()), 30000)
    return () => clearInterval(t)
  }, [])

  const load = useCallback(async (date?: string) => {
    setLoading(true); setError('')
    try {
      const res  = await fetch(date ? `/api/matches?date=${date}` : '/api/matches')
      const json: ApiResponse = await res.json()
      setData(json)
      if (json.error) setError(json.error)
    } catch (e) { setError(String(e)) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const dateStr  = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const matches = data?.matches || []
  const FREE_KW = ['gol', 'la 1', 'la1', 'teledeporte', 'tdp', 'antena', 'lasexta', 'la sexta', 'cuatro', 'telecinco']
  const filtered = matches.filter(m => {
    const n = normalize(m)
    if (filter === 'free') return n.channels.some(c => FREE_KW.some(k => c.toLowerCase().includes(k)))
    if (filter === 'pay')  return n.channels.some(c => ['dazn', 'movistar', 'laliga', 'vamos'].some(k => c.toLowerCase().includes(k)))
    return true
  })
  const grouped: Record<string, MatchRaw[]> = {}
  filtered.forEach(m => {
    const key = normalize(m).competition || 'Otros partidos'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  // ── MD COLOR SYSTEM ──
  const MD = {
    red:      '#CC0000',
    redLight: '#fde8e8',
    yellow:   '#FFD700',
    black:    '#1a1a1a',
    darkGray: '#333333',
    gray:     '#666666',
    lightGray:'#f5f5f5',
    border:   '#e5e5e5',
    white:    '#ffffff',
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    background:  active ? MD.red : MD.white,
    color:       active ? MD.white : MD.darkGray,
    border:      `1px solid ${active ? MD.red : MD.border}`,
    borderRadius: 2,
    padding:     '5px 14px',
    cursor:      'pointer',
    fontWeight:  active ? 700 : 500,
    fontSize:    12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontFamily:  'inherit',
    transition:  'all .15s',
  })

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: MD.white, color: MD.black, minHeight: '100vh', maxWidth: 860, margin: '0 auto' }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
        a { color: inherit; text-decoration: none; }
      `}</style>

      {/* ── HEADER estilo MD ── */}
      <div style={{ borderBottom: `3px solid ${MD.red}`, paddingBottom: 0 }}>
        {/* Barra superior negra */}
        <div style={{ background: '#111', padding: '7px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 5, height: 26, background: MD.red, transform: 'skewX(-12deg)', marginRight: 8, flexShrink: 0 }} />
            <span style={{ fontWeight: 900, fontSize: 19, color: MD.white, letterSpacing: -0.5, fontStyle: 'italic', fontFamily: "'Arial Black', Arial, sans-serif", lineHeight: 1 }}>MUNDO</span>
            <span style={{ fontWeight: 900, fontSize: 19, color: MD.yellow, letterSpacing: -0.5, fontStyle: 'italic', fontFamily: "'Arial Black', Arial, sans-serif", lineHeight: 1 }}>DEPORTIVO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#aaa' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: MD.red, display: 'inline-block', boxShadow: '0 0 4px #CC0000' }} />
            EN DIRECTO · {clock}
          </div>
        </div>

        {/* Título sección */}
        <div style={{ padding: '10px 16px 8px', borderTop: `1px solid ${MD.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: MD.red, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3 }}>
            ⚽ Fútbol · Guía TV
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: MD.black, margin: 0, lineHeight: 1.2, fontStyle: 'italic' }}>
            Fútbol en la TV hoy en España
          </h1>
          <p style={{ fontSize: 13, color: MD.gray, margin: '4px 0 0', textTransform: 'capitalize' }}>{dateStr}</p>
        </div>
      </div>

      {/* ── CONTROLES ── */}
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${MD.border}`, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', background: MD.lightGray }}>
        {/* Fecha */}
        <div style={{ display: 'flex', gap: 4 }}>
          {([[today, 'Hoy'], [tomorrow, 'Mañana']] as [string, string][]).map(([d, l]) => (
            <button key={d} onClick={() => load(d)} style={tabBtn(false)}>{l}</button>
          ))}
        </div>
        {/* Filtro */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          {(['all', 'free', 'pay'] as const).map(v => {
            const labels = { all: 'Todos', free: 'En abierto', pay: 'De pago' }
            return <button key={v} onClick={() => setFilter(v)} style={tabBtn(filter === v)}>{labels[v]}</button>
          })}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: MD.gray }}>
            {data?.count ?? 0} partidos
          </span>
          <button onClick={() => load()} style={{ ...tabBtn(false), background: 'transparent', border: `1px solid ${MD.border}` }}>
            ↻
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: '0 16px 48px' }}>

        {/* Cargando */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: MD.gray }}>
            <div style={{ fontSize: 24, display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: 10 }}>⏳</div>
            <p style={{ fontSize: 13, margin: 0 }}>Cargando partidos...</p>
          </div>
        )}

        {/* Error */}
        {(!!error && !loading) && (
          <div style={{ padding: '20px 16px', margin: '16px 0', background: MD.redLight, borderLeft: `4px solid ${MD.red}`, borderRadius: 2 }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: MD.red, margin: '0 0 4px' }}>⚠️ Error al conectar con la API</p>
            <p style={{ fontSize: 12, color: MD.darkGray, margin: '0 0 8px' }}>{error}</p>
            <a href="/api/debug" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: MD.red, textDecoration: 'underline' }}>
              → Ver diagnóstico de endpoints
            </a>
          </div>
        )}

        {/* Raw debug */}
        {(data?.raw !== undefined && !loading) && (
          <div style={{ padding: '16px', margin: '16px 0', background: '#fffbeb', borderLeft: `4px solid #f59e0b`, borderRadius: 2 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#92400e', margin: '0 0 6px' }}>
              ⚠️ Formato desconocido — endpoint: <code>{data.endpoint}</code>
            </p>
            <button onClick={() => setRawMode(!rawMode)} style={{ fontSize: 11, cursor: 'pointer', background: 'transparent', border: '1px solid #d97706', borderRadius: 2, padding: '3px 8px', color: '#92400e' }}>
              {rawMode ? 'Ocultar' : 'Ver'} respuesta raw
            </button>
            {rawMode && (
              <pre style={{ fontSize: 11, marginTop: 10, overflow: 'auto', maxHeight: 300, color: MD.darkGray }}>
                {JSON.stringify(data.raw, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Sin partidos */}
        {(!loading && !error && matches.length === 0 && data?.raw === undefined) && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: MD.gray }}>
            <p style={{ fontSize: 36, marginBottom: 8 }}>📅</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: MD.darkGray, margin: '0 0 6px' }}>No hay partidos televisados hoy</p>
            <p style={{ fontSize: 13 }}>Consulta la programación de mañana</p>
          </div>
        )}

        {/* ── LISTA DE PARTIDOS ── */}
        {(!loading && !error && Object.entries(grouped).length > 0) && (
          <div style={{ marginTop: 16 }}>
            {Object.entries(grouped).map(([comp, cmatches]) => (
              <div key={comp} style={{ marginBottom: 28 }}>

                {/* Cabecera competición — estilo MD */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `2px solid ${MD.black}`, marginBottom: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: MD.white, background: MD.red, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {comp}
                  </span>
                  <span style={{ fontSize: 11, color: MD.gray, marginLeft: 'auto' }}>
                    {cmatches.length} partido{cmatches.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Filas */}
                {cmatches.map((m, i) => {
                  const n    = normalize(m)
                  const past = isPast(n.time)
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 12px',
                      borderBottom: `1px solid ${MD.border}`,
                      background: past ? MD.lightGray : MD.white,
                      opacity: past ? 0.6 : 1,
                      borderLeft: past ? 'none' : `3px solid ${MD.red}`,
                    }}>
                      {/* Hora */}
                      <div style={{ width: 50, flexShrink: 0 }}>
                        <span style={{
                          fontWeight: 800, fontSize: 16,
                          color: past ? MD.gray : MD.red,
                          fontVariantNumeric: 'tabular-nums',
                          fontStyle: 'italic',
                        }}>
                          {n.time}
                        </span>
                        {past && <div style={{ fontSize: 9, color: MD.gray, textTransform: 'uppercase', letterSpacing: 0.5 }}>Jugado</div>}
                      </div>

                      {/* Equipos */}
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Escudo local */}
                        {n.homeBadge && (
                          <img src={n.homeBadge} alt={n.home} width={24} height={24}
                            style={{ objectFit: 'contain', flexShrink: 0 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontWeight: 700, fontSize: 14,
                            color: MD.black,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {n.home}
                            <span style={{ color: MD.gray, fontWeight: 400, margin: '0 6px', fontSize: 12 }}>vs</span>
                            {n.away}
                          </div>
                          {n.competition && (
                            <div style={{ fontSize: 11, color: MD.gray, marginTop: 1 }}>{n.competition}</div>
                          )}
                        </div>
                        {/* Escudo visitante */}
                        {n.awayBadge && (
                          <img src={n.awayBadge} alt={n.away} width={24} height={24}
                            style={{ objectFit: 'contain', flexShrink: 0, marginLeft: 'auto' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        )}
                      </div>

                      {/* Canales */}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', flexShrink: 0, maxWidth: 220 }}>
                        {n.channels.length > 0
                          ? n.channels.map((ch, ci) => {
                              const col = chColor(ch)
                              return (
                                <span key={ci} style={{
                                  fontSize: 10, fontWeight: 700,
                                  padding: '3px 7px',
                                  background: col.bg,
                                  color: col.text,
                                  border: `1px solid ${col.border}`,
                                  borderRadius: 2,
                                  whiteSpace: 'nowrap',
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.3,
                                }}>
                                  {ch}
                                </span>
                              )
                            })
                          : <span style={{ fontSize: 11, color: MD.gray, fontStyle: 'italic' }}>Sin TV confirmada</span>
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: `2px solid ${MD.black}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: MD.gray }}>
          Datos: <a href="https://www.futbolenlatv.es" target="_blank" rel="noreferrer" style={{ color: MD.red }}>futbolenlatv.es</a> · WOSTI API
        </span>
        <span style={{ fontSize: 10, color: MD.gray }}>{dateStr}</span>
      </div>
    </div>
  )
}
