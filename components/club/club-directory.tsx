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
  { id: 'martinenc',     name: 'CE Martinenc',        delegation: 'Barcelona',    municipality: 'Barcelona',      primaryColor: '#1B4FFF', secondaryColor: '#FFFFFF' },
  { id: 'cornella-b',    name: 'UE Cornellà B',       delegation: 'Baix Llobregat', municipality: 'Cornellà de Llobregat', primaryColor: '#15803D', secondaryColor: '#FFFFFF' },
  { id: 'gava',          name: 'CF Gavà',             delegation: 'Baix Llobregat', municipality: 'Gavà',          primaryColor: '#DC2626', secondaryColor: '#0A0A0A' },
  { id: 'europa-b',      name: 'CE Europa B',         delegation: 'Barcelona',    municipality: 'Barcelona',      primaryColor: '#FFFFFF', secondaryColor: '#1B4FFF' },
  { id: 'damm',          name: 'CF Damm',             delegation: 'Barcelona',    municipality: 'Barcelona',      primaryColor: '#1B4FFF', secondaryColor: '#DC2626' },
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
        placeholder="Cercar club..."
        className="w-full border border-border rounded-sm px-3 py-2 text-sm font-sans bg-white text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((club) => (
          <ClubCard key={club.id} {...club} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted text-sm py-8 font-sans">
          Cap club trobat.
        </p>
      )}
    </div>
  )
}
