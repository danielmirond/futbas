import { Barlow_Condensed, Barlow, JetBrains_Mono } from 'next/font/google'

export const barlowCondensed = Barlow_Condensed({
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

export const barlow = Barlow({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

export const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Aliased exports for backwards compat
export const instrumentSerif = barlowCondensed
export const ibmPlexSans = barlow
export const ibmPlexMono = jetbrainsMono
export const archivoBlack = barlowCondensed
export const inter = barlow
