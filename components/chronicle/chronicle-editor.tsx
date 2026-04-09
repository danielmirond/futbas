'use client'

import { useState } from 'react'

interface ChronicleEditorProps {
  initialHeadline?: string
  initialBody?: string
}

export function ChronicleEditor({
  initialHeadline = '',
  initialBody = '',
}: ChronicleEditorProps) {
  const [headline, setHeadline] = useState(initialHeadline)
  const [body, setBody] = useState(initialBody)

  function handlePublish() {
    // Not functional yet - placeholder
    console.log('Publishing chronicle:', { headline, body })
  }

  return (
    <div className="max-w-2xl">
      <h3 className="font-serif text-headline mb-4">Editor de Cronica</h3>

      <div className="flex flex-col gap-4">
        {/* Headline */}
        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-sans mb-1 block">
            Titular
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Escriu el titular..."
            className="w-full border border-border rounded-sm px-3 py-2 text-sm font-serif text-ink bg-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs uppercase tracking-wider text-muted font-sans mb-1 block">
            Cos de la cronica
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escriu la cronica del partit..."
            rows={16}
            className="w-full border border-border rounded-sm px-3 py-2 text-sm font-sans text-ink bg-white placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent resize-y"
          />
        </div>

        {/* Publish */}
        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-muted font-sans">
            {body.length} caracters
          </span>
          <button
            onClick={handlePublish}
            disabled={!headline.trim() || !body.trim()}
            className="px-4 py-2 bg-accent text-white text-sm font-sans font-medium rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  )
}
