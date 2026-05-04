'use client'
import { useState, useEffect, useCallback } from 'react'

type Corrections = { aliases: Record<string, string>; display: Record<string, string> }

const BASE_ALIASES: Record<string, string> = {
  'atletico':            'atletico de madrid',
  'atletico madrid':     'atletico de madrid',
  'at. madrid':          'atletico de madrid',
  'at madrid':           'atletico de madrid',
  'atl madrid':          'atletico de madrid',
  'man city':            'manchester city',
  'man. city':           'manchester city',
  'man united':          'manchester united',
  'man utd':             'manchester united',
  'man. united':         'manchester united',
  'real madrid cf':      'real madrid',
  'b. munich':           'fc bayern munchen',
  'b munich':            'fc bayern munchen',
  'bayer munich':        'fc bayern munchen',
  'fc bayern munich':    'fc bayern munchen',
  'bayern munich':       'fc bayern munchen',
  'psg':                 'paris saint-germain',
  'paris sg':            'paris saint-germain',
  'paris saint germain': 'paris saint-germain',
  'inter':               'inter milan',
  'fc internazionale':   'inter milan',
  'internazionale':      'inter milan',
  'c palace':            'crystal palace',
  'bvb':                 'borussia dortmund',
  'real sociedad cf':    'real sociedad',
  'real betis balompie': 'real betis',
  'villarreal cf':       'villarreal',
  'athletic bilbao':     'athletic club',
}

const BASE_DISPLAY: Record<string, string> = {
  'atletico de madrid':       'Atlético de Madrid',
  'real madrid':              'Real Madrid',
  'fc barcelona':             'FC Barcelona',
  'athletic club':            'Athletic Club',
  'real sociedad':            'Real Sociedad',
  'villarreal':               'Villarreal CF',
  'real betis':               'Real Betis',
  'manchester city':          'Manchester City',
  'manchester united':        'Manchester United',
  'paris saint-germain':      'Paris Saint-Germain',
  'inter milan':              'Inter Milán',
  'fc bayern munchen':        'FC Bayern München',
  'borussia dortmund':        'Borussia Dortmund',
  'crystal palace':           'Crystal Palace',
  'tottenham hotspur':        'Tottenham Hotspur',
  'wolverhampton wanderers':  'Wolverhampton',
  'borussia monchengladbach': 'B. Mönchengladbach',
}

const R = '#E30613'
const s = { fontFamily: "'Helvetica Neue',Arial,sans-serif" }

const inp = (extra?: React.CSSProperties): React.CSSProperties => ({
  background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 3,
  color: '#eee', padding: '7px 10px', fontSize: 12, fontFamily: 'inherit',
  outline: 'none', width: '100%', boxSizing: 'border-box' as const, ...extra,
})

const btn = (bg = R, extra?: React.CSSProperties): React.CSSProperties => ({
  background: bg, color: '#fff', border: 'none', borderRadius: 3,
  padding: '7px 16px', fontSize: 12, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const, ...extra,
})

export default function AdminPage() {
  const [pw, setPw]           = useState('')
  const [authed, setAuthed]   = useState(false)
  const [err, setErr]         = useState('')
  const [busy, setBusy]       = useState(false)
  const [overrides, setOv]    = useState<Corrections>({ aliases: {}, display: {} })
  const [tab, setTab]         = useState<'aliases' | 'display'>('aliases')
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')
  const [flash, setFlash]     = useState('')

  const api = useCallback(async (method: string, body?: object) => {
    const res = await fetch('/api/admin/corrections', {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 401) throw new Error('401')
    return res.json()
  }, [pw])

  const load = useCallback(async () => {
    try { setOv(await api('GET')) } catch { /* ignore */ }
  }, [api])

  const login = async () => {
    setBusy(true); setErr('')
    try { await api('GET'); setAuthed(true); await load() }
    catch { setErr('Contraseña incorrecta') }
    finally { setBusy(false) }
  }

  useEffect(() => { if (authed) load() }, [authed, load])

  const flash_ = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 2000) }

  const add = async () => {
    if (!from.trim() || !to.trim()) return
    const key = from.toLowerCase().trim()
    const patch: Partial<Corrections> = tab === 'aliases'
      ? { aliases: { [key]: to.toLowerCase().trim() } }
      : { display: { [key]: to.trim() } }
    await api('POST', patch); await load()
    setFrom(''); setTo(''); flash_('✓ Guardado')
  }

  const del = async (type: 'aliases' | 'display', key: string) => {
    await api('DELETE', { type, key }); await load()
  }

  const exportJSON = async () => {
    const out = {
      aliases: { ...BASE_ALIASES, ...overrides.aliases },
      display: { ...BASE_DISPLAY, ...overrides.display },
    }
    await navigator.clipboard.writeText(JSON.stringify(out, null, 2))
    flash_('✓ Copiado al portapapeles')
  }

  const allData = tab === 'aliases'
    ? { ...BASE_ALIASES, ...overrides.aliases }
    : { ...BASE_DISPLAY, ...overrides.display }

  const isAdmin = (key: string) => key in (tab === 'aliases' ? overrides.aliases : overrides.display)

  /* ── Login ── */
  if (!authed) return (
    <div style={{ ...s, minHeight: '100vh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#111', border: `2px solid ${R}`, borderRadius: 10, padding: 32, width: 300, textAlign: 'center' }}>
        <div style={{ color: R, fontWeight: 900, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Admin</div>
        <div style={{ color: '#666', fontSize: 11, marginBottom: 22 }}>Normalización · Guía Fútbol TV</div>
        <input type="password" placeholder="Contraseña" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
          style={inp({ marginBottom: 10 })} autoFocus />
        {err && <div style={{ color: R, fontSize: 11, marginBottom: 8 }}>{err}</div>}
        <button onClick={login} disabled={busy} style={btn(R, { width: '100%' })}>
          {busy ? 'Verificando…' : 'Entrar →'}
        </button>
      </div>
    </div>
  )

  /* ── Panel ── */
  return (
    <div style={{ ...s, minHeight: '100vh', background: '#0d0d0d', color: '#eee', padding: '18px 14px 60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: `2px solid ${R}` }}>
        <div>
          <span style={{ fontWeight: 900, fontSize: 15, textTransform: 'uppercase', letterSpacing: .8 }}>Normalización de equipos</span>
          <span style={{ fontSize: 11, color: '#666', marginLeft: 10 }}>Guía Fútbol TV</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {flash && <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>{flash}</span>}
          <button onClick={exportJSON} style={btn('#222')}>⬆ Exportar JSON</button>
          <a href="/" style={{ ...btn('#333'), textDecoration: 'none', display: 'inline-block' }}>← App</a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {(['aliases', 'display'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={btn(tab === t ? R : '#1a1a1a', { border: `1px solid ${tab === t ? R : '#333'}` })}>
            {t === 'aliases' ? `Alias (${Object.keys({ ...BASE_ALIASES, ...overrides.aliases }).length})` : `Display (${Object.keys({ ...BASE_DISPLAY, ...overrides.display }).length})`}
          </button>
        ))}
      </div>

      {/* Añadir */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 6, padding: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 10 }}>
          {tab === 'aliases' ? 'Variante ESPN → clave canónica' : 'Clave canónica → nombre en UI'}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={from} onChange={e => setFrom(e.target.value)}
            placeholder={tab === 'aliases' ? 'ej: at. madrid' : 'ej: atletico de madrid'}
            style={inp({ flex: '1 1 160px' })} />
          <span style={{ color: '#555' }}>→</span>
          <input value={to} onChange={e => setTo(e.target.value)}
            placeholder={tab === 'aliases' ? 'ej: atletico de madrid' : 'ej: Atlético de Madrid'}
            onKeyDown={e => e.key === 'Enter' && add()}
            style={inp({ flex: '1 1 160px' })} />
          <button onClick={add} style={btn()}>+ Añadir</button>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#111', border: '1px solid #222', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px', background: '#161616', padding: '7px 12px', fontSize: 10, fontWeight: 800, color: '#555', textTransform: 'uppercase', letterSpacing: .8, borderBottom: '1px solid #222' }}>
          <span>{tab === 'aliases' ? 'Variante ESPN' : 'Clave canónica'}</span>
          <span>→ {tab === 'aliases' ? 'Canónico' : 'Mostrado en UI'}</span>
          <span>Fuente</span>
        </div>
        {Object.entries(allData).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px', padding: '6px 12px', borderBottom: '1px solid #1a1a1a', alignItems: 'center', background: isAdmin(k) ? '#052010' : 'transparent' }}>
            <span style={{ fontSize: 12, color: '#666', fontFamily: 'monospace' }}>{k}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: isAdmin(k) ? '#22c55e' : '#eee' }}>{v}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 2, background: isAdmin(k) ? '#22c55e22' : '#33333322', color: isAdmin(k) ? '#22c55e' : '#555' }}>
                {isAdmin(k) ? 'ADMIN' : 'BASE'}
              </span>
              {isAdmin(k) && (
                <button onClick={() => del(tab, k)} title="Eliminar" style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 16, padding: '0 2px', lineHeight: 1 }}>×</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nota */}
      <div style={{ marginTop: 14, padding: 12, background: '#1a1400', border: '1px solid #2a2000', borderRadius: 6, fontSize: 11, color: '#888', lineHeight: 1.7 }}>
        <strong style={{ color: '#f59e0b' }}>Persistencia:</strong> Los cambios duran mientras el servidor está caliente (mismo proceso).
        Para hacerlos permanentes: <strong>Exportar JSON</strong> → pegar en <code style={{ background: '#222', padding: '1px 4px', borderRadius: 2 }}>TEAM_ALIASES</code> / <code style={{ background: '#222', padding: '1px 4px', borderRadius: 2 }}>DISPLAY_NAMES</code> en <code style={{ background: '#222', padding: '1px 4px', borderRadius: 2 }}>page.tsx</code>.
      </div>
    </div>
  )
}
