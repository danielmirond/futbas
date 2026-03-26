import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fútbol en la TV — Guía de partidos televisados España',
  description: 'Todos los partidos de fútbol televisados hoy en España. Horarios y canales en abierto y de pago.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: '#0b0c10' }}>
        {children}
      </body>
    </html>
  )
}
