'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = `/${locale}`
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-sans text-muted mb-1">{t('displayName')}</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm bg-card text-ink focus:outline-none focus:border-accent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-sans text-muted mb-1">{t('email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm bg-card text-ink focus:outline-none focus:border-accent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-sans text-muted mb-1">{t('password')}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-sm text-sm bg-card text-ink focus:outline-none focus:border-accent"
            minLength={6}
            required
          />
        </div>

        {error && <p className="text-loss text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-accent text-white text-sm font-sans font-medium rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : t('signup')}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        {t('hasAccount')}{' '}
        <Link href={`/${locale}/login`} className="text-accent hover:underline">
          {t('login')}
        </Link>
      </p>
    </div>
  )
}
