'use client'

import { useState } from 'react'
import type { CommentType } from '@/types/database'

interface CommentInputProps {
  onSubmit: (text: string, type: CommentType) => void | Promise<void>
}

const TYPES: { value: CommentType; label: string }[] = [
  { value: 'passio', label: 'Passio' },
  { value: 'prediccio', label: 'Prediccio' },
  { value: 'arbitre', label: 'Arbitre' },
]

export function CommentInput({ onSubmit }: CommentInputProps) {
  const [text, setText] = useState('')
  const [selectedType, setSelectedType] = useState<CommentType>('passio')

  function handleSubmit() {
    if (!text.trim()) return
    onSubmit(text.trim(), selectedType)
    setText('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t border-border pt-4">
      {/* Type selector */}
      <div className="flex items-center gap-2 mb-3">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setSelectedType(t.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium font-sans transition-colors ${
              selectedType === t.value
                ? 'bg-accent text-white'
                : 'bg-ink/5 text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Input + send */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escriu un comentari..."
          className="flex-1 border border-border rounded-sm px-3 py-2 text-sm font-sans bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="px-4 py-2 bg-accent text-white text-sm font-sans font-medium rounded-sm hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </div>
    </div>
  )
}
