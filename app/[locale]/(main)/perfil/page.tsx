'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface FavoriteClub {
  id: string
  name: string
  delegation: string | null
}

export default function PerfilPage() {
  const t = useTranslations('profile')
  const locale = useLocale()
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [favorites, setFavorites] = useState<FavoriteClub[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      const supabase = createClient()
      const { data: { user: u } } = await supabase.auth.getUser()
      if (cancelled) return

      if (!u) {
        setLoading(false)
        return
      }

      setUser(u)

      // Fetch profile
      const { data: profile } = await supabase
        .from('users')
        .select('display_name, preferred_language')
        .eq('id', u.id)
        .maybeSingle()

      if (profile && !cancelled) {
        setDisplayName(profile.display_name || u.email?.split('@')[0] || '')
      }

      // Fetch favorite clubs
      const { data: favs } = await supabase
        .from('favorites')
        .select('club_id, clubs:club_id(id, name, delegation)')
        .eq('user_id', u.id)
        .eq('favorite_type', 'club')

      if (!cancelled && favs) {
        const clubs: FavoriteClub[] = favs
          .map((f: any) => (Array.isArray(f.clubs) ? f.clubs[0] : f.clubs))
          .filter(Boolean)
        setFavorites(clubs)
      }

      setLoading(false)
    }

    init()
    return () => { cancelled = true }
  }, [])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({ display_name: displayName })
        .eq('id', user.id)
      if (error) throw error
      setMessage('✓ Desat correctament')
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage('✗ Error: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function removeFavorite(clubId: string) {
    if (!user) return
    const supabase = createClient()
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('favorite_type', 'club')
      .eq('club_id', clubId)
    setFavorites((prev) => prev.filter((f) => f.id !== clubId))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="hero p-6 md:p-10">
          <h1 className="font-display font-black text-4xl uppercase text-white">{t('title')}</h1>
        </div>
        <div className="card py-8 text-center eyebrow">CARREGANT...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <section className="hero p-6 md:p-10">
          <div className="hero-glow" />
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
          <div className="relative z-10">
            <h1 className="font-display font-black text-4xl md:text-display text-white uppercase tracking-tight">
              {t('title')}
            </h1>
          </div>
        </section>
        <div className="card text-center py-16">
          <div className="eyebrow mb-3">SESSIÓ NO INICIADA</div>
          <p className="font-sans text-ink2 mb-6">Inicia sessió per veure el teu perfil</p>
          <Link href={`/${locale}/login`} className="btn-primary inline-block">
            INICIAR SESSIÓ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="hero p-6 md:p-10">
        <div className="hero-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
        <div className="relative z-10">
          <div className="eyebrow-light mb-3">{user.email}</div>
          <h1 className="font-display font-black text-4xl md:text-display text-white uppercase tracking-tight">
            {displayName || t('title')}
          </h1>
        </div>
      </section>

      {/* Profile editor */}
      <section className="card space-y-4">
        <div className="eyebrow">NOM D&apos;USUARI</div>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="flex-1 bg-surface border border-border px-3 py-2.5 font-sans text-sm text-ink focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? '...' : 'DESAR'}
          </button>
        </div>
        {message && (
          <p className="font-mono text-[11px] uppercase tracking-wider text-accent">{message}</p>
        )}
      </section>

      {/* Favorites */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="eyebrow">{t('favorites')} · {favorites.length}</div>
          <Link href={`/${locale}/clubs`} className="font-mono text-[10px] uppercase tracking-wider text-accent hover:underline">
            + AFEGIR
          </Link>
        </div>

        {favorites.length === 0 ? (
          <p className="font-sans text-sm text-ink3">{t('noFavorites')}</p>
        ) : (
          <div className="space-y-2">
            {favorites.map((club) => (
              <div
                key={club.id}
                className="flex items-center gap-3 p-3 border border-border hover:border-accent transition-colors"
              >
                <Link
                  href={`/${locale}/clubs/${club.id}`}
                  className="flex-1 min-w-0"
                >
                  <div className="font-display font-black uppercase text-sm tracking-tight truncate">
                    {club.name}
                  </div>
                  {club.delegation && (
                    <div className="font-mono text-[10px] uppercase text-ink3 mt-0.5">
                      {club.delegation}
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => removeFavorite(club.id)}
                  className="font-mono text-[10px] uppercase tracking-wider text-ink3 hover:text-loss transition-colors px-2 py-1"
                >
                  TREURE
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Language */}
      <section className="card space-y-4">
        <div className="eyebrow">{t('language')}</div>
        <div className="flex gap-2">
          <Link
            href={`/ca/perfil`}
            className={locale === 'ca' ? 'btn-primary' : 'btn-ghost'}
          >
            {t('catalan')}
          </Link>
          <Link
            href={`/es/perfil`}
            className={locale === 'es' ? 'btn-primary' : 'btn-ghost'}
          >
            {t('spanish')}
          </Link>
        </div>
      </section>
    </div>
  )
}
