import localFont from 'next/font/local'

export const instrumentSerif = localFont({
  src: [
    { path: '../public/fonts/jizBRFtNs2ka5fCjM4j0A260.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/jizHRFtNs2ka5fCjM4j0F260LSxK.woff2', weight: '400', style: 'italic' },
  ],
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
})

export const ibmPlexMono = localFont({
  src: [
    { path: '../public/fonts/-F63fjptAgt5VM-kVkqdyU8n5ig.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})
