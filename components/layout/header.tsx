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
    <header className="bg-header text-ink-dark sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="font-display text-xl uppercase tracking-tight text-ink-dark">FUTBAS</span>
          <span className="w-2 h-2 rounded-full bg-accent" />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLinks locale={locale} />
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-dark/60 font-mono truncate max-w-[120px]">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-sans text-ink-dark/60 hover:text-ink-dark transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="text-xs font-sans text-accent hover:text-accent/80 font-medium"
            >
              {t('login')}
            </Link>
          )}
          <button
            onClick={switchLocale}
            className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 border border-ink-dark/20 rounded-full text-ink-dark/80 hover:bg-ink-dark/10 transition-colors"
          >
            {locale === 'ca' ? 'ES' : 'CA'}
          </button>
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
            className={`text-sm font-sans transition-colors relative ${
              isActive
                ? 'text-ink-dark font-medium'
                : 'text-ink-dark/60 hover:text-ink-dark'
            }`}
          >
            {label}
            {isActive && (
              <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-accent" />
            )}
          </Link>
        )
      })}
    </>
  )
}
