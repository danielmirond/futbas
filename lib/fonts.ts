import { Archivo_Black, Inter, JetBrains_Mono } from 'next/font/google'

export const archivoBlack = Archivo_Black({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Exports aliased for backwards compat with existing imports
export const instrumentSerif = archivoBlack
export const ibmPlexSans = inter
export const ibmPlexMono = jetbrainsMono
