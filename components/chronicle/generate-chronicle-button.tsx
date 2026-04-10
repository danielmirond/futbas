'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  matchId: string
}

export function GenerateChronicleButton({ matchId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/chronicle/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, language: 'ca' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error generant crònica')
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-primary disabled:opacity-50"
      >
        {loading ? '⚡ GENERANT AMB IA...' : '🤖 GENERAR CRÒNICA'}
      </button>
      {error && (
        <p className="font-mono text-[11px] text-loss uppercase tracking-wider">{error}</p>
      )}
    </div>
  )
}
