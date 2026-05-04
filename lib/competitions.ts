export const COMPETITIONS = [
  { slug: 'laliga-ea-sports',   name: 'LaLiga EA Sports',   espnId: 'esp.1',            country: 'España' },
  { slug: 'laliga-hypermotion', name: 'LaLiga Hypermotion',  espnId: 'esp.2',            country: 'España' },
  { slug: 'copa-del-rey',       name: 'Copa del Rey',        espnId: 'esp.cup',          country: 'España' },
  { slug: 'champions-league',   name: 'Champions League',    espnId: 'uefa.champions',   country: 'Europa' },
  { slug: 'europa-league',      name: 'Europa League',       espnId: 'uefa.europa',      country: 'Europa' },
  { slug: 'conference-league',  name: 'Conference League',   espnId: 'uefa.europa.conf', country: 'Europa' },
  { slug: 'premier-league',     name: 'Premier League',      espnId: 'eng.1',            country: 'Inglaterra' },
  { slug: 'fa-cup',             name: 'FA Cup',              espnId: 'eng.fa',           country: 'Inglaterra' },
  { slug: 'bundesliga',         name: 'Bundesliga',          espnId: 'ger.1',            country: 'Alemania' },
  { slug: 'serie-a',            name: 'Serie A',             espnId: 'ita.1',            country: 'Italia' },
  { slug: 'ligue-1',            name: 'Ligue 1',             espnId: 'fra.1',            country: 'Francia' },
  { slug: 'eredivisie',         name: 'Eredivisie',          espnId: 'ned.1',            country: 'Países Bajos' },
  { slug: 'primeira-liga',      name: 'Primeira Liga',       espnId: 'por.1',            country: 'Portugal' },
  { slug: 'mls',                name: 'MLS',                 espnId: 'usa.1',            country: 'Estados Unidos' },
  { slug: 'liga-mx',            name: 'Liga MX',             espnId: 'mex.1',            country: 'México' },
  { slug: 'copa-libertadores',  name: 'Copa Libertadores',   espnId: 'conmebol.libertadores', country: 'Sudamérica' },
]

export type Competition = typeof COMPETITIONS[number]

export function getCompBySlug(slug: string): Competition | undefined {
  return COMPETITIONS.find(c => c.slug === slug)
}

export function slugify(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function teamToSlug(name: string): string {
  return slugify(name)
}
