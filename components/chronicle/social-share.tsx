'use client'

import { useState } from 'react'

interface SocialShareProps {
  summary: string
}

export function SocialShare({ summary }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-surface border border-border rounded-sm p-4">
      <h4 className="text-xs uppercase tracking-wider text-muted font-sans mb-2">Resum per xarxes</h4>

      <p className="text-sm font-sans text-ink mb-3 whitespace-pre-line">{summary}</p>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs font-sans font-medium border border-border rounded-sm hover:bg-white/5 transition-colors"
        >
          {copied ? 'Copiat!' : 'Copiar text'}
        </button>

        <button
          className="px-3 py-1.5 text-xs font-sans font-medium border border-border rounded-sm hover:bg-white/5 transition-colors"
          title="Compartir a Twitter"
        >
          Twitter
        </button>

        <button
          className="px-3 py-1.5 text-xs font-sans font-medium border border-border rounded-sm hover:bg-white/5 transition-colors"
          title="Compartir a WhatsApp"
        >
          WhatsApp
        </button>

        <button
          className="px-3 py-1.5 text-xs font-sans font-medium border border-border rounded-sm hover:bg-white/5 transition-colors"
          title="Compartir a Instagram"
        >
          Instagram
        </button>
      </div>
    </div>
  )
}
