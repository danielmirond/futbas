'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function Header() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('auth')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function switchLocale() {
    const newLocale = locale === 'ca' ? 'es' : 'ca'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Accent line top */}
      <div className="accent-line" />

      {/* Purple bar */}
      <div className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center">
            <span className="font-display font-black text-2xl uppercase tracking-tight text-white">
              FUT<span className="text-accent">BAS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <NavLinks locale={locale} />
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/60 font-mono uppercase tracking-wider truncate max-w-[100px]">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-mono uppercase tracking-wider text-white/60 hover:text-accent transition-colors"
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="text-[10px] font-mono uppercase tracking-wider text-accent hover:text-white font-bold"
              >
                {t('login')}
              </Link>
            )}
            <button
              onClick={switchLocale}
              className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 border border-white/20 text-white/80 hover:border-accent hover:text-white transition-colors"
            >
              {locale === 'ca' ? 'ES' : 'CA'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavLinks({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/classificacio`, label: t('classification') },
    { href: `/${locale}/partits`, label: t('matches') },
    { href: `/${locale}/clubs`, label: t('clubs') },
    { href: `/${locale}/perfil`, label: t('profile') },
  ]

  return (
    <>
      {links.map(({ href, label }) => {
        const isActive = pathname === href || (href !== `/${locale}` && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={`text-xs font-display uppercase tracking-wider transition-colors relative ${
              isActive ? 'text-accent font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            {label}
            {isActive && (
              <span className="absolute -bottom-[18px] left-0 right-0 h-[3px] bg-accent" />
            )}
          </Link>
        )
      })}
    </>
  )
}
