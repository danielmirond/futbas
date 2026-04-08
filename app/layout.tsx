import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fútbol en la TV — Guía de partidos televisados',
  description: 'Todos los partidos de fútbol televisados hoy. Horarios y canales en abierto y de pago.',
  manifest: '/manifest.json',
  themeColor: '#CC0000',
  icons: { apple: '/logo-md.png' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/logo-md.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#0b0c10' }}>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')` }} />
      </body>
    </html>
  )
}
