'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── TIPOS ────────────────────────────────────────────────────
interface Match {
  // Campos normalizados — la API puede usar distintos nombres
  id?: string | number
  time?: string          // "20:00", "21:45"
  hora?: string
  hour?: string
  homeTeam?: string
  home_team?: string
  local?: string
  home?: string
  awayTeam?: string
  away_team?: string
  visitante?: string
  away?: string
  competition?: string
  competicion?: string
  league?: string
  liga?: string
  channels?: string[]
  canales?: string[]
  tv?: string | string[]
  channel?: string
  streaming?: string[]
  date?: string
  fecha?: string
  // raw fallback
  [key: string]: unknown
}

interface ApiResponse {
  matches?: Match[]
  raw?: unknown
  endpoint?: string
  count?: number
  error?: string
  date?: string
}

// ─── NORMALIZAR PARTIDO ───────────────────────────────────────
function normalize(m: Match) {
  const time       = m.time || m.hora || m.hour || '??:??'
  const home       = m.homeTeam || m.home_team || m.local || m.home || '—'
  const away       = m.awayTeam || m.away_team || m.visitante || m.away || '—'
  const competition = m.competition || m.competicion || m.league || m.liga || ''
  
  let channels: string[] = []
  if (Array.isArray(m.channels))   channels = m.channels
  else if (Array.isArray(m.canales)) channels = m.canales
  else if (Array.isArray(m.tv))    channels = m.tv
  else if (typeof m.tv === 'string' && m.tv) channels = [m.tv]
  else if (typeof m.channel === 'string' && m.channel) channels = [m.channel]

  if (Array.isArray(m.streaming)) channels = [...channels, ...m.streaming]

  return { time, home, away, competition, channels }
}

// ─── CANAL → COLOR ────────────────────────────────────────────
function chColor(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('dazn'))      return '#d4a017'
  if (n.includes('laliga') || n.includes('movistar')) return '#003087'
  if (n.includes('gol'))       return '#e63946'
  if (n.includes('teledeporte') || n.includes('tdp')) return '#e63946'
  if (n.includes('antena') || n.includes('a3')) return '#ff6b00'
  if (n.includes('la 1') || n.includes('la1')) return '#0057a8'
  if (n.includes('vamos'))     return '#00a79d'
  if (n.includes('champions')) return '#1a237e'
  if (n.includes('streaming') || n.includes('youtube') || n.includes('twitch')) return '#6441a5'
  return '#4a4a5a'
}

// ─── UTILS ───────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2,'0') }
function nowStr() {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
function isPast(time: string) {
  if (!time || time === '??:??') return false
  return time < nowStr()
}

// ─── COMPONENTE ───────────────────────────────────────────────
export default function GuiaFutbolTV() {
  const [data, setData]       = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [clock, setClock]     = useState(nowStr())
  const [filter, setFilter]   = useState('all')   // 'all' | 'free' | 'pay'
  const [rawMode, setRawMode] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setClock(nowStr()), 30000)
    return () => clearInterval(t)
  }, [])

  const load = useCallback(async (date?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = date ? `/api/matches?date=${date}` : '/api/matches'
      const res = await fetch(url)
      const json = await res.json()
      setData(json)
      if (json.error) setError(json.error)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const today    = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const dateStr  = new Date().toLocaleDateString('es-ES', { weekday:'long', day:'numeric', month:'long' })

  const matches = data?.matches || []

  // Filtrar
  const FREE_KEYWORDS = ['gol','la 1','la1','teledeporte','tdp','antena','lasexta','la sexta','cuatro','telecinco','real madrid tv']
  const filtered = matches.filter(m => {
    const n = normalize(m)
    if (filter === 'free') {
      return n.channels.some(c => FREE_KEYWORDS.some(k => c.toLowerCase().includes(k)))
    }
    if (filter === 'pay') {
      return n.channels.some(c => ['dazn','movistar','laliga','vamos','champions'].some(k => c.toLowerCase().includes(k)))
    }
    return true
  })

  // Agrupar por competición
  const grouped: Record<string, typeof filtered> = {}
  filtered.forEach(m => {
    const n = normalize(m)
    const key = n.competition || 'Otros partidos'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(m)
  })

  // ── STYLES ──
  const c = {
    bg:      '#0b0c10',
    surface: '#12141a',
    border:  '#1e2030',
    red:     '#e63946',
    muted:   '#6b6d7a',
    text:    '#e8e8ec',
  }

  return (
    <div style={{ fontFamily:"'DM Sans',system-ui,sans-serif", background:c.bg, color:c.text, minHeight:'100vh' }}>
      <style>{`
        *{box-sizing:border-box}
        @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(230,57,70,.7)}70%{box-shadow:0 0 0 8px rgba(230,57,70,0)}100%{box-shadow:0 0 0 0 rgba(230,57,70,0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#1e2030;border-radius:2px}
        a{color:inherit;text-decoration:none}
      `}</style>

      {/* HEADER */}
      <div style={{ background:'rgba(11,12,16,.97)', borderBottom:`1px solid ${c.border}`, padding:'14px 20px', display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ background:c.red, color:'#fff', fontSize:10, fontWeight:800, padding:'3px 8px', borderRadius:4, letterSpacing:1 }}>⚽</span>
          <span style={{ fontWeight:900, fontSize:18, letterSpacing:-0.5, color:'#fff' }}>Fútbol en la TV</span>
          <span style={{ fontSize:11, color:c.muted }}>España</span>
        </div>
        <span style={{ fontSize:13, fontWeight:700, color:c.muted }}>{clock}</span>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5, fontSize:10, fontWeight:800, color:c.red, textTransform:'uppercase', letterSpacing:1 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:c.red, display:'inline-block', animation:'pulse 2s infinite' }}/>
          En directo · WOSTI API
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ padding:'12px 20px', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', borderBottom:`1px solid ${c.border}` }}>
        {/* fecha */}
        <div style={{ display:'flex', background:c.surface, border:`1px solid ${c.border}`, borderRadius:8, padding:3, gap:2 }}>
          {[[today,'Hoy'],[tomorrow,'Mañana']].map(([d,l]) => (
            <button key={d} onClick={() => load(d)}
              style={{ background:'transparent', color:c.muted, border:'none', borderRadius:6, padding:'5px 13px', cursor:'pointer', fontWeight:700, fontSize:11, letterSpacing:0.8, textTransform:'uppercase', fontFamily:'inherit' }}>
              {l}
            </button>
          ))}
        </div>
        {/* filtro */}
        <div style={{ display:'flex', background:c.surface, border:`1px solid ${c.border}`, borderRadius:8, padding:3, gap:2 }}>
          {[['all','Todos'],['free','En abierto'],['pay','De pago']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ background:filter===v?c.red:'transparent', color:filter===v?'#fff':c.muted, border:'none', borderRadius:6, padding:'5px 12px', cursor:'pointer', fontWeight:700, fontSize:11, letterSpacing:0.5, textTransform:'uppercase', fontFamily:'inherit', transition:'all .15s' }}>
              {l}
            </button>
          ))}
        </div>
        <span style={{ fontSize:10, color:'#444', marginLeft:'auto' }}>
          {data?.count || 0} partidos · {data?.endpoint || '—'}
        </span>
        <button onClick={() => load()} style={{ background:c.surface, border:`1px solid ${c.border}`, color:c.muted, fontSize:11, padding:'6px 13px', borderRadius:8, cursor:'pointer', fontFamily:'inherit' }}>
          ↻ Actualizar
        </button>
      </div>

      {/* CONTENT */}
      <div style={{ padding:'16px 20px 60px', maxWidth:900, margin:'0 auto' }}>
        
        {/* Estado: cargando */}
        {loading && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:c.muted }}>
            <div style={{ fontSize:28, marginBottom:12, display:'inline-block', animation:'spin 1s linear infinite' }}>⏳</div>
            <p style={{ fontSize:14 }}>Cargando partidos desde WOSTI API...</p>
          </div>
        )}

        {/* Estado: error */}
        {error && !loading && (
          <div style={{ textAlign:'center', padding:'48px 20px' }}>
            <p style={{ fontSize:28, marginBottom:10 }}>⚠️</p>
            <p style={{ fontSize:15, color:'#ccc', marginBottom:6 }}>Error al conectar con la API</p>
            <p style={{ fontSize:12, color:c.muted, marginBottom:16, maxWidth:400, margin:'0 auto 16px' }}>{error}</p>
            <p style={{ fontSize:11, color:'#555', marginBottom:12 }}>
              Comprueba que <code style={{ background:c.surface, padding:'2px 6px', borderRadius:4 }}>RAPIDAPI_KEY</code> está configurada en <code style={{ background:c.surface, padding:'2px 6px', borderRadius:4 }}>.env.local</code>
            </p>
            <a href="/api/debug" target="_blank" style={{ fontSize:11, color:'#888', textDecoration:'underline' }}>
              → Ver diagnóstico completo de endpoints
            </a>
          </div>
        )}

        {/* Respuesta raw (modo debug) */}
        {data?.raw && !loading && (
          <div>
            <div style={{ background:'#0d0e14', border:`1px solid ${c.border}`, borderRadius:10, padding:'14px 16px', marginBottom:16 }}>
              <p style={{ fontSize:12, color:'#f4c430', marginBottom:8, fontWeight:700 }}>
                ⚠️ La API respondió con formato desconocido — endpoint: <code>{data.endpoint}</code>
              </p>
              <p style={{ fontSize:11, color:c.muted, marginBottom:10 }}>
                Abre <a href="/api/debug" target="_blank" style={{ color:'#888', textDecoration:'underline' }}>/api/debug</a> para ver todos los endpoints disponibles y ajusta el normalizador en <code>app/api/matches/route.ts</code>
              </p>
              <button onClick={() => setRawMode(!rawMode)} style={{ fontSize:11, color:'#888', background:'transparent', border:`1px solid ${c.border}`, padding:'4px 10px', borderRadius:6, cursor:'pointer' }}>
                {rawMode ? 'Ocultar' : 'Ver'} respuesta raw
              </button>
            </div>
            {rawMode && (
              <pre style={{ fontSize:11, color:'#aaa', background:'#0d0e14', border:`1px solid ${c.border}`, borderRadius:10, padding:14, overflow:'auto', maxHeight:400 }}>
                {JSON.stringify(data.raw, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Sin partidos */}
        {!loading && !error && matches.length === 0 && !data?.raw && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:c.muted }}>
            <p style={{ fontSize:40, marginBottom:12 }}>📅</p>
            <p style={{ fontSize:16, color:'#ccc', marginBottom:6 }}>No hay partidos televisados hoy</p>
            <p style={{ fontSize:13 }}>Prueba a ver la programación de mañana</p>
          </div>
        )}

        {/* LISTA DE PARTIDOS agrupada por competición */}
        {!loading && !error && Object.entries(grouped).length > 0 && (
          <div>
            <div style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:2, color:'#444', marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
              {dateStr} — {filtered.length} partido{filtered.length !== 1 ? 's' : ''}
              <span style={{ flex:1, height:1, background:c.border, display:'block' }}/>
            </div>

            {Object.entries(grouped).map(([comp, cmatches]) => (
              <div key={comp} style={{ marginBottom:24 }}>
                {/* Cabecera competición */}
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${c.border}` }}>
                  <span style={{ fontSize:14 }}>🏆</span>
                  <span style={{ fontWeight:800, fontSize:13, color:'#ccc', textTransform:'uppercase', letterSpacing:0.5 }}>{comp}</span>
                  <span style={{ fontSize:11, color:'#444', marginLeft:'auto' }}>{cmatches.length} partido{cmatches.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Filas de partidos */}
                {cmatches.map((m, i) => {
                  const n = normalize(m)
                  const past = isPast(n.time)
                  return (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', gap:12,
                      padding:'11px 14px', marginBottom:6,
                      background:c.surface,
                      border:`1px solid ${c.border}`,
                      borderLeft:`3px solid ${past ? '#333' : c.red}`,
                      borderRadius:10,
                      opacity: past ? 0.5 : 1,
                    }}>
                      {/* Hora */}
                      <div style={{ width:46, flexShrink:0, textAlign:'center' }}>
                        <span style={{ fontWeight:800, fontSize:15, color: past ? c.muted : '#fff', fontVariantNumeric:'tabular-nums' }}>
                          {n.time}
                        </span>
                      </div>

                      {/* Partido */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:14, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {n.home} <span style={{ color:c.muted, fontWeight:400 }}>vs</span> {n.away}
                        </div>
                        {n.competition && (
                          <div style={{ fontSize:11, color:c.muted, marginTop:1 }}>{n.competition}</div>
                        )}
                      </div>

                      {/* Canales */}
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'flex-end', flexShrink:0, maxWidth:240 }}>
                        {n.channels.length > 0 ? n.channels.map((ch, ci) => (
                          <span key={ci} style={{
                            fontSize:10, fontWeight:700,
                            padding:'3px 8px', borderRadius:4,
                            background:`${chColor(ch)}22`,
                            color: chColor(ch),
                            border:`1px solid ${chColor(ch)}44`,
                            whiteSpace:'nowrap',
                          }}>{ch}</span>
                        )) : (
                          <span style={{ fontSize:11, color:'#444', fontStyle:'italic' }}>Sin TV confirmada</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop:`1px solid ${c.border}`, padding:'12px 20px', textAlign:'center', fontSize:10, color:'#444' }}>
        Datos: <a href="https://www.futbolenlatv.es" target="_blank" style={{ color:'#666' }}>WOSTI · futbolenlatv.es</a> · API via RapidAPI · {dateStr}
      </div>
    </div>
  )
}
