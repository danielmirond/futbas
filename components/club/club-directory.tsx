'use client'

import { useState } from 'react'
import { ClubCard } from './club-card'

interface Club {
  id: string
  name: string
  delegation: string
  municipality: string
  primaryColor: string
  secondaryColor: string
}

const MOCK_CLUBS: Club[] = [
  { id: 'martinenc',     name: 'CE Martinenc',        delegation: 'Barcelona',    municipality: 'Barcelona',      primaryColor: '#37003C', secondaryColor: '#FF2882' },
  { id: 'cornella-b',    name: 'UE Cornellà B',       delegation: 'Baix Llobregat', municipality: 'Cornellà de Llobregat', primaryColor: '#00FF85', secondaryColor: '#37003C' },
  { id: 'gava',          name: 'CF Gavà',             delegation: 'Baix Llobregat', municipality: 'Gavà',          primaryColor: '#FF2882', secondaryColor: '#0A0A0A' },
  { id: 'europa-b',      name: 'CE Europa B',         delegation: 'Barcelona',    municipality: 'Barcelona',      primaryColor: '#FFFFFF', secondaryColor: '#37003C' },
  { id: 'damm',          name: 'CF Damm',             delegation: 'Barcelona',    municipality: 'Barcelona',      primaryColor: '#37003C', secondaryColor: '#FF2882' },
  { id: 'sants',         name: 'UE Sants',            delegation: 'Barcelona',    municipality: 'Barcelona',      primaryColor: '#0A0A0A', secondaryColor: '#FFFFFF' },
  { id: 'badalona-futur',name: 'CF Badalona Futur',   delegation: 'Barcelonès Nord', municipality: 'Badalona',    primaryColor: '#1B4FFF', secondaryColor: '#FFFFFF' },
  { id: 'castelldefels', name: 'UE Castelldefels',    delegation: 'Baix Llobregat', municipality: 'Castelldefels', primaryColor: '#A16207', secondaryColor: '#0A0A0A' },
]

export function ClubDirectory() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_CLUBS.filter((club) =>
    club.name.toLowerCase().includes(search.toLowerCase()) ||
    club.delegation.toLowerCase().includes(search.toLowerCase()) ||
    club.municipality.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="CERCAR CLUB..."
        className="w-full border border-border px-4 py-3 text-sm font-mono uppercase tracking-wider bg-card text-ink placeholder:text-ink3 focus:outline-none focus:border-accent mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((club) => (
          <ClubCard key={club.id} {...club} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center eyebrow py-12">
          Cap club trobat.
        </p>
      )}
    </div>
  )
}
