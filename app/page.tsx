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
function getMadridToday(): string {
  const [dd, mm, yyyy] = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).split('/')
  return `${yyyy}-${mm}-${dd}`
}
const today = getMadridToday()

/* No demo data — all matches come from WOSTI API */

/* Competitions — all supported, data loaded from /api/standings */
const COMP_EMOJI: Record<string, string> = {
  // España — clubes
  'LaLiga EA Sports': '🇪🇸', 'LaLiga Hypermotion': '🇪🇸',
  'Primera Federación': '🇪🇸', 'Segunda Federación': '🇪🇸', 'Tercera Federación': '🇪🇸',
  'Liga F': '🇪🇸', 'Primera Federación Femenina': '🇪🇸',
  'División Honor Juvenil': '🇪🇸', 'División Honor Cadete': '🇪🇸', 'Liga Nacional Juvenil': '🇪🇸',
  'Copa del Rey': '🏆', 'Supercopa': '🏆',
  // Inglaterra
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'FA Cup': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', "FA Women's Super League": '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'National League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'National League North': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'National League South': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'U18 Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  // Alemania
  'Bundesliga': '🇩🇪', '2. Bundesliga': '🇩🇪', 'Regionalliga': '🇩🇪', 'Bundesliga Sub-19': '🇩🇪',
  // Italia
  'Serie A': '🇮🇹', 'Serie B Italiana': '🇮🇹', 'Serie C': '🇮🇹',
  // Francia
  'Ligue 1': '🇫🇷', 'Championnat National': '🇫🇷',
  // Otros Europa
  'Jupiler Pro League': '🇧🇪',
  'Scottish Premiership': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Northern Irish Premiership': '🇬🇧',
  'Admiral Bundesliga': '🇦🇹',
  'Superliga Danesa': '🇩🇰',
  'Superliga de Eslovaquia': '🇸🇰',
  'Superliga de Letonia': '🇱🇻',
  'Liga Premier Islandia': '🇮🇸',
  'Veikkausliiga': '🇫🇮',
  'Damallsvenskan': '🇸🇪',
  'Premier League Ucrania': '🇺🇦',
  'Liga Polaca': '🇵🇱',
  // Europa — copas internacionales
  'Champions League': '🏆', 'Europa League': '🏆', 'Conference League': '🏆',
  'Champions League Femenina': '🏆', 'UEFA Nations League': '🌍',
  // Norteamérica
  'MLS': '🇺🇸', 'MLS Next Pro': '🇺🇸', 'NWSL': '🇺🇸',
  'Liga MX': '🇲🇽',
  // Sudamérica
  'Primera División Argentina': '🇦🇷', 'Primera Nacional Argentina': '🇦🇷',
  'Primera B Argentina': '🇦🇷', 'Primera C': '🇦🇷',
  'Liga Colombiana': '🇨🇴',
  'Liga 1 Perú': '🇵🇪',
  'Liga AUF Uruguaya': '🇺🇾', 'Segunda Uruguay': '🇺🇾',
  'Liga Pro Ecuador': '🇪🇨',
  'Serie A Brasil': '🇧🇷', 'Campeonato Femenino': '🇧🇷',
  'Liga Futve': '🇻🇪', 'Liga Futve 2': '🇻🇪',
  'Copa Libertadores': '🏆', 'Copa Sudamericana': '🏆',
  'Sudamericano Femenino Sub-17': '🌎',
  // Resto del mundo
  'A-League': '🇦🇺', 'A-League Women': '🇦🇺',
  'Saudi Pro League': '🇸🇦',
  'UAE Division 1': '🇦🇪',
  'Chinese Super League': '🇨🇳',
  'ASEAN Club Championship': '🌏',
  'Primera División Andorra': '🇦🇩',
  // Amistosos/selecciones
  'Amistoso': '🌍', 'Amistoso Sub-15': '🌍', 'Clasificación Mundial': '🌍',
}

const COMP_LEAGUE_ID: Record<string, string> = {
  'LaLiga EA Sports': 'esp.1', 'LaLiga Hypermotion': 'esp.2',
  'Premier League': 'eng.1', 'Bundesliga': 'ger.1', 'Serie A': 'ita.1', 'Ligue 1': 'fra.1',
  'Liga MX': 'mex.1', 'MLS': 'usa.1',
  'Champions League': 'uefa.champions', 'Europa League': 'uefa.europa', 'Conference League': 'uefa.europa.conf',
}
const COMPS: Record<string, CompData> = {}
for (const name of Object.keys(COMP_EMOJI)) {
  COMPS[name] = { emoji: COMP_EMOJI[name], table: [], results: [], next: [] }
}

/* ── Theme ───────────────────────────────────────────────────── */
const LIGHT = {
  red: '#E30613', redLight: '#fde8e8', yellow: '#FFD700',
  black: '#000', darkGray: '#222', gray: '#666',
  lightGray: '#f4f4f4', border: '#e8e8e8', white: '#fff',
  bg: '#f4f4f4', text: '#000', cardBg: '#fff',
}
const DARK = {
  red: '#E30613', redLight: '#2a0a0a', yellow: '#FFD700',
  black: '#fff', darkGray: '#ccc', gray: '#888',
  lightGray: '#111', border: '#222', white: '#000',
  bg: '#000', text: '#f0f0f0', cardBg: '#0d0d0d',
}

/* ── Helpers ──────────────────────────────────────────────────── */
function pad(n: number) { return String(n).padStart(2, '0') }
function nowStr() { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}` }

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

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

function matchDayLabel(dateStr: string): string {
  const tk = todayKey()
  const tmk = new Date(Date.now() + 86400000).toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-')
  if (dateStr === tk) return 'Hoy'
  if (dateStr === tmk) return 'Mañana'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
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
  const [yyyy, mm, dd] = m.date.split('-')
  const dateLabel = new Date(`${m.date}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  const chLine = m.ch.length > 0 ? `📺 ${m.ch.join(' · ')}` : '📺 Canal por confirmar'
  const scoreLine = m.score
    ? `\n⚡ Marcador: ${m.score.h}–${m.score.a}${m.score.st === 'FT' ? ' (FT)' : m.score.st === 'LIVE' ? ' 🔴 EN VIVO' : ''}`
    : ''
  const text = [
    `⚽ ${m.home} vs ${m.away}`,
    `📅 ${dateLabel} · ${m.time}h`,
    `🏆 ${m.comp}`,
    chLine,
    scoreLine,
    `\n🔗 musing-snyder.vercel.app`,
  ].filter(Boolean).join('\n')
  void [yyyy, mm, dd] // used for dateLabel calculation
  if (navigator.share) {
    try {
      await navigator.share({
        title: `${m.home} vs ${m.away} — ${m.time}h`,
        text,
        url: 'https://musing-snyder.vercel.app',
      })
    } catch {}
  } else {
    await navigator.clipboard.writeText(text)
  }
  return text
}

const FREE_KW = ['gol', 'la 1', 'la1', 'teledeporte', 'tdp', 'antena', 'lasexta', 'cuatro', 'telecinco', 'tve', 'rtve']
const PAY_KW = ['dazn', 'movistar', 'laliga', 'ppv', 'm+']
const INTL_COMPS = ['Amistoso', 'UEFA Nations League', 'Clasificación Mundial', 'Eurocopa', 'Copa América']

/** Plataformas unificadas para el filtro de canal */
const PLATFORM_GROUPS: { label: string; kw: string[] }[] = [
  { label: 'Movistar+',        kw: ['m+', 'movistar plus', 'movistar+'] },
  { label: 'DAZN',             kw: ['dazn'] },
  { label: 'LaLiga TV',        kw: ['laliga tv', 'laliga+', 'laliga+ plus'] },
  { label: 'GOL',              kw: ['gol'] },
  { label: 'Orange Fútbol',    kw: ['orange fútbol', 'orange futbol'] },
  { label: 'Teledeporte/RTVE', kw: ['teledeporte', 'rtve', 'tdp'] },
  { label: 'TV autonómica',    kw: ['tv3', 'canal sur', 'tv canaria', 'aragón', 'aragon', 'esport3', 'ten tv'] },
  { label: 'YouTube / Gratis', kw: ['youtube', 'fifa+', 'uefa tv', 'conmebol', 'concacaf', 'fanatiz'] },
  { label: 'OneFootball',      kw: ['onefootball'] },
]
function matchesPlatform(ch: string[], platform: string): boolean {
  const kws = PLATFORM_GROUPS.find(p => p.label === platform)?.kw ?? []
  return ch.some(c => kws.some(k => c.toLowerCase().includes(k)))
}

/**
 * Fuzzy team name match: cubre abreviaciones ESPN vs nombres completos WOSTI
 * ej. "C Palace" → "Crystal Palace", "Man United" → "Manchester United"
 */
function fuzzyTeam(a: string, b: string): boolean {
  const al = a.toLowerCase(), bl = b.toLowerCase()
  if (al === bl) return true
  if (al.includes(bl) || bl.includes(al)) return true
  const aParts = al.split(/[\s.]+/)
  const bParts = bl.split(/[\s.]+/)
  const af = aParts[0], bf = bParts[0]
  // Coincidencia por prefijo de 3 chars en la primera palabra
  if (Math.min(af.length, bf.length) >= 3 && (af.startsWith(bf.slice(0, 3)) || bf.startsWith(af.slice(0, 3)))) return true
  // Coincidencia por última palabra significativa (≥4 chars): "C Palace" → "Crystal Palace"
  const al_last = aParts[aParts.length - 1]
  const bl_last = bParts[bParts.length - 1]
  if (al_last.length >= 4 && al_last === bl_last) return true
  return false
}

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
  const [page, setPage] = useState<'main' | 'comp' | 'features'>('main')
  const [currentComp, setCurrentComp] = useState('')
  const [compTab, setCompTab] = useState<'partidos' | 'resultados' | 'tabla'>('partidos')
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
  /* All week matches for selects */ const [weekMatches, setWeekMatches] = useState<Match[]>([])
  /* API data source indicator */ const [dataSource, setDataSource] = useState<'demo' | 'api'>('demo')
  /* Loading indicator */ const [loadingMatches, setLoadingMatches] = useState(true)
  /* Filtro de canal/plataforma */ const [channelFilter, setChannelFilter] = useState('')
  /* New: polls */ const [polls, setPolls] = useState<Record<number, 'home' | 'away'>>({})
  /* New: interest counters */ const [interests, setInterests] = useState<Record<number, number>>({})
  /* New: notifications */ const [notifEnabled, setNotifEnabled] = useState(false)
  /* CMS featured match */ const [cmsFeatured, setCmsFeatured] = useState<Match | null>(null)
  /* Onboarding */ const [obStep, setObStep] = useState<null | 'modal' | 'c1' | 'c2' | 'c3'>(null)
  const [obModalPage, setObModalPage] = useState(1)

  const drawerRef = useRef<HTMLElement>(null)
  const drawerBtnRef = useRef<HTMLButtonElement>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const T = darkMode ? DARK : LIGHT

  // Correct selectedDate to real Madrid-timezone today (fixes SSR static build stale date)
  useEffect(() => {
    const actual = getMadridToday()
    setSelectedDate(actual)
  }, [])

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
      if (!localStorage.getItem('md-onboarding-done')) setObStep('modal')
    } catch {}
  }, [])

  // Close drawer on Escape + lock body scroll when open or onboarding active
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (obStep) { skipOb(); return }
        if (menuOpen) { setMenuOpen(false); drawerBtnRef.current?.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = (menuOpen || !!obStep) ? 'hidden' : ''
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [menuOpen, obStep])

  // Persist
  useEffect(() => { try { localStorage.setItem('md-favorites', JSON.stringify(favorites)) } catch {} }, [favorites])
  useEffect(() => { try { localStorage.setItem('md-polls', JSON.stringify(polls)) } catch {} }, [polls])
  useEffect(() => { try { localStorage.setItem('md-interests', JSON.stringify(interests)) } catch {} }, [interests])
  // Persist dark mode
  useEffect(() => {
    try { localStorage.setItem('md-darkmode', String(darkMode)) } catch {}
    document.body.style.background = T.bg
  }, [darkMode, T.bg])

  // Fetch ALL week matches for selects (competiciones, equipos, favoritos) — ESPN + WOSTI merged
  useEffect(() => {
    const fetchWeek = async () => {
      const dates = Array.from({ length: 14 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() + (i - 1))
        const [dd, mm, yyyy] = new Intl.DateTimeFormat('es-ES', {
          timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
        }).format(d).split('/')
        return `${yyyy}-${mm}-${dd}`
      })

      // Fuente de partidos: SportMonks (primario) → ESPN (fallback) — NUNCA aportan canales
      // Fuente de canales: EXCLUSIVAMENTE WOSTI (/api/matches)
      const [espnResults, wostiResults] = await Promise.all([
        Promise.allSettled(dates.map(d => fetch(`/api/allmatches?date=${d}`).then(r => r.json()).catch(() => ({ matches: [] })))),
        Promise.allSettled(dates.map(d => fetch(`/api/matches?date=${d}`).then(r => r.json()).catch(() => ({ matches: [] })))),
      ])

      // Construir mapa WOSTI por fecha — incluye home/away de WOSTI para normalizar nombres
      type WE = { time: string; home: string; away: string; chs: string[] }
      const wostiByDate: Record<string, WE[]> = {}
      wostiResults.forEach((r, i) => {
        if (r.status === 'fulfilled' && Array.isArray(r.value.matches)) {
          wostiByDate[dates[i]] = (r.value.matches as Record<string, unknown>[])
            .map(m => ({
              time: String(m.time || ''),
              home: String(m.home || ''),
              away: String(m.away || ''),
              chs: Array.isArray(m.channels)
                ? (m.channels as { name: string }[]).map(c => c.name)
                : [],
            }))
            .filter((w: WE) => w.chs.length > 0)
        }
      })

      const all: Match[] = []
      espnResults.forEach((r, i) => {
        if (r.status !== 'fulfilled' || !Array.isArray(r.value.matches)) return
        const wostiList = wostiByDate[dates[i]] || []
        const usedW = new Set<number>()
        for (const m of r.value.matches as Record<string, unknown>[]) {
          let ch: string[] = []
          let home = String(m.home || '')
          let away = String(m.away || '')
          const mTime = String(m.time || '00:00')
          for (let j = 0; j < wostiList.length; j++) {
            if (usedW.has(j)) continue
            const w = wostiList[j]
            const td = Math.abs(
              (parseInt(mTime.split(':')[0]) * 60 + parseInt(mTime.split(':')[1])) -
              (parseInt(w.time.split(':')[0]) * 60 + parseInt(w.time.split(':')[1]))
            )
            if (td <= 30 && fuzzyTeam(home, w.home)) {
              usedW.add(j)
              ch = w.chs
              home = w.home  // normalizar nombre con WOSTI
              away = w.away  // normalizar nombre con WOSTI
              break
            }
          }
          all.push({ id: m.id as number, time: mTime, date: String(m.date || ''), home, away, comp: String(m.comp || ''), ch, score: m.score as Match['score'] })
        }
      })

      setWeekMatches(all)
    }
    fetchWeek()
  }, [])

  // Fetch matches: ESPN (all comps) + WOSTI (TV channels), merged
  useEffect(() => {
    const fetchMatches = async () => {
      setLoadingMatches(true)
      try {
        // Fuente de partidos: SportMonks → ESPN fallback (lista+competición, NUNCA canales)
        // Fuente de canales: EXCLUSIVAMENTE WOSTI (/api/matches)
        const [espnRes, wostiRes] = await Promise.all([
          fetch(`/api/allmatches?date=${selectedDate}`).then(r => r.json()).catch(() => ({ matches: [] })),
          fetch(`/api/matches?date=${selectedDate}`).then(r => r.json()).catch(() => ({ matches: [] })),
        ])

        const espnMatches: Match[] = (espnRes.matches || []).map((m: Record<string, unknown>) => ({
          id: m.id, time: m.time, date: m.date, home: m.home, away: m.away, comp: m.comp,
          ch: [],  // canales SOLO de WOSTI — ESPN/SportMonks no aportan
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

        // Usar fuzzyTeam global (definida a nivel de módulo)

        // Merge: ESPN matches con WOSTI (time + fuzzy home)
        // Cuando hay match: usar nombre home/away de WOSTI (normalización)
        const usedWosti = new Set<number>()
        const merged = espnMatches.map(m => {
          for (let i = 0; i < wostiList.length; i++) {
            if (usedWosti.has(i)) continue
            const w = wostiList[i]
            const timeDiff = Math.abs(
              parseInt(m.time.split(':')[0]) * 60 + parseInt(m.time.split(':')[1]) -
              parseInt(w.time.split(':')[0]) * 60 - parseInt(w.time.split(':')[1])
            )
            if (timeDiff <= 30 && fuzzyTeam(m.home, w.home)) {
              usedWosti.add(i)
              // Normalizar: nombres de WOSTI son la fuente de verdad
              return { ...m, home: w.home, away: w.away, ch: w.chs }
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
          .map((wm, i) => ({
            id: 3000 + i,
            time: String(wm.time || '??:??'),
            date: selectedDate,
            home: String(wm.home || '?'),
            away: String(wm.away || '?'),
            comp: String(wm.comp || ''),
            ch: wm.chs,
          }))

        const all = [...merged, ...wostiOnly]
        all.sort((a, b) => a.time.localeCompare(b.time))

        setLiveMatches(all)
        setDataSource(all.length > 0 ? 'api' : 'demo')
      } catch {
        setLiveMatches([])
      } finally {
        setLoadingMatches(false)
      }
    }
    fetchMatches()
  }, [selectedDate])

  // Fetch CMS featured match from Sanity
  useEffect(() => {
    fetch('/api/featured').then(r => r.json()).then(({ match }) => {
      if (match?.override && match?.home) {
        setCmsFeatured({ id: 99999, time: match.time, date: match.date, home: match.home, away: match.away, comp: match.competition ?? '', ch: match.channels ?? [] })
      }
    }).catch(() => {})
  }, [])

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

  // Sync search (sin debounce — respuesta inmediata)
  useEffect(() => {
    setDebouncedSearch(searchQuery)
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

  // Merged week: liveMatches for today (has WOSTI channels) + weekMatches for other dates
  const mergedWeek = useMemo(() => {
    const liveIds = new Set(liveMatches.filter(m => m.date === today).map(m => m.id))
    const todayLive = liveMatches.filter(m => m.date === today)
    const todayExtra = weekMatches.filter(m => m.date === today && !liveIds.has(m.id))
    const otherDays = weekMatches.filter(m => m.date !== today)
    return [...todayLive, ...todayExtra, ...otherDays]
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  }, [liveMatches, weekMatches, today])

  const baseMatches = (viewMode === 'week' || compFilter || teamFilter || channelFilter || debouncedSearch)
    ? mergedWeek   // today with channels + other days from weekMatches
    : allMatches.filter(m => m.date === selectedDate)

  // Selects use week data so all teams/comps are always visible
  const selectSource = weekMatches.length > 0 ? weekMatches : allMatches

  // Ligas que aparecen en el selector de equipos (evita equipos de ligas menores/desconocidas)
  const TEAM_COMP_GROUPS: { label: string; comps: string[] }[] = [
    { label: 'LaLiga EA Sports',     comps: ['LaLiga EA Sports'] },
    { label: 'LaLiga Hypermotion',   comps: ['LaLiga Hypermotion'] },
    { label: 'Copa del Rey',         comps: ['Copa del Rey'] },
    { label: 'Liga F',               comps: ['Liga F'] },
    { label: 'Primera Federación',   comps: ['Primera Federación'] },
    { label: 'Champions League',     comps: ['Champions League'] },
    { label: 'Europa League',        comps: ['Europa League'] },
    { label: 'Conference League',    comps: ['Conference League'] },
    { label: 'Premier League',       comps: ['Premier League', 'FA Cup'] },
    { label: 'Bundesliga',           comps: ['Bundesliga', '2. Bundesliga'] },
    { label: 'Serie A',              comps: ['Serie A'] },
    { label: 'Ligue 1',              comps: ['Ligue 1'] },
    { label: 'Otras ligas europeas', comps: ['Eredivisie', 'Primeira Liga', 'Süper Lig', 'Scottish Premiership'] },
    { label: 'MLS',                  comps: ['MLS'] },
    { label: 'Liga MX',              comps: ['Liga MX'] },
    { label: 'Sudamérica',           comps: ['Primera División Argentina', 'Serie A Brasil', 'Copa Libertadores', 'Copa Sudamericana'] },
    { label: 'Resto del mundo',      comps: ['Saudi Pro League'] },
  ]
  const TEAM_MAJOR_COMPS = new Set(TEAM_COMP_GROUPS.flatMap(g => g.comps))
  const teamsByGroup = TEAM_COMP_GROUPS.map(g => ({
    label: g.label,
    teams: Array.from(new Set(
      selectSource.filter(m => g.comps.includes(m.comp) && !INTL_COMPS.includes(m.comp))
        .flatMap(m => [m.home, m.away])
    )).sort(),
  })).filter(g => g.teams.length > 0)
  const nationalTeamsByGroup = TEAM_COMP_GROUPS.filter(g =>
    g.comps.some(c => INTL_COMPS.includes(c))
  ).map(g => ({
    label: g.label,
    teams: Array.from(new Set(
      selectSource.filter(m => g.comps.includes(m.comp) && INTL_COMPS.includes(m.comp))
        .flatMap(m => [m.home, m.away])
    )).sort(),
  })).filter(g => g.teams.length > 0)
  // Backward-compat (still used in some places)
  const allComps = Array.from(new Set(selectSource.filter(m => TEAM_MAJOR_COMPS.has(m.comp)).map(m => m.comp))).filter(Boolean)
    .sort((a, b) => {
      const order = (c: string) => {
        const idx = TEAM_COMP_GROUPS.findIndex(g => g.comps.includes(c))
        return idx === -1 ? 99 : idx
      }
      return order(a) - order(b)
    })

  const filtered = useMemo(() => baseMatches.filter(m => {
    if (filter === 'free') return m.ch.length === 0 || m.ch.some(c => FREE_KW.some(k => c.toLowerCase().includes(k)))
    if (filter === 'pay')  return m.ch.length === 0 || m.ch.some(c => PAY_KW.some(k => c.toLowerCase().includes(k)))
    if (filter === 'favs') return favorites.includes(m.home) || favorites.includes(m.away)
    return true
  }).filter(m => {
    if (compFilter && m.comp !== compFilter) return false
    if (teamFilter && m.home !== teamFilter && m.away !== teamFilter) return false
    if (channelFilter && !matchesPlatform(m.ch, channelFilter)) return false
    if (debouncedSearch) {
      const q = normalize(debouncedSearch)
      return (
        normalize(m.home).includes(q) ||
        normalize(m.away).includes(q) ||
        normalize(m.comp).includes(q) ||
        m.ch.some(c => normalize(c).includes(q))
      )
    }
    return true
  }), [baseMatches, filter, compFilter, teamFilter, channelFilter, debouncedSearch, favorites])

  // Navegación inteligente: si hay filtro activo y no hay partidos hoy, buscar el próximo día con resultados
  const nextMatchDate = useMemo(() => {
    if (viewMode === 'week') return null
    if (filtered.length > 0) return null
    if (!compFilter && !teamFilter && !debouncedSearch && filter === 'all') return null
    const applyFilter = (ms: Match[]) => ms.filter(m => {
      if (compFilter && m.comp !== compFilter) return false
      if (teamFilter && m.home !== teamFilter && m.away !== teamFilter) return false
      if (debouncedSearch) {
        const q = normalize(debouncedSearch)
        return normalize(m.home).includes(q) || normalize(m.away).includes(q) || normalize(m.comp).includes(q)
      }
      return true
    })
    const futureDates = Array.from(new Set(weekMatches.map(m => m.date))).sort().filter(d => d > selectedDate)
    for (const d of futureDates) {
      if (applyFilter(weekMatches.filter(m => m.date === d)).length > 0) return d
    }
    return null
  }, [filtered.length, weekMatches, selectedDate, compFilter, teamFilter, debouncedSearch, filter, viewMode])

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

  // Competition sort order: España → Copas EUR → Europa → América → Mundo
  const COMP_ORDER: Record<string, number> = {
    'LaLiga EA Sports': 1, 'LaLiga Hypermotion': 2, 'Liga F': 3,
    'Primera Federación': 4, 'Segunda Federación': 5, 'Tercera Federación': 6,
    'Copa del Rey': 7, 'Supercopa': 8,
    'Champions League': 10, 'Europa League': 11, 'Conference League': 12, 'UEFA Nations League': 13,
    'Premier League': 20, 'Bundesliga': 21, '2. Bundesliga': 22, 'Serie A': 23, 'Serie B Italiana': 24,
    'Ligue 1': 25, 'Jupiler Pro League': 26, 'Scottish Premiership': 27,
    'MLS': 40, 'Liga MX': 41,
    'Primera División Argentina': 50, 'Liga Colombiana': 51, 'Serie A Brasil': 52,
  }
  const compSortKey = (comp: string) => COMP_ORDER[comp] ?? 99

  // Featured match: CMS override → else top-priority comp + soonest time today
  const featuredMatch = useMemo(() => {
    if (cmsFeatured) return cmsFeatured
    const todayMatches = allMatches.filter(m => m.date === today && !isPast(m.time, m.date))
    if (!todayMatches.length) return null
    return [...todayMatches].sort((a, b) => {
      const ca = compSortKey(a.comp), cb = compSortKey(b.comp)
      if (ca !== cb) return ca - cb
      return a.time.localeCompare(b.time)
    })[0]
  }, [cmsFeatured, allMatches])

  const selectDay = (d: string) => { setSelectedDate(d); setFilter('all'); setCompFilter(''); setTeamFilter(''); setChannelFilter(''); setViewMode('day') }
  const resetAll = () => { setFilter('all'); setCompFilter(''); setTeamFilter(''); setChannelFilter(''); setSelectedDate(today); setSearchQuery(''); setViewMode('day') }
  const showComp = async (name: string) => {
    setCurrentComp(name); setPage('comp'); setMenuOpen(false); setLoadingComp(true); setLiveComp(null)
    setCompTab('partidos')   // siempre abre en Partidos y TV
    try {
      const res = await fetch(`/api/standings?comp=${encodeURIComponent(name)}`)
      const data = await res.json()
      if (data.table?.length || data.results?.length || data.next?.length) {
        const emoji = COMPS[name]?.emoji || '⚽'
        setLiveComp({ emoji, table: data.table || [], results: data.results || [], next: data.next || [] })
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

  const dayButtons = Array.from({ length: 14 }, (_, i) => {
    const base = new Date()
    base.setDate(base.getDate() + (i - 1))
    const [dd, mm, yyyy] = new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(base).split('/')
    const d = `${yyyy}-${mm}-${dd}`
    const label = i === 0 ? 'Ayer'
      : i === 1 ? 'Hoy'
      : i === 2 ? 'Mañana'
      : new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
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
              : <div style={{ fontSize: 9, color: T.gray, textTransform: 'uppercase', marginTop: 1 }}>{past ? 'Jugado' : matchDayLabel(m.date)}</div>
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
          <div className="match-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, minWidth: 0, maxWidth: 'min(200px, 42vw)', overflow: 'hidden' }}>
            {showScores && m.score && (m.score.st !== 'FT' || past) && <ScoreBox score={m.score} />}
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '100%' }}>
              {(expanded ? m.ch : m.ch.slice(0, 3)).map((c, i) => <ChTag key={i} name={c} />)}
              {!expanded && m.ch.length > 3 && (
                <button onClick={e => { e.stopPropagation(); setExpandedMatch(m.id) }}
                  style={{ fontSize: 9, fontWeight: 700, color: T.red, padding: '2px 5px', border: `1px solid ${T.red}`, borderRadius: 1, whiteSpace: 'nowrap', background: T.redLight, cursor: 'pointer', fontFamily: 'inherit' }}>
                  +{m.ch.length - 3} canales
                </button>
              )}
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

  /* ── Onboarding helpers ──────────────────────────────────────── */
  const doneOb = () => { try { localStorage.setItem('md-onboarding-done', '1') } catch {} }
  const advanceOb = () => {
    if (obStep === 'modal') {
      if (obModalPage < 3) { setObModalPage(p => p + 1); return }
      setObModalPage(1); setObStep('c1'); return
    }
    if (obStep === 'c3') doneOb()
    setObStep(prev => {
      if (prev === 'c1') return 'c2'
      if (prev === 'c2') return 'c3'
      return null
    })
  }
  const skipOb = () => { doneOb(); setObStep(null); setObModalPage(1) }

  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", background: T.bg, color: T.text, minHeight: '100vh', transition: 'background .3s, color .3s' }}>
      {/* Feature 9: Schema.org */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bg};transition:background .3s;font-family:'Helvetica Neue',Arial,sans-serif}
        .ch-tag{font-size:9px;font-weight:800;padding:2px 6px;border-radius:1px;border-width:1px;border-style:solid;white-space:nowrap;text-transform:uppercase;letter-spacing:.5px;max-width:100%;overflow:hidden;text-overflow:ellipsis;display:block}
        .match-row{display:grid;grid-template-columns:52px 1fr auto;align-items:center;gap:9px;padding:10px 12px;border-bottom:1px solid ${T.border};border-left:4px solid ${T.red};background:${T.cardBg};transition:background .15s}
        .match-row:hover{background:${darkMode ? '#161616' : '#f9f9f9'};border-left-color:${T.yellow}}
        .match-row.past{opacity:.45;border-left:4px solid #ccc;background:${T.lightGray}}
        .match-row.past:hover{background:${T.lightGray};border-left-color:#ccc}
        .md-logo{display:flex;align-items:center;cursor:pointer;user-select:none;background:none;border:none;padding:0}
        .md-logo img{height:30px;width:auto;display:block}
        .comp-label{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:900;color:#fff;background:#E30613;padding:3px 8px 3px 0;border:none;cursor:pointer;font-family:inherit;text-transform:uppercase;letter-spacing:.8px}
        .comp-label::before{content:'';display:inline-block;width:3px;height:14px;background:#FFD700;margin-right:5px}
        .day-header{display:flex;align-items:center;margin:14px 0 6px;background:${darkMode?'#111':'#000'};padding:7px 12px;border-left:4px solid #E30613}
        .day-header span{font-size:11px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:1.2px}
        .day-header .count{font-size:10px;color:#888;margin-left:auto}
        @keyframes pulse-soon{0%,100%{opacity:1}50%{opacity:.4}}
        .soon-badge{animation:pulse-soon 1.5s infinite;color:#E30613!important}
        .featured-hero{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:12px 14px;background:#000;border-bottom:3px solid #E30613}
        .featured-hero-cta{white-space:nowrap}
        @media(max-width:540px){
          .featured-hero{grid-template-columns:auto 1fr;grid-template-rows:auto auto}
          .featured-hero-cta{grid-column:1/-1;text-align:center;padding:8px 0}
          .match-row{grid-template-columns:46px 1fr;grid-template-rows:auto auto;gap:5px}
          .match-right{grid-column:2;flex-direction:row;justify-content:flex-start;flex-wrap:wrap}
        }
        .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        .skip-nav{position:absolute;top:-44px;left:0;padding:8px 14px;background:#E30613;color:#fff;font-size:12px;font-weight:700;z-index:1000;transition:top .2s;border-radius:0 0 4px 0;text-decoration:none}
        .skip-nav:focus{top:0}
        :focus-visible{outline:2px solid #E30613;outline-offset:2px}
        .drawer-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:299;animation:fadeIn .2s}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .nav-drawer{position:fixed;top:0;left:0;height:100%;width:min(320px,calc(100vw - 48px));background:${T.bg};z-index:300;overflow-y:auto;transform:translateX(-100%);transition:transform .25s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 20px rgba(0,0,0,.25)}
        .nav-drawer.open{transform:translateX(0)}
        .days-bar{overflow-x:auto;white-space:nowrap;scrollbar-width:none;-webkit-overflow-scrolling:touch;background:${T.bg};border-bottom:2px solid ${T.border};position:sticky;top:47px;z-index:90}
        .days-bar::-webkit-scrollbar{display:none}
        .day-tab{display:inline-flex;align-items:center;justify-content:center;padding:0 14px;background:none;border:none;border-bottom:3px solid transparent;cursor:pointer;font-size:12px;font-weight:600;color:${T.gray};font-family:inherit;height:44px;min-width:54px;white-space:nowrap;transition:color .15s,border-color .15s;margin-bottom:-2px}
        .day-tab[aria-selected="true"]{color:${T.red};border-bottom-color:${T.red};font-weight:800}
        .day-tab:hover{color:${T.text}}
        .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:${darkMode?'#111':'#fff'};border-top:2px solid #E30613;display:flex;z-index:100;box-shadow:0 -2px 12px rgba(0,0,0,.15)}
        .bottom-nav-btn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:8px 4px;background:none;border:none;cursor:pointer;font-family:inherit;color:${T.gray};min-height:56px;transition:color .15s;-webkit-tap-highlight-color:transparent}
        .bottom-nav-btn[aria-current="page"],.bottom-nav-btn[aria-pressed="true"]{color:#E30613}
        .bottom-nav-btn svg{flex-shrink:0}
        .bottom-nav-btn span{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
        .nav-main-content{padding-bottom:72px}
        @media(min-width:768px){.bottom-nav{display:none}.nav-main-content{padding-bottom:0!important}}
        @keyframes ob-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .ob-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:950;display:flex;align-items:center;justify-content:center;animation:ob-fade .2s ease}
        .ob-modal{background:#111;border:2px solid #E30613;border-radius:10px;padding:30px 22px 22px;max-width:340px;width:calc(100vw - 32px);text-align:center;position:relative;animation:ob-fade .25s ease}
        .ob-skip{position:absolute;top:10px;right:12px;background:none;border:none;color:#888;font-size:20px;cursor:pointer;line-height:1;padding:4px 8px}
        .ob-logo{display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:18px}
        .ob-feat{display:flex;flex-direction:column;gap:10px;margin-bottom:22px;text-align:left}
        .ob-feat li{display:flex;align-items:center;gap:10px;color:#ddd;font-size:12px;list-style:none}
        .ob-feat li span:first-child{font-size:18px;flex-shrink:0}
        .ob-btn{width:100%;background:#E30613;color:#fff;border:none;padding:12px;border-radius:5px;font-size:13px;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:.8px;font-family:inherit;transition:opacity .15s}
        .ob-btn:hover{opacity:.9}
        .ob-coach-wrap{position:fixed;inset:0;z-index:950;pointer-events:none}
        .ob-dim{position:absolute;inset:0;background:rgba(0,0,0,.72);pointer-events:all}
        .ob-card{position:fixed;left:50%;transform:translateX(-50%);background:#111;border:2px solid #E30613;border-radius:8px;padding:16px;max-width:280px;width:calc(100vw - 40px);z-index:952;box-shadow:0 8px 32px rgba(0,0,0,.8);pointer-events:all}
        .ob-card::before{content:'';position:absolute;left:50%;transform:translateX(-50%);border:8px solid transparent}
        .ob-card.arrow-up::before{top:-16px;border-bottom-color:#E30613}
        .ob-card.arrow-down::before{bottom:-16px;border-top-color:#E30613}
        .ob-prog{display:flex;gap:5px;justify-content:center;margin-bottom:12px}
        .ob-dot{width:6px;height:6px;border-radius:50%;background:#333;transition:background .2s}
        .ob-dot.on{background:#E30613}
        .ob-ring{position:fixed;border:2.5px solid #E30613;border-radius:5px;pointer-events:none;z-index:951}
        @keyframes ob-pulse{0%,100%{box-shadow:0 0 0 0 rgba(227,6,19,.5)}60%{box-shadow:0 0 0 8px transparent}}
        .ob-ring{animation:ob-pulse 1.4s infinite}
        .ob-actions{display:flex;flex-direction:column;gap:6px;margin-top:12px}
        .ob-link{background:none;border:none;color:#999;font-size:11px;cursor:pointer;font-family:inherit;padding:4px;text-decoration:underline}
        .ob-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
        .ob-cell{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:6px;padding:10px 10px 8px;text-align:left}
        .ob-cell-icon{font-size:20px;margin-bottom:4px}
        .ob-cell-title{font-size:11px;font-weight:700;color:#fff;display:block;margin-bottom:2px}
        .ob-cell-desc{font-size:10px;color:#666;line-height:1.4}
        .ob-pager{display:flex;gap:6px;justify-content:center;margin-bottom:16px}
        .ob-pdot{width:20px;height:3px;border-radius:2px;background:#333;transition:background .2s,width .2s;cursor:pointer;border:none}
        .ob-pdot.on{background:#E30613;width:28px}
        .ob-step3-msg{background:linear-gradient(135deg,#1a0000,#0d0d0d);border:1px solid #E30613;border-radius:8px;padding:14px;margin-bottom:16px;text-align:left}
        .feat-page{padding:0 14px 100px;max-width:600px;margin:0 auto}
        .feat-section{margin-bottom:28px}
        .feat-section-title{font-size:10px;font-weight:900;color:#E30613;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #222}
        .feat-card{display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #1a1a1a}
        .feat-card:last-child{border-bottom:none}
        .feat-icon{font-size:24px;flex-shrink:0;width:36px;text-align:center;margin-top:2px}
        .feat-body{}
        .feat-title{font-size:13px;font-weight:800;color:${T.text};margin-bottom:3px}
        .feat-desc{font-size:11px;color:${T.gray};line-height:1.5}
        .feat-badge{display:inline-block;font-size:9px;font-weight:700;background:#E30613;color:#fff;padding:1px 5px;border-radius:2px;margin-left:6px;vertical-align:middle;text-transform:uppercase}
      `}</style>

      {/* Skip navigation */}
      <a href="#main-content" className="skip-nav">Ir al contenido</a>

      {/* Toast */}
      {toast && <div role="status" aria-live="polite" style={{ position: 'fixed', bottom: 76, left: '50%', transform: 'translateX(-50%)', background: T.red, color: '#fff', padding: '6px 16px', borderRadius: 4, fontSize: 12, fontWeight: 700, zIndex: 999 }}>{toast}</div>}

      {/* HEADER */}
      <header role="banner" style={{ background: '#000', padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, borderBottom: `3px solid #E30613` }}>
        <button className="md-logo" onClick={showMain} aria-label="Mundo Deportivo · Ir al inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-md.jpeg" alt="Mundo Deportivo" height="36" style={{ display: 'block', borderRadius: 6 }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#aaa', padding: '4px', lineHeight: 1 }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div aria-live="polite" aria-atomic="true" style={{ fontSize: 10, color: '#aaa', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 700, letterSpacing: .5 }}>
            <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: '#E30613', display: 'inline-block', boxShadow: '0 0 6px #E30613' }} />
            <span>EN DIRECTO · {clock}</span>
          </div>
        </div>
      </header>

      {/* DRAWER OVERLAY */}
      {menuOpen && (
        <>
          <div className="drawer-overlay" onClick={() => { setMenuOpen(false); drawerBtnRef.current?.focus() }} aria-hidden="true" />
          <nav id="nav-drawer" ref={drawerRef} role="dialog" aria-modal="true" aria-label="Menú de competiciones" className={`nav-drawer${menuOpen ? ' open' : ''}`}>
            <div style={{ position: 'sticky', top: 0, background: '#000', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #E30613', zIndex: 1 }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Competiciones</span>
              <button onClick={() => { setMenuOpen(false); drawerBtnRef.current?.focus() }}
                aria-label="Cerrar menú de competiciones"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20, lineHeight: 1, padding: '4px 6px' }}>✕</button>
            </div>
            {[
              { label: 'España', comps: ['LaLiga EA Sports', 'LaLiga Hypermotion', 'Primera Federación', 'Segunda Federación', 'Tercera Federación', 'Liga F', 'Copa del Rey'] },
              { label: 'Copas Internacionales', comps: ['Champions League', 'Europa League', 'Conference League', 'UEFA Nations League'] },
              { label: 'Europa', comps: ['Premier League', 'Bundesliga', 'Serie A', 'Ligue 1', 'Jupiler Pro League', 'Scottish Premiership', 'Admiral Bundesliga', '2. Bundesliga', 'Superliga Danesa', 'Liga Polaca', 'Premier League Ucrania'] },
              { label: 'América', comps: ['MLS', 'Liga MX', 'Primera División Argentina', 'Primera Nacional Argentina', 'Liga Colombiana', 'Serie A Brasil', 'Liga 1 Perú', 'Liga AUF Uruguaya', 'Liga Pro Ecuador', 'Liga Futve', 'Copa Libertadores', 'Copa Sudamericana'] },
              { label: 'Resto del mundo', comps: ['Saudi Pro League', 'Chinese Super League', 'A-League', 'UAE Division 1'] },
            ].map(({ label, comps }) => {
              const available = comps.filter(name => COMPS[name])
              if (!available.length) return null
              return (
                <div key={label} role="group" aria-label={label}>
                  <div style={{ padding: '8px 14px 4px', fontSize: 9, fontWeight: 800, color: T.gray, textTransform: 'uppercase', letterSpacing: 1.2, background: darkMode ? '#0d0d0d' : '#f5f5f5', borderBottom: `1px solid ${T.border}` }}>{label}</div>
                  {available.map(name => (
                    <button key={name} onClick={() => showComp(name)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', fontSize: 13, color: T.text, fontFamily: 'inherit', textAlign: 'left', minHeight: 48 }}>
                      <span aria-hidden="true">{COMPS[name].emoji}</span> {name}
                    </button>
                  ))}
                </div>
              )
            })}
          </nav>
        </>
      )}

      {/* ══════════ MAIN PAGE ══════════ */}
      <main id="main-content" className="nav-main-content">
      {page === 'main' && (
        <>
          <div style={{ background: darkMode ? '#0d0d0d' : '#fff', padding: '10px 14px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 4, height: 36, background: '#E30613', borderRadius: 1, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: '#E30613', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 1 }}>Fútbol · Guía TV</div>
              <h1 style={{ fontSize: 20, fontWeight: 900, fontStyle: 'italic', color: T.text, lineHeight: 1.1 }}>Fútbol en la TV hoy</h1>
            </div>
          </div>

          {/* Featured match hero */}
          {featuredMatch && viewMode === 'day' && selectedDate === today && !debouncedSearch && (
            <div className="featured-hero" role="region" aria-label="Partido destacado">
              <div style={{ background: '#E30613', padding: '8px 12px', textAlign: 'center', flexShrink: 0, minWidth: 52 }}>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1 }}>{featuredMatch.time}</div>
                <div style={{ fontSize: 7, color: '#fffa', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Destacado</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 8, fontWeight: 800, color: '#FFD700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3 }}>{featuredMatch.comp}</div>
                <div style={{ fontWeight: 900, fontSize: 15, color: '#fff', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {featuredMatch.home} <span style={{ color: '#E30613' }}>vs</span> {featuredMatch.away}
                </div>
                {featuredMatch.ch.length > 0 && (
                  <div style={{ fontSize: 10, color: '#888', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{featuredMatch.ch.slice(0, 3).join(' · ')}</div>
                )}
              </div>
              {(() => { const cta = getMatchCTA(featuredMatch.ch); return cta ? (
                <a href={cta.url} target="_blank" rel="noreferrer" className="featured-hero-cta"
                  style={{ fontSize: 10, fontWeight: 800, padding: '7px 12px', background: 'transparent', color: cta.color, textDecoration: 'none', border: `2px solid ${cta.color}`, textTransform: 'uppercase', letterSpacing: .5 }}>{cta.text}</a>
              ) : null })()}
            </div>
          )}

          {/* Days bar — sticky horizontal scroll */}
          <div className="days-bar" role="tablist" aria-label="Seleccionar día">
            <div style={{ display: 'inline-flex', padding: '0 8px' }}>
              {dayButtons.map(db => (
                <button key={db.date} role="tab" aria-selected={viewMode === 'day' && selectedDate === db.date}
                  onClick={() => selectDay(db.date)} className="day-tab">{db.label}</button>
              ))}
              <button role="tab" aria-selected={viewMode === 'week'} aria-pressed={viewMode === 'week'}
                onClick={() => setViewMode(viewMode === 'week' ? 'day' : 'week')} className="day-tab">Semana</button>
              <span aria-hidden="true" style={{ display: 'inline-block', width: 1, height: 20, background: T.border, margin: '12px 4px' }} />
              <button aria-pressed={groupBy === 'channel'} aria-label={groupBy === 'channel' ? 'Agrupando por canal. Cambiar a por competición' : 'Agrupando por competición. Cambiar a por canal'}
                onClick={() => setGroupBy(groupBy === 'comp' ? 'channel' : 'comp')} className="day-tab" style={{ fontSize: 11 }}>
                {groupBy === 'channel' ? 'Por canal' : 'Por comp.'}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div style={{ padding: '8px 14px', borderBottom: `1px solid ${T.border}`, background: T.lightGray }}>
            {/* Search */}
            <div style={{ marginBottom: 7, position: 'relative' }}>
              <label htmlFor="search-tv" className="sr-only">Buscar equipo o competición</label>
              <input id="search-tv" type="search" placeholder="Buscar equipo o competición..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} aria-label="Buscar equipo o competición"
                style={{ width: '100%', padding: '7px 10px 7px 32px', border: `1px solid ${T.border}`, borderRadius: 2, background: T.white, color: T.text, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
              <svg aria-hidden="true" style={{ position: 'absolute', left: 10, top: 9, color: T.gray }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
              <button onClick={resetAll} aria-pressed={filter === 'all' && !compFilter && !teamFilter} style={tabBtn(filter === 'all' && !compFilter && !teamFilter)}>Todos</button>
              <button onClick={() => setFilter('free')} aria-pressed={filter === 'free'} style={tabBtn(filter === 'free')}>En abierto</button>
              <button onClick={() => setFilter('pay')} aria-pressed={filter === 'pay'} style={tabBtn(filter === 'pay')}>De pago</button>
              <label className="sr-only" htmlFor="filter-comp">Filtrar por competición</label>
              <select id="filter-comp" aria-label="Filtrar por competición" value={compFilter} onChange={e => { setCompFilter(e.target.value); setTeamFilter('') }}
                style={{ fontSize: 11, padding: '4px 7px', border: `1px solid ${T.border}`, borderRadius: 2, background: T.white, color: T.text, maxWidth: 150, fontFamily: 'inherit' }}>
                <option value="">Competición</option>
                {allComps.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="sr-only" htmlFor="filter-team">Filtrar por equipo</label>
              <select id="filter-team" aria-label="Filtrar por equipo" value={teamFilter} onChange={e => { setTeamFilter(e.target.value); setCompFilter('') }}
                style={{ fontSize: 11, padding: '4px 7px', border: `1px solid ${T.border}`, borderRadius: 2, background: T.white, color: T.text, maxWidth: 170, fontFamily: 'inherit' }}>
                <option value="">Equipo</option>
                {teamsByGroup.map(g => g.teams.length > 0 && (
                  <optgroup key={g.label} label={g.label}>
                    {g.teams.map(t => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                ))}
                {nationalTeamsByGroup.map(g => g.teams.length > 0 && (
                  <optgroup key={'sel-' + g.label} label={'Selecciones — ' + g.label}>
                    {g.teams.map(t => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                ))}
              </select>
              <label className="sr-only" htmlFor="filter-channel">Filtrar por canal</label>
              <select id="filter-channel" aria-label="Filtrar por canal" value={channelFilter} onChange={e => setChannelFilter(e.target.value)}
                style={{ fontSize: 11, padding: '4px 7px', border: `1px solid ${channelFilter ? T.red : T.border}`, borderRadius: 2, background: channelFilter ? T.redLight : T.white, color: channelFilter ? T.red : T.text, maxWidth: 130, fontFamily: 'inherit', fontWeight: channelFilter ? 700 : 400 }}>
                <option value="">Canal / Plataforma</option>
                {PLATFORM_GROUPS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
              </select>
              {(compFilter || teamFilter || channelFilter) && (
                <button onClick={() => { setCompFilter(''); setTeamFilter(''); setChannelFilter('') }} aria-label="Limpiar filtros"
                  style={{ fontSize: 11, padding: '4px 7px', border: `1px solid ${T.red}`, borderRadius: 2, background: T.redLight, color: T.red, cursor: 'pointer', fontFamily: 'inherit' }}>✕ Limpiar</button>
              )}
              {favorites.length > 0 && !notifEnabled && (
                <button onClick={enableNotifications} aria-label="Activar notificaciones para tus equipos favoritos"
                  style={{ fontSize: 11, padding: '4px 7px', border: `1px solid ${T.border}`, borderRadius: 2, background: T.white, color: T.gray, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <span aria-hidden="true">🔔</span> Avisos
                </button>
              )}
              {notifEnabled && <span aria-label="Notificaciones activas" role="img" style={{ fontSize: 10, color: '#22c55e' }}>🔔</span>}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
                <button role="switch" aria-checked={showScores} onClick={() => setShowScores(!showScores)} aria-label={showScores ? 'Ocultar resultados' : 'Mostrar resultados'}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '4px 8px', border: `1px solid ${showScores ? T.red : T.border}`, borderRadius: 2, background: showScores ? T.redLight : T.white, color: showScores ? T.red : T.gray, cursor: 'pointer', fontFamily: 'inherit', fontWeight: showScores ? 700 : 500 }}>
                  <span aria-hidden="true" style={{ width: 28, height: 14, borderRadius: 7, background: showScores ? T.red : '#ccc', position: 'relative', display: 'inline-block', transition: 'background .2s' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: showScores ? 16 : 2, transition: 'left .2s' }} />
                  </span>
                  Resultados
                </button>
                <span aria-live="polite" style={{ fontSize: 11, color: T.gray }}>{filtered.length} partido{filtered.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Active filters breadcrumb */}
          {(filter !== 'all' || compFilter || teamFilter || channelFilter || debouncedSearch || viewMode === 'week' || groupBy === 'channel') && (
            <div style={{ padding: '6px 14px', display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', borderBottom: `1px solid ${T.border}`, background: T.cardBg }}>
              <span style={{ fontSize: 10, color: T.gray }}>Filtros:</span>
              {filter === 'favs' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#f59e0b22', color: '#f59e0b', fontWeight: 600 }}>★ Mis equipos</span>}
              {filter === 'free' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#22c55e22', color: '#22c55e', fontWeight: 600 }}>En abierto</span>}
              {filter === 'pay' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#3b82f622', color: '#3b82f6', fontWeight: 600 }}>De pago</span>}
              {compFilter && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: T.redLight, color: T.red, fontWeight: 600 }}>{compFilter}</span>}
              {teamFilter && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: T.redLight, color: T.red, fontWeight: 600 }}>{teamFilter}</span>}
              {channelFilter && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#06b6d422', color: '#06b6d4', fontWeight: 600 }}>📺 {channelFilter}</span>}
              {debouncedSearch && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: T.redLight, color: T.red, fontWeight: 600 }}>"{debouncedSearch}"</span>}
              {viewMode === 'week' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#8b5cf622', color: '#8b5cf6', fontWeight: 600 }}>Semana</span>}
              {groupBy === 'channel' && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 2, background: '#06b6d422', color: '#06b6d4', fontWeight: 600 }}>Por canal</span>}
              <button onClick={resetAll} style={{ fontSize: 10, color: T.red, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>✕ Quitar todos</button>
            </div>
          )}

          {/* Match list */}
          <div style={{ padding: '8px 14px 40px', maxWidth: 880, margin: '0 auto' }}>
            {loadingMatches ? (
              <div style={{ textAlign: 'center', padding: 48, color: T.gray }}>
                <div style={{ fontSize: 24, marginBottom: 12, animation: 'pulse-soon 1.2s infinite' }}>⚽</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Cargando partidos…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: T.gray }}>
                <p style={{ fontSize: 28, marginBottom: 8 }}>📅</p>
                <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: T.text }}>No hay partidos</p>
                <p style={{ fontSize: 12, marginBottom: 14 }}>
                  {compFilter || teamFilter || debouncedSearch ? 'No hay partidos con ese filtro este día' : 'Sin partidos programados'}
                </p>
                {nextMatchDate && (
                  <button onClick={() => selectDay(nextMatchDate)}
                    style={{ fontSize: 12, padding: '8px 18px', background: T.red, color: '#fff', border: 'none', borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, marginBottom: 10 }}>
                    ➡ Próximo partido: {formatDayHeader(nextMatchDate)}
                  </button>
                )}
                <div>
                  <button onClick={resetAll} style={{ fontSize: 11, padding: '5px 12px', background: 'none', color: T.gray, border: `1px solid ${T.border}`, borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Quitar filtros · Ver hoy
                  </button>
                </div>
              </div>
            ) : (
              Object.keys(groupedByDay).sort().map(day => (
                <div key={day}>
                  <div className="day-header">
                    <span>{formatDayHeader(day)}</span>
                    <span className="count">{Object.values(groupedByDay[day]).flat().length} partidos</span>
                  </div>
                  {Object.entries(groupedByDay[day]).sort(([a], [b]) => compSortKey(a) - compSortKey(b)).map(([comp, matches]) => (
                    <div key={comp} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `2px solid ${darkMode ? '#222' : '#000'}`, marginBottom: 1 }}>
                        {/* Clic → filtrar por esta liga en la lista principal */}
                        <button onClick={() => { setCompFilter(f => f === comp ? '' : comp); setTeamFilter(''); setViewMode('day') }} className="comp-label">
                          {compFilter === comp ? '✕ ' : ''}{comp}
                        </button>
                        {/* Acceso rápido a clasificación / tabla */}
                        {COMPS[comp] && (
                          <button onClick={() => showComp(comp)} title="Ver tabla y resultados"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: T.gray, padding: '0 6px', fontFamily: 'inherit' }}>📊</button>
                        )}
                        <span style={{ fontSize: 10, color: T.gray, marginLeft: 'auto', fontWeight: 600 }}>{matches.length}p</span>
                      </div>
                      {matches.map(renderMatch)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: `3px solid #E30613`, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 3, height: 18, background: '#E30613', borderRadius: 1 }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: '#FFD700', textTransform: 'uppercase', letterSpacing: 1 }}>MUNDO</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 1 }}>DEPORTIVO</span>
              <div style={{ width: 3, height: 18, background: '#E30613', borderRadius: 1 }} />
              <span style={{ fontSize: 9, color: '#555', marginLeft: 4 }}>{dataSource === 'api' ? '● EN VIVO' : '○ Demo'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setPage('features')}
                style={{ fontSize: 9, color: '#555', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                title="Ver todas las funciones">
                ℹ️ Funciones
              </button>
              <span style={{ fontSize: 9, color: '#555' }}>{dateStr}</span>
            </div>
          </div>
        </>
      )}

      {/* ══════════ FEATURES PAGE ══════════ */}
      {page === 'features' && (
        <div className="nav-main-content" style={{ background: T.bg }}>
          {/* Header */}
          <div style={{ background: '#000', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '3px solid #E30613', position: 'sticky', top: 0, zIndex: 90 }}>
            <button onClick={() => setPage('main')} aria-label="Volver"
              style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 0 }}>←</button>
            <div>
              <p style={{ color: '#fff', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: .5 }}>Funcionalidades</p>
              <p style={{ color: '#E30613', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Fútbol en TV · Mundo Deportivo</p>
            </div>
          </div>

          <div className="feat-page">
            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg,#1a0000,#0d0d0d)', border: '1px solid #E30613', borderRadius: 8, padding: '18px 16px', margin: '16px 0 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>⚽</div>
              <p style={{ color: '#fff', fontSize: 15, fontWeight: 900, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>Fútbol en TV</p>
              <p style={{ color: '#aaa', fontSize: 12, lineHeight: 1.6 }}>La guía completa del fútbol en televisión. Más de 50 competiciones, resultados en directo y guía de canales TV en una sola app.</p>
              <button className="ob-btn" onClick={() => { setPage('main'); doneOb(); setObStep('modal'); setObModalPage(1) }}
                style={{ marginTop: 14, width: 'auto', padding: '10px 24px', fontSize: 12 }}>
                Ver el tour →
              </button>
            </div>

            {/* Partidos */}
            <div className="feat-section">
              <p className="feat-section-title">📺 Guía de televisión</p>
              {([
                ['📺','Canales de TV en tiempo real','Consulta qué canales emiten cada partido antes de que empiece: Movistar+, DAZN, La 1, Teledeporte, GOL y más.','Tiempo real'],
                ['⚡','Resultados en directo','Marcadores actualizados al minuto durante todos los partidos, con el minuto de juego exacto.','En directo'],
                ['🔔','Alertas de inicio','Activa notificaciones para recibir un aviso 15 minutos antes de que empiece un partido de tu equipo favorito.',null],
              ] as [string,string,string,string|null][]).map(([icon,title,desc,badge],i) => (
                <div key={i} className="feat-card">
                  <div className="feat-icon">{icon}</div>
                  <div className="feat-body">
                    <p className="feat-title">{title}{badge && <span className="feat-badge">{badge}</span>}</p>
                    <p className="feat-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Navegación */}
            <div className="feat-section">
              <p className="feat-section-title">📅 Navegación</p>
              {([
                ['📅','Navega entre días','Consulta la agenda de cualquier día de la semana. Desliza la barra de días para ir hacia atrás o hacia adelante.',null],
                ['📋','Vista semanal','Activa la vista semana para ver todos los partidos de 7 días de un vistazo.',null],
                ['🔍','Búsqueda de equipos','Busca cualquier equipo para filtrar todos sus partidos del día.',null],
              ] as [string,string,string,string|null][]).map(([icon,title,desc,badge],i) => (
                <div key={i} className="feat-card">
                  <div className="feat-icon">{icon}</div>
                  <div className="feat-body">
                    <p className="feat-title">{title}{badge && <span className="feat-badge">{badge}</span>}</p>
                    <p className="feat-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Competiciones */}
            <div className="feat-section">
              <p className="feat-section-title">🏆 Competiciones</p>
              {([
                ['🏆','Más de 50 competiciones','LaLiga EA Sports, LaLiga Hypermotion, Champions League, Europa League, Conference League, Premier League, Bundesliga, Serie A, Ligue 1, Copa del Rey, MLS, Liga MX y muchas más.',null],
                ['📊','Clasificaciones en directo','Tabla de clasificación actualizada de cualquier competición, con forma reciente de los últimos 5 partidos.','Live'],
                ['📈','Resultados y próximos','Consulta los últimos resultados y los próximos partidos de cada competición.',null],
              ] as [string,string,string,string|null][]).map(([icon,title,desc,badge],i) => (
                <div key={i} className="feat-card">
                  <div className="feat-icon">{icon}</div>
                  <div className="feat-body">
                    <p className="feat-title">{title}{badge && <span className="feat-badge">{badge}</span>}</p>
                    <p className="feat-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Estadísticas */}
            <div className="feat-section">
              <p className="feat-section-title">📊 Estadísticas</p>
              {([
                ['🔁','Historial H2H','Consulta los últimos 5 enfrentamientos directos entre los dos equipos de cualquier partido con resultados completos.',null],
                ['📉','Forma reciente','Los últimos 5 resultados de cada equipo (V/E/D) para saber quién llega en mejor momento.',null],
                ['🎯','Posición y puntos','Posición en la tabla, puntos, partidos jugados, victorias, empates y derrotas de cada equipo.',null],
              ] as [string,string,string,string|null][]).map(([icon,title,desc,badge],i) => (
                <div key={i} className="feat-card">
                  <div className="feat-icon">{icon}</div>
                  <div className="feat-body">
                    <p className="feat-title">{title}{badge && <span className="feat-badge">{badge}</span>}</p>
                    <p className="feat-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Personalización */}
            <div className="feat-section">
              <p className="feat-section-title">⚙️ Personalización</p>
              {([
                ['⭐','Equipos favoritos','Guarda tus equipos favoritos y accede con un toque a todos sus partidos del día con el filtro Favoritos.',null],
                ['🏆','Filtro por competición','Filtra la lista de partidos por cualquier liga o competición desde el menú lateral.',null],
                ['🌙','Modo oscuro','Activa el modo oscuro para una experiencia más cómoda de noche.',null],
                ['🗳️','Vota el ganador','Participa votando qué equipo crees que ganará cada partido.',null],
              ] as [string,string,string,string|null][]).map(([icon,title,desc,badge],i) => (
                <div key={i} className="feat-card">
                  <div className="feat-icon">{icon}</div>
                  <div className="feat-body">
                    <p className="feat-title">{title}{badge && <span className="feat-badge">{badge}</span>}</p>
                    <p className="feat-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center', padding: '20px 0 8px', borderTop: `1px solid ${T.border}` }}>
              <p style={{ color: T.gray, fontSize: 10 }}>Fútbol en TV · Mundo Deportivo · {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ COMPETITION PAGE ══════════ */}
      {page === 'comp' && cp && (
        <>
          <div style={{ padding: '7px 14px', background: '#000', borderBottom: `1px solid #222`, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={showMain} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E30613', fontWeight: 800, fontSize: 11, padding: 0, fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: .5 }}>← Guía TV</button>
            <span style={{ color: '#444' }}>/</span>
            <span style={{ fontWeight: 700, color: '#aaa', fontSize: 11 }}>{currentComp}</span>
          </div>
          <div style={{ padding: '12px 14px 0', borderBottom: `1px solid ${T.border}`, background: T.cardBg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 4, height: 40, background: '#E30613', borderRadius: 1, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#E30613', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 }}>{cp.emoji} Competición</div>
                <h2 style={{ fontSize: 20, fontWeight: 900, fontStyle: 'italic', color: T.text, lineHeight: 1.1 }}>{currentComp}</h2>
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              {(['partidos', 'resultados', 'tabla'] as const).map(t => {
                const labels = { partidos: '📺 Partidos y TV', resultados: 'Resultados', tabla: 'Clasificación' }
                const active = compTab === t
                // Ocultar "Clasificación" si no hay tabla
                if (t === 'tabla' && !cp.table.length) return null
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

            {/* ── PARTIDOS Y TV ── */}
            {compTab === 'partidos' && (() => {
              // For today use liveMatches (has WOSTI channels), for other dates use weekMatches
              const todayLive = liveMatches.filter(m => m.comp === currentComp && m.date === today)
              const todayLiveIds = new Set(todayLive.map(m => m.id))
              const otherWeek = weekMatches.filter(m => m.comp === currentComp && m.date !== today)
              // Also include week matches for today not in liveMatches (edge case)
              const todayWeekExtra = weekMatches.filter(m => m.comp === currentComp && m.date === today && !todayLiveIds.has(m.id))
              const compMatches = [...todayLive, ...todayWeekExtra, ...otherWeek]
                .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
              const byDate = compMatches.reduce<Record<string, Match[]>>((acc, m) => {
                if (!acc[m.date]) acc[m.date] = []
                acc[m.date].push(m)
                return acc
              }, {})
              const dates = Object.keys(byDate).sort()
              if (loadingComp && !compMatches.length) return (
                <div style={{ textAlign: 'center', padding: 40, color: T.gray }}>
                  <div style={{ animation: 'pulse-soon 1.2s infinite', fontSize: 24, marginBottom: 8 }}>⚽</div>
                  <p style={{ fontSize: 13 }}>Cargando partidos…</p>
                </div>
              )
              if (!compMatches.length) return (
                <p style={{ color: T.gray, fontSize: 13, padding: '24px 0' }}>Sin partidos programados en los próximos 14 días</p>
              )
              return (
                <>
                  {dates.map(d => (
                    <div key={d} style={{ marginBottom: 16 }}>
                      <div className="day-header">
                        <span>{formatDayHeader(d)}</span>
                        <span className="count">{byDate[d].length} partidos</span>
                      </div>
                      {byDate[d].map(m => {
                        const past = isPast(m.time, m.date)
                        return (
                          <div key={m.id} className={`match-row${past ? ' past' : ''}`}
                            onClick={() => { showMain(); setSelectedDate(m.date); setCompFilter(currentComp) }}
                            style={{ cursor: 'pointer', borderLeftColor: past ? 'transparent' : T.red }}>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 14, color: past ? T.gray : T.red, fontStyle: 'italic' }}>{m.time}</div>
                              <div style={{ fontSize: 9, color: T.gray, textTransform: 'uppercase', marginTop: 1 }}>{past ? 'Jugado' : matchDayLabel(m.date)}</div>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{m.home} <span style={{ color: T.gray, fontWeight: 400 }}>vs</span> {m.away}</div>
                              {showScores && m.score && (m.score.st !== 'FT' || past) && (
                                <div style={{ fontSize: 11, fontWeight: 900, color: m.score.st === 'LIVE' ? '#22c55e' : T.gray, marginTop: 2 }}>
                                  {m.score.h} – {m.score.a} {m.score.st === 'LIVE' ? `🔴 ${m.score.min ? m.score.min + "'" : 'EN VIVO'}` : m.score.st === 'FT' ? '(FT)' : ''}
                                </div>
                              )}
                            </div>
                            <div className="match-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, minWidth: 0, maxWidth: 'min(180px, 42vw)', overflow: 'hidden' }}>
                              {m.ch.length > 0
                                ? <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    {m.ch.map((c, i) => <ChTag key={i} name={c} />)}
                                  </div>
                                : <span style={{ fontSize: 9, color: T.gray }}>Canal desc.</span>
                              }
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </>
              )
            })()}

            {/* ── CLASIFICACIÓN ── */}
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
          </div>
        </>
      )}
      </main>

      {/* ── ONBOARDING MODAL ─────────────────────────────────── */}
      {obStep === 'modal' && (
        <div className="ob-backdrop" role="dialog" aria-modal="true" aria-label={`Bienvenida — paso ${obModalPage} de 3`}>
          <div className="ob-modal">
            <button className="ob-skip" onClick={skipOb} aria-label="Saltar presentación">×</button>

            {/* Paginación */}
            <div className="ob-pager" role="tablist">
              {[1,2,3].map(n => (
                <button key={n} role="tab" aria-selected={obModalPage === n}
                  className={`ob-pdot${obModalPage === n ? ' on' : ''}`}
                  onClick={() => setObModalPage(n)} aria-label={`Paso ${n}`} />
              ))}
            </div>

            {/* ── PÁGINA 1: BIENVENIDA ── */}
            {obModalPage === 1 && (<>
              <div className="ob-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-md.jpeg" alt="Mundo Deportivo" height="72" style={{ borderRadius: 8 }} />
              </div>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>Fútbol en TV</h2>
              <p style={{ color: '#E30613', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>by Mundo Deportivo</p>
              <p style={{ color: '#aaa', fontSize: 13, lineHeight: 1.7, marginBottom: 10 }}>
                La guía definitiva del fútbol en televisión. Todos los partidos del día con sus canales, en tiempo real.
              </p>
              <p style={{ color: '#666', fontSize: 11, lineHeight: 1.6, marginBottom: 22 }}>
                LaLiga · Champions League · Premier League · Bundesliga · Serie A · Ligue 1 · Copa del Rey y más de 50 competiciones.
              </p>
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <button className="ob-btn" onClick={advanceOb} autoFocus>Ver funciones →</button>
            </>)}

            {/* ── PÁGINA 2: FUNCIONES ── */}
            {obModalPage === 2 && (<>
              <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 4 }}>¿Qué puedes hacer?</h2>
              <p style={{ color: '#666', fontSize: 11, marginBottom: 14 }}>Todo lo que necesitas para seguir el fútbol en TV</p>
              <div className="ob-grid">
                {([
                  ['📺','Guía TV','Qué canal emite cada partido'],
                  ['⚡','En directo','Resultados actualizados al minuto'],
                  ['📅','Por días','Agenda de cualquier día de la semana'],
                  ['⭐','Favoritos','Acceso rápido a tus equipos'],
                  ['🏆','Competiciones','+50 ligas y copas internacionales'],
                  ['📊','Clasificaciones','Tabla actualizada de cualquier liga'],
                  ['🔁','H2H','Historial entre dos equipos'],
                  ['🌙','Modo oscuro','Cuida tus ojos de noche'],
                ] as [string,string,string][]).map(([icon,title,desc],i) => (
                  <div key={i} className="ob-cell">
                    <div className="ob-cell-icon">{icon}</div>
                    <span className="ob-cell-title">{title}</span>
                    <span className="ob-cell-desc">{desc}</span>
                  </div>
                ))}
              </div>
              <button className="ob-btn" onClick={advanceOb}>Siguiente →</button>
              <button className="ob-link" style={{ marginTop: 8, display: 'block', width: '100%' }}
                onClick={() => { skipOb(); setPage('features') }}>Ver todas las funciones →</button>
            </>)}

            {/* ── PÁGINA 3: LISTO ── */}
            {obModalPage === 3 && (<>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>¡Todo listo!</h2>
              <p style={{ color: '#aaa', fontSize: 12, lineHeight: 1.6, marginBottom: 18 }}>
                Te enseñamos los elementos clave de la app en 3 pasos rápidos para que saques el máximo partido.
              </p>
              <div className="ob-step3-msg">
                <p style={{ color: '#E30613', fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>💡 Consejo</p>
                <p style={{ color: '#bbb', fontSize: 11, lineHeight: 1.5 }}>
                  Usa el filtro de favoritos ⭐ para ver solo los partidos de tus equipos. Activa notificaciones para que te avisemos 15 minutos antes de cada partido.
                </p>
              </div>
              <button className="ob-btn" onClick={advanceOb} autoFocus>Empezar el tour →</button>
              <button className="ob-link" style={{ marginTop: 8, display: 'block', width: '100%' }}
                onClick={skipOb}>Explorar directamente</button>
            </>)}

          </div>
        </div>
      )}

      {/* ── ONBOARDING COACH MARKS ───────────────────────────── */}
      {(obStep === 'c1' || obStep === 'c2' || obStep === 'c3') && (() => {
        const step = obStep === 'c1' ? 1 : obStep === 'c2' ? 2 : 3
        // Ring positions (approximate, mobile-first)
        const rings: Record<string, React.CSSProperties> = {
          c1: { top: 50, left: 0, right: 0, height: 44 },   // days bar (header 47px + border 3px)
          c2: { bottom: 0, left: '33.33%', width: '33.33%', height: 58 }, // Competiciones btn
          c3: { top: '50%', left: 16, right: 16, height: 56, transform: 'translateY(-50%)' }, // match row
        }
        const cards: Record<string, { className: string; style: React.CSSProperties }> = {
          c1: { className: 'ob-card arrow-up', style: { top: 104 } },
          c2: { className: 'ob-card arrow-down', style: { bottom: 68 } },
          c3: { className: 'ob-card', style: { top: '50%', marginTop: 44 } },
        }
        const titles: Record<string, string> = { c1: '📅 Navega por días', c2: '🏆 Competiciones', c3: '⭐ Detalles del partido' }
        const texts: Record<string, string> = {
          c1: 'Desliza la barra para cambiar de día y ver todos los partidos programados.',
          c2: 'Toca aquí para abrir el menú y filtrar por liga o competición favorita.',
          c3: 'Toca cualquier partido para ver detalles, canales de TV y añadir tu equipo a favoritos.',
        }
        const isLast = obStep === 'c3'
        return (
          <div className="ob-coach-wrap" role="dialog" aria-modal="true" aria-label={`Paso ${step} de 3`}>
            <div className="ob-dim" onClick={advanceOb} />
            <div className="ob-ring" style={rings[obStep]} />
            <div className={cards[obStep].className} style={cards[obStep].style}>
              <div className="ob-prog">
                {['c1','c2','c3'].map(s => <div key={s} className={`ob-dot${obStep === s ? ' on' : ''}`} />)}
              </div>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 800, marginBottom: 6 }}>{titles[obStep]}</p>
              <p style={{ color: '#aaa', fontSize: 11, lineHeight: 1.5, marginBottom: 0 }}>{texts[obStep]}</p>
              <div className="ob-actions">
                <button className="ob-btn" onClick={advanceOb}>{isLast ? '¡Entendido! →' : 'Siguiente →'}</button>
                {!isLast && <button className="ob-link" onClick={skipOb}>Saltar presentación</button>}
              </div>
            </div>
          </div>
        )
      })()}

      {/* BOTTOM NAV */}
      <nav className="bottom-nav" role="navigation" aria-label="Navegación principal">
        <button className={`bottom-nav-btn${filter === 'favs' ? ' active' : ''}`}
          aria-pressed={filter === 'favs'}
          onClick={() => { setFilter(filter === 'favs' ? 'all' : 'favs'); setPage('main') }}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill={filter === 'favs' ? '#E30613' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>Favoritos</span>
        </button>
        <button ref={drawerBtnRef} className={`bottom-nav-btn${menuOpen ? ' active' : ''}`}
          aria-expanded={menuOpen} aria-controls="nav-drawer" aria-haspopup="dialog"
          onClick={() => setMenuOpen(!menuOpen)}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <span>Competiciones</span>
        </button>
        <button className={`bottom-nav-btn${page === 'main' && !menuOpen && filter !== 'favs' ? ' active' : ''}`}
          aria-current={page === 'main' && selectedDate === today && !menuOpen ? 'page' : undefined}
          onClick={() => { selectDay(getMadridToday()); setPage('main'); setFilter('all') }}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Hoy</span>
        </button>
      </nav>
    </div>
  )
}
