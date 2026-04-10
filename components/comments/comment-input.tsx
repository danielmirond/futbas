'use client'

import { useState } from 'react'
import type { CommentType } from '@/types/database'

interface CommentInputProps {
  onSubmit: (text: string, type: CommentType) => void | Promise<void>
}

const TYPES: { value: CommentType; label: string }[] = [
  { value: 'passio', label: 'PASSIÓ' },
  { value: 'prediccio', label: 'PREDICCIÓ' },
  { value: 'arbitre', label: 'ÀRBITRE' },
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
    <div className="border-t border-border pt-4 mt-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setSelectedType(t.value)}
            className={`font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border transition-colors ${
              selectedType === t.value
                ? 'bg-accent text-white border-accent'
                : 'bg-transparent text-ink2 border-border hover:border-accent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escriu un comentari..."
          className="flex-1 bg-surface border border-border px-3 py-2.5 font-sans text-sm text-ink placeholder:text-ink3 focus:outline-none focus:border-accent"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ENVIAR
        </button>
      </div>
    </div>
  )
}
