'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'

export function Header() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  function switchLocale() {
    const newLocale = locale === 'ca' ? 'es' : 'ca'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="font-serif text-xl tracking-tight">Futbas</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavLinks locale={locale} />
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={switchLocale}
            className="text-xs font-mono uppercase tracking-wider px-2 py-1 border border-border rounded-sm hover:bg-ink/5 transition-colors"
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
