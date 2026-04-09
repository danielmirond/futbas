'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = `/${locale}`
    }
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}`,
      },
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-sans text-muted mb-1">{t('email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-accent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-sans text-muted mb-1">{t('password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm focus:outline-none focus:border-accent"
            required
          />
        </div>

        {error && <p className="text-loss text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-ink text-white text-sm font-sans font-medium rounded-sm hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : t('login')}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-surface px-2 text-muted">o</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full py-2.5 border border-border text-sm font-sans rounded-sm hover:bg-ink/5 transition-colors"
      >
        {t('withGoogle')}
      </button>

      <p className="text-center text-sm text-muted">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/signup`} className="text-accent hover:underline">
          {t('signup')}
        </Link>
      </p>
    </div>
  )
}
