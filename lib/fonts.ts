import localFont from 'next/font/local'
import { Instrument_Serif, IBM_Plex_Mono } from 'next/font/google'

export const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

export const ibmPlexSans = localFont({
  src: [
    { path: '../public/fonts/zYXgKVElMYYaJe8bpLHnCwDKhdHeFQ.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/zYX9KVElMYYaJe8bpLHnCwDKjSL9AIFsdA.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/zYX9KVElMYYaJe8bpLHnCwDKjQ76AIFsdA.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
})

export const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})
