export const SITE_NAME = 'Futbas'
export const SITE_DESCRIPTION = 'Futbol Amateur'

export const FCF_BASE_URL = 'https://www.fcf.cat'
export const FCF_COMPETITION_URL = `${FCF_BASE_URL}/competicio`

export const SCRAPER_DELAYS = {
  min: 1000,
  max: 3000,
} as const

export const CATEGORIES = [
  'Primera Catalana',
  'Segona Catalana',
  'Tercera Catalana',
  'Lliga Elit',
  "Divisió d'Honor",
] as const

export const DELEGATIONS = [
  'Barcelona',
  'Girona',
  'Lleida',
  'Tarragona',
  'Terres de l\'Ebre',
] as const
