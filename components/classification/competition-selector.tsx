'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Competition {
  id: string
  name: string
  group_name: string | null
  fcf_id: string | null
}

interface CompetitionSelectorProps {
  onChange?: (params: { category: string; group: string }) => void
}

export function CompetitionSelector({ onChange }: CompetitionSelectorProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedCategory, setSelectedCategory] = useState('Primera Catalana')
  const [selectedGroup, setSelectedGroup] = useState('Grup 1')

  useEffect(() => {
    async function fetchCompetitions() {
      const supabase = createClient()
      const { data } = await supabase
        .from('competitions')
        .select('id, name, group_name, fcf_id')
        .order('name')
        .order('group_name')
      if (data) setCompetitions(data)
    }
    fetchCompetitions()
  }, [])

  // Unique categories
  const categories = Array.from(new Set(competitions.map((c) => c.name)))

  // Groups filtered by selected category
  const availableGroups = competitions
    .filter((c) => c.name === selectedCategory)
    .map((c) => c.group_name || '')
    .filter(Boolean)

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat)
    const firstGroup = competitions.find((c) => c.name === cat)?.group_name || ''
    setSelectedGroup(firstGroup)
    emitChange(cat, firstGroup)
  }

  function handleGroupChange(grp: string) {
    setSelectedGroup(grp)
    emitChange(selectedCategory, grp)
  }

  function emitChange(category: string, group: string) {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-')
    const groupSlug = group.toLowerCase().replace(/\s+/g, '-')
    onChange?.({ category: categorySlug, group: groupSlug })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={selectedCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="bg-card border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink focus:outline-none focus:border-accent"
      >
        {categories.length === 0 ? (
          <option value="Primera Catalana">Primera Catalana</option>
        ) : (
          categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))
        )}
      </select>

      <select
        value={selectedGroup}
        onChange={(e) => handleGroupChange(e.target.value)}
        className="bg-card border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink focus:outline-none focus:border-accent"
      >
        {availableGroups.length === 0 ? (
          <option value="Grup 1">Grup 1</option>
        ) : (
          availableGroups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))
        )}
      </select>
    </div>
  )
}
