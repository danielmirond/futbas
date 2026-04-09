'use client'

import { useState, useEffect, useMemo, useRef } from 'react'

/* ── Types ───────────────────────────────────────────────────── */
interface Score { h: number; a: number; st: string; min?: number }
interface Match {
  id: number; time: string; date: string; home: string; away: string
  comp: string; ch: string[]; score?: Score
}
interface TableRow {
  pos: number; team: string; pj: number; pts: number
  g: number; e: number; p: number; gf: number; gc: number; dg: number
  f: string[]
}
interface CompResult { d: string; h: string; sh: number; sa: number; a: string }
interface CompNext { d: string; h: string; a: string; tv: string }
interface CompData {
  emoji: string; table: TableRow[]; results: CompResult[]; next: CompNext[]
}

/* ── Date helpers ────────────────────────────────────────────── */
const today = new Date().toISOString().split('T')[0]

/* No demo data — all matches come from WOSTI API */

/* Competitions — all supported, data loaded from /api/standings */
const COMP_EMOJI: Record<string, string> = {
  'LaLiga EA Sports': '🇪🇸', 'LaLiga Hypermotion': '🇪🇸',
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Bundesliga': '🇩🇪', 'Serie A': '🇮🇹', 'Ligue 1': '🇫🇷',
  'Champions League': '🏆', 'Europa League': '🏆', 'Conference League': '🏆',
  'Copa del Rey': '🏆', 'Supercopa': '🏆',
  'UEFA Nations League': '🌍', 'Amistoso': '🌍', 'Clasificación Mundial': '🌍',
  'Liga MX': '🇲🇽',
}
const COMP_LEAGUE_ID: Record<string, string> = {
  'LaLiga EA Sports': 'esp.1', 'LaLiga Hypermotion': 'esp.2',
  'Premier League': 'eng.1', 'Bundesliga': 'ger.1', 'Serie A': 'ita.1', 'Ligue 1': 'fra.1',
  'Liga MX': 'mex.1',
}
const COMPS: Record<string, CompData> = {}
for (const name of Object.keys(COMP_EMOJI)) {
  COMPS[name] = { emoji: COMP_EMOJI[name], table: [], results: [], next: [] }
}

/* ── Theme ───────────────────────────────────────────────────── */
const LIGHT = {
  red: '#CC0000', redLight: '#fde8e8', yellow: '#FFD700',
  black: '#1a1a1a', darkGray: '#333', gray: '#666',
  lightGray: '#f7f7f7', border: '#e5e5e5', white: '#fff',
  bg: '#fff', text: '#1a1a1a', cardBg: '#fff',
}
const DARK = {
  red: '#CC0000', redLight: '#2a1010', yellow: '#FFD700',
  black: '#fff', darkGray: '#ccc', gray: '#999',
  lightGray: '#1a1a1a', border: '#333', white: '#0a0a0a',
  bg: '#0a0a0a', text: '#e5e5e5', cardBg: '#161616',
}

/* ── Helpers ──────────────────────────────────────────────────── */
function pad(n: number) { return String(n).padStart(2, '0') }
function nowStr() { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}` }

function todayKey() {
  return new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-')
}

function isPast(time: string, dateStr: string) {
  if (!time || time === '??:??') return false
  const tk = todayKey()
  if (dateStr > tk) return false
  if (dateStr < tk) return true
  return time < nowStr()
}

function startsIn(time: string, dateStr: string): number {
  if (!time || time === '??:??') return Infinity
  const tk = todayKey()
  if (dateStr !== tk) return Infinity
  const [h, m] = time.split(':').map(Number)
  const now = new Date()
  const matchTime = new Date()
  matchTime.setHours(h, m, 0, 0)
  return Math.round((matchTime.getTime() - now.getTime()) / 60000)
}

function formatCountdown(mins: number): string {
  if (mins <= 0 || mins === Infinity) return ''
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/* Demo H2H data */
/* H2H data would come from a real API — empty for now */
const H2H: Record<string, { d: string; h: string; sh: number; sa: number; a: string }[]> = {}

function getH2H(home: string, away: string) {
  return H2H[`${home}|${away}`] || H2H[`${away}|${home}`] || []
}

/* CTA data for channels */
const CHANNEL_CTA: Record<string, { text: string; url: string; color: string }> = {
  'dazn': { text: 'Ver en DAZN — Prueba gratis', url: 'https://www.dazn.com/es-ES', color: '#CCFF00' },
  'movistar': { text: 'Contratar Movistar+', url: 'https://www.movistarplus.es', color: '#019DF4' },
  'm+': { text: 'Contratar Movistar+', url: 'https://www.movistarplus.es', color: '#019DF4' },
}

function getMatchCTA(channels: string[]) {
  for (const ch of channels) {
    const key = Object.keys(CHANNEL_CTA).find(k => ch.toLowerCase().includes(k))
    if (key) return CHANNEL_CTA[key]
  }
  return null
}

function formatDayHeader(dateStr: string): string {
  const tk = todayKey()
  const tmk = new Date(Date.now() + 86400000).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-')
  const label = dateStr === tk ? 'Hoy' : dateStr === tmk ? 'Mañana' : ''
  const formatted = new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  return label ? `${label} · ${formatted}` : formatted
}

function chColor(name: string) {
  const n = name.toLowerCase()
  if (n.includes('dazn'))                              return { bg: '#1a1a1a', text: '#CCFF00', border: '#333' }
  if (n.includes('movistar') || n.includes('m+'))      return { bg: '#019DF4', text: '#fff', border: '#0180c5' }
  if (n.includes('laliga'))                            return { bg: '#EE1044', text: '#fff', border: '#c50d37' }
  if (n.includes('gol'))                               return { bg: '#C8A415', text: '#fff', border: '#a68a10' }
  if (n.includes('teledeporte') || n.includes('tdp'))  return { bg: '#E86A10', text: '#fff', border: '#c45a0d' }
  if (n.includes('la 1') || n.includes('la1') || n.includes('tve')) return { bg: '#1C3A7A', text: '#fff', border: '#15306a' }
  if (n.includes('antena'))                            return { bg: '#FF6600', text: '#fff', border: '#d65500' }
  if (n.includes('sexta'))                             return { bg: '#6DBE45', text: '#fff', border: '#5aa038' }
  if (n.includes('rtve'))                              return { bg: '#E4002B', text: '#fff', border: '#bf0024' }
  if (n.includes('vamos'))                             return { bg: '#00A651', text: '#fff', border: '#008a43' }
  if (n.includes('champions'))                         return { bg: '#0D1541', text: '#fff', border: '#060c2a' }
  if (n.includes('uefa') || n.includes('ppv'))         return { bg: '#004A99', text: '#fff', border: '#003d80' }
  if (n.includes('cuatro'))                            return { bg: '#E31E24', text: '#fff', border: '#bf191e' }
  if (n.includes('telecinco'))                         return { bg: '#0066CC', text: '#fff', border: '#0055aa' }
  return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
}

function formDotColor(r: string) { return r === 'W' ? '#22c55e' : r === 'D' ? '#f59e0b' : '#ef4444' }

function zoneColor(pos: number, comp: string, total: number) {
  // Champions/promotion zone (green), Europa/playoff (blue), Conference (yellow), Relegation (red)
  if (comp.includes('LaLiga EA') || comp.includes('Premier') || comp.includes('Bundesliga') || comp.includes('Serie A') || comp.includes('Ligue 1')) {
    if (pos <= 4) return '#e8f5e9'
    if (pos <= 6) return '#e3f2fd'
    if (pos <= 7) return '#fff8e1'
    if (pos >= total - 2) return '#fde8e8'
  }
  if (comp.includes('Hypermotion') || comp.includes('Liga MX')) {
    if (pos <= 2) return '#e8f5e9'
    if (pos <= 6) return '#e3f2fd'
    if (pos >= total - 3) return '#fde8e8'
  }
  return 'transparent'
}

/* Feature 10: iCal export */
function generateICS(m: Match): string {
  const [h, min] = m.time.split(':')
  const dt = m.date.replace(/-/g, '') + 'T' + h + min + '00'
  const endH = String(Number(h) + 2).padStart(2, '0')
  const dtEnd = m.date.replace(/-/g, '') + 'T' + endH + min + '00'
  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART;TZID=Europe/Madrid:${dt}\nDTEND;TZID=Europe/Madrid:${dtEnd}\nSUMMARY:${m.home} vs ${m.away}\nDESCRIPTION:${m.comp} - ${m.ch.join(', ')}\nEND:VEVENT\nEND:VCALENDAR`
}

function downloadICS(m: Match) {
  const blob = new Blob([generateICS(m)], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `${m.home}-vs-${m.away}.ics`; a.click()
  URL.revokeObjectURL(url)
}

/* Feature 6: Share */
async function shareMatch(m: Match) {
  const text = `⚽ ${m.home} vs ${m.away} - ${m.time} - ${m.ch.join(', ')}`
  if (navigator.share) { try { await navigator.share({ text }) } catch {} }
  else { await navigator.clipboard.writeText(text) }
  return text
}

const FREE_KW = ['gol', 'la 1', 'la1', 'teledeporte', 'tdp', 'antena', 'lasexta', 'cuatro', 'telecinco', 'tve', 'rtve']
const PAY_KW = ['dazn', 'movistar', 'laliga', 'ppv', 'm+']
const INTL_COMPS = ['Amistoso', 'UEFA Nations League', 'Clasificación Mundial', 'Eurocopa', 'Copa América']

/* ── Sub-components ──────────────────────────────────────────── */
function ScoreBox({ score }: { score?: Score }) {
  if (!score) return null
  const live = score.st === '1H' || score.st === '2H'
  const ht = score.st === 'HT'
  const ft = score.st === 'FT'
  const bg = live ? LIGHT.red : ht ? '#f4a261' : '#eee'
  const tx = live || ht ? '#fff' : '#333'
  const label = live ? `${score.min}'` : ht ? 'HT' : ft ? 'FIN' : ''
  const lc = live ? LIGHT.red : ht ? '#f4a261' : '#aaa'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', borderRadius: 4, overflow: 'hidden', fontWeight: 900, fontSize: 13, background: bg }}>
        <span style={{ padding: '3px 7px', color: tx }}>{score.h}</span>
        <span style={{ padding: '0 1px', opacity: 0.5, color: tx }}>-</span>
        <span style={{ padding: '3px 7px', color: tx }}>{score.a}</span>
      </div>
      {label && <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: lc }}>{label}</span>}
    </div>
  )
}

function ChTag({ name }: { name: string }) {
  const col = chColor(name)
  return <span className="ch-tag" style={{ background: col.bg, color: col.text, borderColor: col.border }}>{name}</span>
}

const MD_SLUGS: Record<string, string> = {
  'FC Barcelona': 'fc-barcelona', 'Real Madrid': 'real-madrid', 'Atlético Madrid': 'atletico-de-madrid',
  'Athletic Club': 'athletic-club', 'Real Sociedad': 'real-sociedad', 'Villarreal': 'villarreal',
  'Sevilla FC': 'sevilla', 'Real Betis': 'real-betis', 'Valencia CF': 'valencia', 'Osasuna': 'osasuna',
  'Celta de Vigo': 'celta-de-vigo', 'Getafe CF': 'getafe', 'Rayo Vallecano': 'rayo-vallecano',
  'Girona FC': 'girona', 'Sporting Gijón': 'sporting-de-gijon', 'Deportivo': 'deportivo',
  'Granada CF': 'granada', 'España': 'seleccion-espanola',
}

function NewsLink({ team, T }: { team: string; T: typeof LIGHT }) {
  const slug = MD_SLUGS[team]
  if (!slug) return null
  return (
    <a href={`https://www.mundodeportivo.com/futbol/${slug}`} target="_blank" rel="noreferrer" title={`Noticias de ${team} en MD`}
      style={{ display: 'inline-flex', alignItems: 'center', padding: 2, color: T.gray, borderRadius: 2, transition: 'color .15s' }}
      onMouseEnter={e => { (e.target as HTMLElement).style.color = T.red }}
      onMouseLeave={e => { (e.target as HTMLElement).style.color = T.gray }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" /><path d="M15 18h-5" /><rect x="10" y="6" width="8" height="5" rx="1" />
      </svg>
    </a>
  )
}

/* Feature 1: Favorite star */
function FavStar({ team, favorites, toggle }: { team: string; favorites: string[]; toggle: (t: string) => void }) {
  const isFav = favorites.includes(team)
  return (
    <button onClick={e => { e.stopPropagation(); toggle(team) }} title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 1px', fontSize: 12, color: isFav ? '#f59e0b' : '#ccc', transition: 'color .15s', lineHeight: 1 }}>
      {isFav ? '★' : '☆'}
    </button>
  )
}

/* Feature 5: Match preview panel with H2H, polls, CTA */
function MatchPreview({ m, T, polls, votePoll, interests, trackInterest }: {
  m: Match; T: typeof LIGHT
  polls: Record<number, 'home' | 'away'>; votePoll: (id: number, side: 'home' | 'away') => void
  interests: Record<number, number>; trackInterest: (id: number) => void
}) {
  const homeSlug = MD_SLUGS[m.home]
  const awaySlug = MD_SLUGS[m.away]
  const cta = getMatchCTA(m.ch)
  const league = COMP_LEAGUE_ID[m.comp] || Object.entries(COMP_LEAGUE_ID).find(([k]) => m.comp.includes(k.split(' ')[0]))?.[1] || 'esp.1'

  // Fetch real team data (last 5, form, standings) + H2H
  type TeamData = { name: string; shortName: string; logo: string; pos: number; pts: number; gp: number; wins: number; draws: number; losses: number; last5: { d: string; h: string; sh: number; sa: number; a: string; win: boolean | null }[]; form: string[] }
  const [homeData, setHomeData] = useState<TeamData | null>(null)
  const [awayData, setAwayData] = useState<TeamData | null>(null)
  const [h2h, setH2h] = useState<{ d: string; h: string; sh: number; sa: number; a: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/team?name=${encodeURIComponent(m.home)}&league=${league}`).then(r => r.json()),
      fetch(`/api/team?name=${encodeURIComponent(m.away)}&league=${league}`).then(r => r.json()),
      fetch(`/api/h2h?home=${encodeURIComponent(m.home)}&away=${encodeURIComponent(m.away)}&league=${league}`).then(r => r.json()),
    ]).then(([hd, ad, h2hd]) => {
      if (hd.form) setHomeData(hd)
      if (ad.form) setAwayData(ad)
      if (h2hd.matches?.length) setH2h(h2hd.matches)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [m.home, m.away, league])

  const vote = polls[m.id]
  const intCount = interests[m.id] || 0

  const renderTeamBlock = (data: TeamData | null, name: string, slug: string | undefined) => {
    if (!data) return null
    return (
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          {data.logo && <img src={data.logo} alt={data.shortName} width={20} height={20} style={{ objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}
          <span style={{ fontWeight: 700, color: T.text }}>{data.shortName || name}</span>
          {slug && <a href={`https://www.mundodeportivo.com/futbol/${slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 9, color: T.red, fontWeight: 600, textDecoration: 'none' }}>MD →</a>}
        </div>
        {/* Standings position */}
        {data.pos > 0 && (
          <div style={{ color: T.gray, fontSize: 10, marginBottom: 3 }}>
            #{data.pos} · {data.pts} pts · {data.wins}G {data.draws}E {data.losses}P
          </div>
        )}
        {/* Form dots */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
          {data.form.map((v, i) => <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff', background: formDotColor(v) }}>{v}</span>)}
        </div>
        {/* Last 5 results */}
        {data.last5.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '1px 0', fontSize: 9, color: T.gray }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: r.win === true ? '#22c55e' : r.win === false ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
            <span>{r.h} {r.sh}-{r.sa} {r.a}</span>
            <span style={{ color: T.border, marginLeft: 'auto' }}>{r.d}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: '10px 12px', background: T.lightGray, borderBottom: `1px solid ${T.border}`, borderLeft: `3px solid ${T.yellow}`, fontSize: 11 }}>
      {/* Team stats + last 5 */}
      {loading ? (
        <div style={{ color: T.gray, padding: '8px 0' }}>Cargando datos...</div>
      ) : (
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {renderTeamBlock(homeData, m.home, homeSlug)}
          {renderTeamBlock(awayData, m.away, awaySlug)}
          {!homeData && !awayData && <div style={{ color: T.gray }}>Sin datos disponibles</div>}
        </div>
      )}
      {/* H2H */}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
        <div style={{ fontWeight: 700, fontSize: 10, color: T.gray, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Últimos enfrentamientos</div>
        {loading
          ? <div style={{ fontSize: 10, color: T.gray }}>Cargando...</div>
          : h2h.length > 0
            ? h2h.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '2px 0', fontSize: 10, color: T.text }}>
                <span style={{ color: T.gray, width: 75 }}>{r.d}</span>
                <span style={{ fontWeight: 600, textAlign: 'right', flex: 1 }}>{r.h}</span>
                <span style={{ fontWeight: 900, color: T.red }}>{r.sh} - {r.sa}</span>
                <span style={{ fontWeight: 600, flex: 1 }}>{r.a}</span>
              </div>
            ))
            : <div style={{ fontSize: 10, color: T.gray }}>Sin enfrentamientos recientes</div>
        }
      </div>
      {/* Poll */}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: T.gray, fontWeight: 600 }}>¿Quién gana?</span>
        <button onClick={e => { e.stopPropagation(); votePoll(m.id, 'home') }}
          style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, border: `1px solid ${vote === 'home' ? T.red : T.border}`, background: vote === 'home' ? T.redLight : 'transparent', color: vote === 'home' ? T.red : T.text, cursor: 'pointer', fontWeight: vote === 'home' ? 700 : 400, fontFamily: 'inherit' }}>
          {m.home}
        </button>
        <span style={{ fontSize: 9, color: T.gray }}>·</span>
        <button onClick={e => { e.stopPropagation(); votePoll(m.id, 'away') }}
          style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, border: `1px solid ${vote === 'away' ? T.red : T.border}`, background: vote === 'away' ? T.redLight : 'transparent', color: vote === 'away' ? T.red : T.text, cursor: 'pointer', fontWeight: vote === 'away' ? 700 : 400, fontFamily: 'inherit' }}>
          {m.away}
        </button>
        {intCount > 0 && <span style={{ fontSize: 9, color: T.gray, marginLeft: 'auto' }}>{intCount}x compartido</span>}
      </div>
      {/* CTA */}
      {cta && (
        <div style={{ marginTop: 8 }}>
          <a href={cta.url} target="_blank" rel="noreferrer"
            style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '5px 12px', borderRadius: 3, background: '#1a1a1a', color: cta.color, textDecoration: 'none', border: `1px solid ${cta.color}33`, transition: 'opacity .15s' }}>
            {cta.text}
          </a>
        </div>
      )}
      {/* MD links */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        {homeSlug && <a href={`https://www.mundodeportivo.com/futbol/${homeSlug}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: T.red, fontWeight: 600 }}>Previa {m.home} →</a>}
        {awaySlug && <a href={`https://www.mundodeportivo.com/futbol/${awaySlug}`} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: T.red, fontWeight: 600 }}>Previa {m.away} →</a>}
      </div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────── */
export default function GuiaFutbolMD() {
  const [clock, setClock] = useState(nowStr())
  const [filter, setFilter] = useState('all')
  const [compFilter, setCompFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [selectedDate, setSelectedDate] = useState(today)
  const [page, setPage] = useState<'main' | 'comp'>('main')
  const [currentComp, setCurrentComp] = useState('')
  const [compTab, setCompTab] = useState('tabla')
  const [menuOpen, setMenuOpen] = useState(false)
  const [showScores, setShowScores] = useState(true)
  /* Feature 1 */ const [favorites, setFavorites] = useState<string[]>([])
  /* Feature 3 */ const [darkMode, setDarkMode] = useState(false)
  /* Feature 4 */ const [searchQuery, setSearchQuery] = useState('')
  /* Feature 5 */ const [expandedMatch, setExpandedMatch] = useState<number | null>(null)
  /* Feature 6 */ const [toast, setToast] = useState('')
  /* Feature 7 */ const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  /* New: grouping mode */ const [groupBy, setGroupBy] = useState<'comp' | 'channel'>('comp')
  /* Real standings data */ const [liveComp, setLiveComp] = useState<CompData | null>(null)
  /* Loading standings */ const [loadingComp, setLoadingComp] = useState(false)
  /* Live matches from API */ const [liveMatches, setLiveMatches] = useState<Match[]>([])
  /* API data source indicator */ const [dataSource, setDataSource] = useState<'demo' | 'api'>('demo')
  /* New: polls */ const [polls, setPolls] = useState<Record<number, 'home' | 'away'>>({})
  /* New: interest counters */ const [interests, setInterests] = useState<Record<number, number>>({})
  /* New: notifications */ const [notifEnabled, setNotifEnabled] = useState(false)

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const T = darkMode ? DARK : LIGHT

  // Load from localStorage
  useEffect(() => {
    try {
      const f = localStorage.getItem('md-favorites')
      if (f) setFavorites(JSON.parse(f))
      const d = localStorage.getItem('md-darkmode')
      if (d === 'true') setDarkMode(true)
      const p = localStorage.getItem('md-polls')
      if (p) setPolls(JSON.parse(p))
      const int = localStorage.getItem('md-interests')
      if (int) setInterests(JSON.parse(int))
      if ('Notification' in window && Notification.permission === 'granted') setNotifEnabled(true)
    } catch {}
  }, [])

  // Persist
  useEffect(() => { try { localStorage.setItem('md-favorites', JSON.stringify(favorites)) } catch {} }, [favorites])
  useEffect(() => { try { localStorage.setItem('md-polls', JSON.stringify(polls)) } catch {} }, [polls])
  useEffect(() => { try { localStorage.setItem('md-interests', JSON.stringify(interests)) } catch {} }, [interests])
  // Persist dark mode
  useEffect(() => {
    try { localStorage.setItem('md-darkmode', String(darkMode)) } catch {}
    document.body.style.background = T.bg
  }, [darkMode, T.bg])

  // Fetch matches: ESPN (all comps) + WOSTI (TV channels), merged
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Fetch ESPN all matches + WOSTI TV channels in parallel
        const [espnRes, wostiRes] = await Promise.all([
          fetch(`/api/allmatches?date=${selectedDate}`).then(r => r.json()).catch(() => ({ matches: [] })),
          fetch(`/api/matches?date=${selectedDate}`).then(r => r.json()).catch(() => ({ matches: [] })),
        ])

        const espnMatches: Match[] = (espnRes.matches || []).map((m: Record<string, unknown>) => ({
          id: m.id, time: m.time, date: m.date, home: m.home, away: m.away, comp: m.comp,
          ch: (m.ch as string[]) || [],
          score: m.score as Match['score'],
        }))

        // Build WOSTI match list with channels
        type WostiEntry = { time: string; home: string; away: string; comp: string; chs: string[] }
        const wostiList: WostiEntry[] = (wostiRes.matches || []).map((m: Record<string, unknown>) => ({
          time: String(m.time || ''),
          home: String(m.home || ''),
          away: String(m.away || ''),
          comp: String(m.competition || ''),
          chs: Array.isArray(m.channels) ? (m.channels as { name: string }[]).map((c: { name: string }) => c.name) : [],
        })).filter((w: WostiEntry) => w.chs.length > 0)

        // Fuzzy team match: first word with 4+ chars, or contains
        const fuzzyTeam = (a: string, b: string) => {
          const al = a.toLowerCase(), bl = b.toLowerCase()
          if (al === bl) return true
          if (al.includes(bl) || bl.includes(al)) return true
          const af = al.split(/[\s.]+/)[0], bf = bl.split(/[\s.]+/)[0]
          if (af.length >= 4 && bf.length >= 4 && (af.startsWith(bf.slice(0, 4)) || bf.startsWith(af.slice(0, 4)))) return true
          return false
        }

        // Merge: ESPN matches with WOSTI channels (by time + fuzzy home)
        const usedWosti = new Set<number>()
        const merged = espnMatches.map(m => {
          for (let i = 0; i < wostiList.length; i++) {
            if (usedWosti.has(i)) continue
            const w = wostiList[i]
            // Same time (within 30 min) + fuzzy home match
            const timeDiff = Math.abs(
              parseInt(m.time.split(':')[0]) * 60 + parseInt(m.time.split(':')[1]) -
              parseInt(w.time.split(':')[0]) * 60 - parseInt(w.time.split(':')[1])
            )
            if (timeDiff <= 30 && fuzzyTeam(m.home, w.home)) {
              usedWosti.add(i)
              return { ...m, ch: w.chs }
            }
          }
          return m
        })

        // Add WOSTI-only matches not matched to ESPN
        const wostiOnly: Match[] = wostiList
          .filter((_w, i) => !usedWosti.has(i))
          .filter(w => {
            // Skip if ESPN already has this match
            return !merged.some(em => fuzzyTeam(em.home, w.home) && Math.abs(
              parseInt(em.time.split(':')[0]) * 60 + parseInt(em.time.split(':')[1]) -
              parseInt(w.time.split(':')[0]) * 60 - parseInt(w.time.split(':')[1])
            ) <= 30)
          })
          .map((wm: Record<string, unknown>, i: number) => ({
            id: 3000 + i,
            time: String(wm.time || '??:??'),
            date: selectedDate,
            home: String(wm.home || '?'),
            away: String(wm.away || '?'),
            comp: String(wm.competition || ''),
            ch: Array.isArray(wm.channels) ? (wm.channels as { name: string }[]).map((c: { name: string }) => c.name) : [],
          }))

        const all = [...merged, ...wostiOnly]
        all.sort((a, b) => a.time.localeCompare(b.time))

        setLiveMatches(all)
        setDataSource(all.length > 0 ? 'api' : 'demo')
      } catch {}
    }
    fetchMatches()
  }, [selectedDate])

  // Clock + notifications for fav matches starting soon
  useEffect(() => {
    const t = setInterval(() => {
      setClock(nowStr())
      if (notifEnabled && favorites.length > 0) {
        allMatches.forEach(m => {
          const mins = startsIn(m.time, m.date)
          if (mins === 15 && (favorites.includes(m.home) || favorites.includes(m.away))) {
            new Notification(`${m.home} vs ${m.away}`, { body: `Empieza en 15 min — ${m.ch.join(', ')}`, icon: '/logo-md.png' })
          }
        })
      }
    }, 30000)
    return () => clearInterval(t)
  }, [notifEnabled, favorites])

  // Debounce search
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 200)
    return () => { if (searchRef.current) clearTimeout(searchRef.current) }
  }, [searchQuery])

  const toggleFav = (team: string) => setFavorites(f => f.includes(team) ? f.filter(t => t !== team) : [...f, team])
  const votePoll = (matchId: number, side: 'home' | 'away') => setPolls(p => ({ ...p, [matchId]: side }))
  const trackInterest = (matchId: number) => setInterests(int => ({ ...int, [matchId]: (int[matchId] || 0) + 1 }))
  const enableNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      setNotifEnabled(perm === 'granted')
      if (perm === 'granted') setToast('Notificaciones activadas'); setTimeout(() => setToast(''), 2000)
    }
  }

  const dateStr = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  // ── Filters ──
  // All matches come from API
  const allMatches = liveMatches
  const baseMatches = viewMode === 'week'
    ? allMatches
    : allMatches.filter(m => m.date === selectedDate)

  const clubTeams = Array.from(new Set(allMatches.filter(m => !INTL_COMPS.includes(m.comp)).flatMap(m => [m.home, m.away]))).sort()
  const nationalTeams = Array.from(new Set(allMatches.filter(m => INTL_COMPS.includes(m.comp)).flatMap(m => [m.home, m.away]))).sort()
  const allComps = Array.from(new Set(allMatches.map(m => m.comp))).sort()

  const filtered = useMemo(() => baseMatches.filter(m => {
    if (filter === 'free') return m.ch.some(c => FREE_KW.some(k => c.toLowerCase().includes(k)))
    if (filter === 'pay') return m.ch.some(c => PAY_KW.some(k => c.toLowerCase().includes(k)))
    if (filter === 'favs') return favorites.includes(m.home) || favorites.includes(m.away)
    return true
  }).filter(m => {
    if (compFilter && m.comp !== compFilter) return false
    if (teamFilter && m.home !== teamFilter && m.away !== teamFilter) return false
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      return m.home.toLowerCase().includes(q) || m.away.toLowerCase().includes(q) || m.comp.toLowerCase().includes(q)
    }
    return true
  }), [baseMatches, filter, compFilter, teamFilter, debouncedSearch, favorites])

  // Group by date then comp or channel
  const groupedByDay = useMemo(() => {
    const byDay: Record<string, Record<string, Match[]>> = {}
    filtered.forEach(m => {
      if (!byDay[m.date]) byDay[m.date] = {}
      if (groupBy === 'channel') {
        const mainCh = m.ch[0] || 'Sin canal'
        if (!byDay[m.date][mainCh]) byDay[m.date][mainCh] = []
        byDay[m.date][mainCh].push(m)
      } else {
        if (!byDay[m.date][m.comp]) byDay[m.date][m.comp] = []
        byDay[m.date][m.comp].push(m)
      }
    })
    return byDay
  }, [filtered, groupBy])

  // Featured match: most channels today
  const featuredMatch = useMemo(() => {
    const todayMatches = allMatches.filter(m => m.date === today && !isPast(m.time, m.date))
    if (!todayMatches.length) return null
    return todayMatches.reduce((best, m) => m.ch.length > best.ch.length ? m : best, todayMatches[0])
  }, [])

  const selectDay = (d: string) => { setSelectedDate(d); setFilter('all'); setCompFilter(''); setTeamFilter(''); setViewMode('day') }
  const resetAll = () => { setFilter('all'); setCompFilter(''); setTeamFilter(''); setSelectedDate(today); setSearchQuery(''); setViewMode('day') }
  const showComp = async (name: string) => {
    setCurrentComp(name); setPage('comp'); setMenuOpen(false); setLoadingComp(true); setLiveComp(null)
    const fallback = COMPS[name]
    setCompTab(fallback?.table.length ? 'tabla' : 'resultados')
    try {
      const res = await fetch(`/api/standings?comp=${encodeURIComponent(name)}`)
      const data = await res.json()
      if (data.table?.length || data.results?.length || data.next?.length) {
        const emoji = COMPS[name]?.emoji || '⚽'
        setLiveComp({ emoji, table: data.table || [], results: data.results || [], next: data.next || [] })
        if (data.table?.length) setCompTab('tabla'); else setCompTab('resultados')
      }
    } catch {} finally { setLoadingComp(false) }
  }
  const showMain = () => setPage('main')

  const handleShare = async (m: Match) => {
    await shareMatch(m)
    trackInterest(m.id)
    setToast('Copiado!'); setTimeout(() => setToast(''), 2000)
  }
  const handleIcal = (m: Match) => {
    downloadICS(m)
    trackInterest(m.id)
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    background: active ? T.red : T.white, color: active ? '#fff' : T.darkGray,
    border: `1px solid ${active ? T.red : T.border}`, borderRadius: 2, padding: '5px 10px', cursor: 'pointer',
    fontWeight: active ? 700 : 500, fontSize: 11, letterSpacing: 0.3, textTransform: 'uppercase',
    fontFamily: 'inherit', transition: 'all .15s', whiteSpace: 'nowrap',
  })

  const dayButtons = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() + (i - 1) * 86400000).toISOString().split('T')[0]
    const label = i === 0 ? 'Ayer' : i === 1 ? 'Hoy' : i === 2 ? 'Mañana' : new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
    return { date: d, label }
  })

  const cp = liveComp || COMPS[currentComp]

  /* Feature 9: JSON-LD structured data */
  const jsonLd = useMemo(() => {
    const events = allMatches.filter(m => m.date === today).map(m => ({
      '@type': 'SportsEvent', name: `${m.home} vs ${m.away}`,
      startDate: `${m.date}T${m.time}:00+02:00`,
      homeTeam: { '@type': 'SportsTeam', name: m.home },
      awayTeam: { '@type': 'SportsTeam', name: m.away },
      location: { '@type': 'Place', name: m.comp },
      broadcastEvent: m.ch.map(c => ({ '@type': 'BroadcastEvent', isLiveBroadcast: true, broadcastOfEvent: { '@type': 'BroadcastService', name: c } })),
    }))
    return JSON.stringify({ '@context': 'https://schema.org', '@graph': events })
  }, [])

  // ── Render match row ──
  const renderMatch = (m: Match) => {
    const past = isPast(m.time, m.date)
    const mins = startsIn(m.time, m.date)
    const soon = mins > 0 && mins <= 30
    const expanded = expandedMatch === m.id
    return (
      <div key={m.id}>
        <div className={`match-row${past ? ' past' : ''}`}
          onClick={() => setExpandedMatch(expanded ? null : m.id)}
          style={{ cursor: 'pointer', borderLeftColor: soon ? T.yellow : past ? 'transparent' : T.red }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: past ? T.gray : T.red, fontStyle: 'italic' }}>{m.time}</div>
            {soon
              ? <div className="soon-badge" style={{ fontSize: 8, fontWeight: 800, color: T.red, textTransform: 'uppercase', marginTop: 1 }}>EN {formatCountdown(mins)}</div>
              : mins > 0 && mins < 480
              ? <div style={{ fontSize: 8, color: T.gray, marginTop: 1 }}>{formatCountdown(mins)}</div>
              : <div style={{ fontSize: 9, color: T.gray, textTransform: 'uppercase', marginTop: 1 }}>{past ? 'Jugado' : 'Hoy'}</div>
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <FavStar team={m.home} favorites={favorites} toggle={toggleFav} />
              <span style={{ fontWeight: 700, fontSize: 13, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.home}</span>
              <NewsLink team={m.home} T={T} />
              <span style={{ color: T.gray, fontSize: 11, margin: '0 1px' }}>vs</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.away}</span>
              <NewsLink team={m.away} T={T} />
              <FavStar team={m.away} favorites={favorites} toggle={toggleFav} />
            </div>
            <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>{m.comp}</div>
          </div>
          <div className="match-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
            {showScores && <ScoreBox score={m.score} />}
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {m.ch.map((c, i) => <ChTag key={i} name={c} />)}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {/* Share button */}
              <button onClick={e => { e.stopPropagation(); handleShare(m) }} title="Compartir"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gray, padding: 0, fontSize: 13 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
              {/* iCal button */}
              <button onClick={e => { e.stopPropagation(); handleIcal(m) }} title="Añadir al calendario"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gray, padding: 0, fontSize: 13 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </button>
            </div>
          </div>
        </div>
        {expanded && <MatchPreview m={m} T={T} polls={polls} votePoll={votePoll} interests={interests} trackInterest={trackInterest} />}
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: T.bg, color: T.text, minHeight: '100vh', transition: 'background .3s, color .3s' }}>
      {/* Feature 9: Schema.org */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bg};transition:background .3s}
        .ch-tag{font-size:9px;font-weight:700;padding:2px 5px;border-radius:2px;border-width:1px;border-style:solid;white-space:nowrap;text-transform:uppercase;letter-spacing:.3px}
        .match-row{display:grid;grid-template-columns:52px 1fr auto;align-items:center;gap:9px;padding:9px 12px;border-bottom:1px solid ${T.border};border-left:3px solid ${T.red};background:${T.cardBg};transition:background .15s}
        .match-row:hover{background:${darkMode ? '#1e1e1e' : '#fafafa'}}
        .match-row.past{opacity:.5;border-left:3px solid transparent;background:${T.lightGray}}
        @keyframes pulse-soon{0%,100%{opacity:1}50%{opacity:.4}}
        .soon-badge{animation:pulse-soon 1.5s infinite}
        @media(max-width:600px){
          .match-row{grid-template-columns:48px 1fr;grid-template-rows:auto auto;gap:5px}
          .match-right{grid-column:2;flex-direction:row;justify-content:flex-start;flex-wrap:wrap}
        }
      `}</style>

      {/* Toast */}
      {toast && <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: T.red, color: '#fff', padding: '6px 16px', borderRadius: 4, fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      {/* HEADER BAR */}
      <div style={{ background: '#111', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: `3px solid ${T.red}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-md.png" alt="MD" onClick={showMain} style={{ height: 32, cursor: 'pointer' }} />
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ ...tabBtn(false), background: 'transparent', borderColor: '#555', color: '#ccc' }}>Competiciones ▾</button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: T.white, border: `1px solid ${T.border}`, borderRadius: 6, minWidth: 190, boxShadow: '0 4px 14px rgba(0,0,0,.15)', overflow: 'hidden', zIndex: 200 }}>
                {Object.entries(COMPS).map(([name, data]) => (
                  <button key={name} onClick={() => showComp(name)} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', fontSize: 12, color: T.text, fontFamily: 'inherit', textAlign: 'left' }}>{data.emoji} {name}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Feature 3: Dark mode toggle */}
          <button onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#aaa', padding: '2px 4px' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.red, display: 'inline-block', marginRight: 5 }} />
            EN DIRECTO · {clock}
          </div>
        </div>
      </div>

      {/* ══════════ MAIN PAGE ══════════ */}
      {page === 'main' && (
        <>
          <div style={{ background: T.cardBg, padding: '8px 14px 10px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.red, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>⚽ Fútbol · Guía TV</div>
            <h1 style={{ fontSize: 17, fontWeight: 900, fontStyle: 'italic', color: T.text }}>Fútbol en la TV hoy</h1>
          </div>

          {/* Featured match hero */}
          {featuredMatch && viewMode === 'day' && selectedDate === today && !debouncedSearch && (
            <div style={{ padding: '12px 14px', background: `linear-gradient(135deg, ${T.red}22, ${T.cardBg})`, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: T.red, borderRadius: 4, padding: '6px 10px', textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontStyle: 'italic' }}>{featuredMatch.time}</div>
                <div style={{ fontSize: 8, color: '#fffa', textTransform: 'uppercase' }}>Destacado</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: T.text }}>{featuredMatch.home} vs {featuredMatch.away}</div>
                <div style={{ fontSize: 10, color: T.gray, marginTop: 2 }}>{featuredMatch.comp} · {featuredMatch.ch.join(', ')}</div>
              </div>
              {(() => { const cta = getMatchCTA(featuredMatch.ch); return cta ? (
                <a href={cta.url} target="_blank" rel="noreferrer" style={{ fontSize: 9, fontWeight: 700, padding: '5px 10px', borderRadius: 3, background: '#1a1a1a', color: cta.color, textDecoration: 'none', border: `1px solid ${cta.color}44`, whiteSpace: 'nowrap' }}>{cta.text}</a>
              ) : null })()}
            </div>
          )}

          {/* Controls */}
          <div style={{ padding: '9px 14px', borderBottom: `1px solid ${T.border}`, background: T.lightGray }}>
            {/* Feature 4: Search */}
            <div style={{ marginBottom: 7, position: 'relative' }}>
              <input type="text" placeholder="Buscar equipo o competición..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '6px 10px 6px 30px', border: `1px solid ${T.border}`, borderRadius: 2, background: T.white, color: T.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
              <svg style={{ position: 'absolute', left: 10, top: 8, color: T.gray }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 7 }}>
              {dayButtons.map(db => (
                <button key={db.date} onClick={() => selectDay(db.date)} style={tabBtn(viewMode === 'day' && selectedDate === db.date)}>{db.label}</button>
              ))}
              {/* Feature 7: Week view */}
              <button onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')} style={tabBtn(viewMode === 'week')}>Semana</button>
              <span style={{ width: 1, height: 16, background: T.border, display: 'inline-block', margin: '0 2px' }} />
              <button onClick={() => setGroupBy(groupBy === 'comp' ? 'channel' : 'comp')} style={tabBtn(groupBy === 'channel')} title="Agrupar por canal">
                {groupBy === 'channel' ? 'Por canal' : 'Por comp.'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={resetAll} style={tabBtn(filter === 'all' && !compFilter && !teamFilter)}>Todos</button>
              {/* Feature 1: Favorites filter */}
              {favorites.length > 0 && <button onClick={() => setFilter('favs')} style={tabBtn(filter === 'favs')}>★ Mis equipos</button>}
              <button onClick={() => setFilter('free')} style={tabBtn(filter === 'free')}>En abierto</button>
              <button onClick={() => setFilter('pay')} style={tabBtn(filter === 'pay')}>De pago</button>
              <select value={compFilter} onChange={e => { setCompFilter(e.target.value); setTeamFilter('') }}
                style={{ fontSize: 11, padding: '4px 7px', border: `1px solid ${T.border}`, borderRadius: 2, background: T.white, color: T.text, maxWidth: 150, fontFamily: 'inherit' }}>
                <option value="">Competición</option>
                {allComps.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={teamFilter} onChange={e => { setTeamFilter(e.target.value); setCompFilter('') }}
                style={{ fontSize: 11, padding: '4px 7px', border: `1px solid ${T.border}`, borderRadius: 2, background: T.white, color: T.text, maxWidth: 170, fontFamily: 'inherit' }}>
                <option value="">Equipo</option>
                {clubTeams.length > 0 && <optgroup label="Clubes">{clubTeams.map(t => <option key={t} value={t}>{t}</option>)}</optgroup>}
                {nationalTeams.length > 0 && <optgroup label="Selecciones">{nationalTeams.map(t => <option key={t} value={t}>{t}</option>)}</optgroup>}
              </select>
              {(compFilter || teamFilter) && (
                <button onClick={() => { setCompFilter(''); setTeamFilter('') }}
                  style={{ fontSize: 11, padding: '4px 7px', border: `1px solid ${T.red}`, borderRadius: 2, background: T.redLight, color: T.red, cursor: 'pointer', fontFamily: 'inherit' }}>✕ Limpiar</button>
              )}
              {/* Notification toggle */}
              {favorites.length > 0 && !notifEnabled && (
                <button onClick={enableNotifications} title="Activar notificaciones para tus equipos"
                  style={{ fontSize: 11, padding: '4px 7px', border: `1px solid ${T.border}`, borderRadius: 2, background: T.white, color: T.gray, cursor: 'pointer', fontFamily: 'inherit' }}>
                  🔔 Avisos
                </button>
              )}
              {notifEnabled && <span style={{ fontSize: 10, color: '#22c55e' }} title="Notificaciones activas">🔔</span>}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setShowScores(!showScores)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '4px 8px', border: `1px solid ${showScores ? T.red : T.border}`, borderRadius: 2, background: showScores ? T.redLight : T.white, color: showScores ? T.red : T.gray, cursor: 'pointer', fontFamily: 'inherit', fontWeight: showScores ? 700 : 500 }}>
                  <span style={{ width: 28, height: 14, borderRadius: 7, background: showScores ? T.red : '#ccc', position: 'relative', display: 'inline-block', transition: 'background .2s' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: showScores ? 16 : 2, transition: 'left .2s' }} />
                  </span>
                  Resultados
                </button>
                <span style={{ fontSize: 11, color: T.gray }}>{filtered.length} partido{filtered.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Active filters breadcrumb */}
          {(filter !== 'all' || compFilter || teamFilter || debouncedSearch || viewMode === 'week' || groupBy === 'channel') && (
            <div style={{ padding: '6px 14px', display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', borderBottom: `1px solid ${T.border}`, background: T.cardBg }}>
              <span style={{ fontSize: 10, color: T.gray }}>Filtros:</span>
              {filter === 'favs' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#f59e0b22', color: '#f59e0b', fontWeight: 600 }}>★ Mis equipos</span>}
              {filter === 'free' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#22c55e22', color: '#22c55e', fontWeight: 600 }}>En abierto</span>}
              {filter === 'pay' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#3b82f622', color: '#3b82f6', fontWeight: 600 }}>De pago</span>}
              {compFilter && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: T.redLight, color: T.red, fontWeight: 600 }}>{compFilter}</span>}
              {teamFilter && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: T.redLight, color: T.red, fontWeight: 600 }}>{teamFilter}</span>}
              {debouncedSearch && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: T.redLight, color: T.red, fontWeight: 600 }}>"{debouncedSearch}"</span>}
              {viewMode === 'week' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#8b5cf622', color: '#8b5cf6', fontWeight: 600 }}>Semana</span>}
              {groupBy === 'channel' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#06b6d422', color: '#06b6d4', fontWeight: 600 }}>Por canal</span>}
              <button onClick={resetAll} style={{ fontSize: 10, color: T.red, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>✕ Quitar todos</button>
            </div>
          )}

          {/* Match list */}
          <div style={{ padding: '8px 14px 40px', maxWidth: 880, margin: '0 auto' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: T.gray }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>📅</p>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: T.text }}>No hay partidos</p>
                <p style={{ fontSize: 12 }}>Prueba otro día o filtro</p>
              </div>
            ) : (
              Object.keys(groupedByDay).sort().map(day => (
                <div key={day}>
                  <div style={{ display: 'flex', alignItems: 'center', margin: '12px 0 7px', padding: '6px 10px', background: darkMode ? '#1a1a1a' : T.black, borderLeft: `4px solid ${T.red}` }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>📅 {formatDayHeader(day)}</span>
                    <span style={{ fontSize: 10, color: '#aaa', marginLeft: 'auto' }}>{Object.values(groupedByDay[day]).flat().length} partidos</span>
                  </div>
                  {Object.entries(groupedByDay[day]).map(([comp, matches]) => (
                    <div key={comp} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', padding: '5px 0', borderBottom: `2px solid ${darkMode ? '#333' : T.black}`, marginBottom: 1 }}>
                        <button onClick={() => showComp(comp)}
                          style={{ fontSize: 11, fontWeight: 900, color: '#fff', background: T.red, padding: '2px 9px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: 1 }}>{comp} →</button>
                        <span style={{ fontSize: 11, color: T.gray, marginLeft: 'auto' }}>{matches.length}p</span>
                      </div>
                      {matches.map(renderMatch)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: `2px solid ${darkMode ? '#333' : T.black}`, padding: '9px 14px', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.gray }}>
            <span>{dataSource === 'api' ? 'EN VIVO' : 'Demo'} · futbolenlatv.es · WOSTI API</span>
            <span>{dateStr}</span>
          </div>
        </>
      )}

      {/* ══════════ COMPETITION PAGE ══════════ */}
      {page === 'comp' && cp && (
        <>
          <div style={{ padding: '7px 14px', background: T.lightGray, borderBottom: `1px solid ${T.border}`, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={showMain} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.red, fontWeight: 700, fontSize: 11, padding: 0, fontFamily: 'inherit' }}>← Guía TV</button>
            <span style={{ color: T.gray }}>/</span>
            <span style={{ fontWeight: 600, color: T.text }}>{currentComp}</span>
          </div>
          <div style={{ padding: '10px 14px 0', borderBottom: `1px solid ${T.border}`, background: T.cardBg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{cp.emoji}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.red, textTransform: 'uppercase', letterSpacing: 1.5 }}>Competición</div>
                <h2 style={{ fontSize: 18, fontWeight: 900, fontStyle: 'italic', color: T.text }}>{currentComp}</h2>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              {(cp.table.length ? ['tabla', 'resultados', 'proximos'] : ['resultados', 'proximos']).map(t => {
                const labels: Record<string, string> = { tabla: 'Clasificación', resultados: 'Resultados', proximos: 'Próximos' }
                const active = compTab === t
                return (
                  <button key={t} onClick={() => setCompTab(t)}
                    style={{ padding: '8px 14px', fontSize: 11, fontWeight: active ? 700 : 500, color: active ? '#fff' : T.darkGray, background: active ? T.red : 'transparent', border: 'none', borderBottom: active ? 'none' : `2px solid ${T.border}`, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    {labels[t]}
                  </button>
                )
              })}
            </div>
          </div>
          <div style={{ padding: '10px 14px 32px', maxWidth: 860, margin: '0 auto' }}>
            {compTab === 'tabla' && cp.table.length > 0 && (
              <>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  {[{ color: '#e8f5e9', label: 'Champions' }, { color: '#e3f2fd', label: 'Europa L.' }, { color: '#fff8e1', label: 'Conference' }, { color: '#fde8e8', label: 'Descenso' }].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: T.gray }}>
                      <span style={{ width: 10, height: 10, border: `1px solid ${T.border}`, display: 'inline-block', background: l.color }} />{l.label}
                    </div>
                  ))}
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead><tr>
                      {['#', 'Equipo', 'PJ', 'G', 'E', 'P', 'GF', 'GC', 'DG', 'Forma', 'Pts'].map(h => (
                        <th key={h} style={{ padding: '6px 4px', fontSize: 10, fontWeight: 600, color: T.gray, textAlign: h === '#' || h === 'Equipo' ? 'left' : 'center', borderBottom: `2px solid ${darkMode ? '#555' : T.black}` }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {[...cp.table].sort((a, b) => a.pos - b.pos).map(r => (
                        <tr key={r.pos} style={{ background: zoneColor(r.pos, currentComp, cp.table.length) }}>
                          <td style={{ padding: '6px 4px', color: r.pos <= 4 ? '#166534' : r.pos >= 18 ? T.red : T.gray, fontWeight: 700, borderBottom: `1px solid ${T.border}` }}>{r.pos}</td>
                          <td style={{ padding: '6px 4px', fontWeight: 600, textAlign: 'left', borderBottom: `1px solid ${T.border}`, color: '#1a1a1a' }}>{r.team}</td>
                          {[r.pj, r.g, r.e, r.p, r.gf, r.gc].map((v, i) => (
                            <td key={i} style={{ padding: '6px 4px', textAlign: 'center', color: i === 0 || i >= 4 ? '#888' : '#1a1a1a', borderBottom: `1px solid ${T.border}` }}>{v}</td>
                          ))}
                          <td style={{ padding: '6px 4px', textAlign: 'center', color: r.dg > 0 ? '#166534' : r.dg < 0 ? T.red : T.gray, fontWeight: 600, borderBottom: `1px solid ${T.border}` }}>{r.dg > 0 ? '+' : ''}{r.dg}</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center', borderBottom: `1px solid ${T.border}` }}>
                            <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                              {r.f.map((v, i) => <span key={i} style={{ width: 16, height: 16, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff', background: formDotColor(v) }}>{v}</span>)}
                            </div>
                          </td>
                          <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 900, fontSize: 13, borderBottom: `1px solid ${T.border}`, color: '#1a1a1a' }}>{r.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {compTab === 'resultados' && (
              cp.results.length === 0 ? <p style={{ color: T.gray, fontSize: 13, padding: 16 }}>Sin resultados recientes</p>
                : cp.results.map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 52px 1fr', alignItems: 'center', gap: 8, padding: '9px 12px', borderBottom: `1px solid ${T.border}`, background: i % 2 ? T.lightGray : T.cardBg }}>
                    <span style={{ fontSize: 10, color: T.gray }}>{r.d}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', color: T.text }}>{r.h}</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontWeight: 900, fontSize: 15, color: T.text }}><span>{r.sh}</span><span style={{ color: T.gray, fontSize: 11 }}>-</span><span>{r.sa}</span></div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{r.a}</span>
                  </div>
                ))
            )}
            {compTab === 'proximos' && (
              cp.next.length === 0 ? <p style={{ color: T.gray, fontSize: 13, padding: 16 }}>Sin próximos partidos</p>
                : cp.next.map((u, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '95px 1fr auto 1fr auto', alignItems: 'center', gap: 7, padding: '9px 12px', borderBottom: `1px solid ${T.border}`, borderLeft: `3px solid ${T.red}`, background: T.cardBg, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, color: T.red, fontWeight: 700 }}>{u.d}</span>
                    <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', color: T.text }}>{u.h}</span>
                    <span style={{ fontSize: 11, color: T.gray, padding: '0 3px' }}>vs</span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{u.a}</span>
                    <ChTag name={u.tv} />
                  </div>
                ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
