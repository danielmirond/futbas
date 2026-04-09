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
    <header className="border-b border-border bg-surface sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="font-serif text-xl tracking-tight">Futbas</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLinks locale={locale} />
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted font-mono truncate max-w-[120px]">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-sans text-muted hover:text-ink transition-colors"
              >
                {t('logout')}
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="text-xs font-sans text-accent hover:underline"
            >
              {t('login')}
            </Link>
          )}
          <button
            onClick={switchLocale}
            className="text-xs font-mono uppercase tracking-wider px-2 py-1 border border-border rounded-sm hover:bg-white/5 transition-colors"
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
            className={`text-sm font-sans transition-colors ${
              isActive ? 'text-ink font-medium' : 'text-muted hover:text-ink'
            }`}
          >
            {label}
          </Link>
        )
      })}
    </>
  )
}
