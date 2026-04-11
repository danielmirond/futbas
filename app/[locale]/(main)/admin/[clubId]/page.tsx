import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: { clubId: string; locale: string }
}

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`
}

export default async function AdminPage({ params: { clubId, locale } }: PageProps) {
  const supabase = createClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-16">
          <div className="eyebrow mb-3">ACCÉS RESTRINGIT</div>
          <p className="font-sans text-ink2 mb-6">Inicia sessió com a admin per gestionar el club</p>
          <Link href={`/${locale}/login`} className="btn-primary inline-block">
            INICIAR SESSIÓ
          </Link>
        </div>
      </div>
    )
  }

  // Check role
  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle()

  const isAdmin = profile?.role === 'admin'

  const { data: club } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('id', clubId)
    .maybeSingle()

  if (!club) {
    return (
      <div className="max-w-3xl">
        <div className="card text-center py-12">
          <h1 className="font-display font-black text-3xl uppercase mb-4">Club no trobat</h1>
          <Link href={`/${locale}/clubs`} className="btn-ghost inline-block">← Clubs</Link>
        </div>
      </div>
    )
  }

  // Fetch memberships only if admin
  const memberships = isAdmin
    ? (await supabase.from('memberships').select('*').eq('club_id', clubId)).data || []
    : []

  const paid = memberships.filter((m: any) => m.status === 'paid').length
  const pending = memberships.filter((m: any) => m.status === 'pending').length
  const overdue = memberships.filter((m: any) => m.status === 'overdue').length
  const total = memberships.length || 0
  const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0
  const incomeCents = memberships
    .filter((m: any) => m.status === 'paid')
    .reduce((sum: number, m: any) => sum + (m.amount_cents || 0), 0)

  return (
    <div className="space-y-6">
      {/* Hero with admin badge */}
      <section className="hero p-6 md:p-10">
        <div className="hero-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <Link
              href={`/${locale}/clubs/${clubId}`}
              className="eyebrow-light hover:text-accent transition-colors"
            >
              ← TORNAR AL CLUB
            </Link>
            <span className="pill pill-red">🔐 ADMIN</span>
          </div>
          <div className="eyebrow-light mb-2">PORTAL DE GESTIÓ · FASE 2</div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-tighter">
            {club.name}
          </h1>
        </div>
      </section>

      {!isAdmin ? (
        <div className="card text-center py-16">
          <div className="eyebrow mb-3">PERMÍS DENEGAT</div>
          <h2 className="font-display font-black text-2xl uppercase mb-4">
            Només administradors
          </h2>
          <p className="font-sans text-ink2 max-w-md mx-auto mb-6">
            Aquesta secció és per als directius del club. Contacta amb Futbas per sol·licitar
            accés administratiu.
          </p>
          <Link href={`/${locale}`} className="btn-ghost inline-block">
            ← TORNAR A L&apos;INICI
          </Link>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border">
            <div className="bg-card p-5 border-t-[3px] border-t-neon">
              <div className="font-display font-black text-3xl text-neon tabular-nums">{paidPct}%</div>
              <div className="eyebrow mt-1">CUOTES PAGADES</div>
            </div>
            <div className="bg-card p-5 border-t-[3px] border-t-accent">
              <div className="font-display font-black text-3xl text-accent tabular-nums">{pending}</div>
              <div className="eyebrow mt-1">PENDENTS</div>
            </div>
            <div className="bg-card p-5 border-t-[3px] border-t-loss">
              <div className="font-display font-black text-3xl text-loss tabular-nums">{overdue}</div>
              <div className="eyebrow mt-1">EN MORA</div>
            </div>
            <div className="bg-card p-5 border-t-[3px] border-t-primary">
              <div className="font-display font-black text-3xl text-primary tabular-nums">
                {formatPrice(incomeCents)}
              </div>
              <div className="eyebrow mt-1">INGRESSAT</div>
            </div>
          </div>

          {/* Memberships list */}
          <section className="bg-card border border-border">
            <div className="section-head flex items-center justify-between">
              <span>CUOTES · SOCIS ({total})</span>
              <button className="font-mono text-[10px] uppercase tracking-wider text-white/80 hover:text-accent">
                + AFEGIR SOCI
              </button>
            </div>
            {memberships.length === 0 ? (
              <div className="py-16 text-center">
                <div className="eyebrow mb-3">SENSE SOCIS ENCARA</div>
                <p className="font-sans text-ink2 text-sm max-w-md mx-auto">
                  Quan afegeixis socis apareixeran aquí amb les seves cuotes i estat de pagament.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {memberships.map((m: any) => (
                  <div
                    key={m.id}
                    className={`p-4 flex items-center gap-4 ${
                      m.status === 'overdue' ? 'border-l-[3px] border-l-loss' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 font-display font-black text-xs text-white">
                      {m.member_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-black uppercase text-sm tracking-tight truncate">
                        {m.member_name}
                      </div>
                      <div className="font-mono text-[10px] text-ink3 uppercase mt-0.5">
                        {m.team_category || 'Sèrie'} {m.member_number ? `· #${m.member_number}` : ''}
                      </div>
                    </div>
                    <div className="font-display font-black text-xl tabular-nums">
                      {formatPrice(m.amount_cents)}
                    </div>
                    <span
                      className={
                        m.status === 'paid'
                          ? 'pill pill-green'
                          : m.status === 'overdue'
                          ? 'pill pill-red'
                          : 'pill pill-yellow'
                      }
                    >
                      {m.status === 'paid' ? 'PAGAT' : m.status === 'overdue' ? 'MORA' : 'PENDENT'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border">
            <Link href={`/${locale}/botiga/${clubId}`} className="bg-card p-5 text-center hover:bg-surface transition-colors">
              <div className="text-3xl mb-2">🛒</div>
              <div className="eyebrow">BOTIGA</div>
            </Link>
            <div className="bg-card p-5 text-center opacity-60">
              <div className="text-3xl mb-2">💰</div>
              <div className="eyebrow">CUOTES</div>
            </div>
            <div className="bg-card p-5 text-center opacity-60">
              <div className="text-3xl mb-2">🤝</div>
              <div className="eyebrow">PATROCINIS</div>
            </div>
            <div className="bg-card p-5 text-center opacity-60">
              <div className="text-3xl mb-2">📊</div>
              <div className="eyebrow">ESTADÍSTIQUES</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
