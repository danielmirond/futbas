import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Híbrido: dark header + light content
        surface: '#F5F5F0',       // warm beige content background
        card: '#FFFFFF',           // white cards
        ink: '#0A0A0A',            // dark text on light bg
        'ink-dark': '#FAFAF7',     // light text on dark header
        header: '#0A0A0A',         // dark header background
        border: '#E5E5DD',         // warm light border
        muted: '#737373',          // muted text

        // Bento accent palette (vivid colors for cards)
        accent: '#FF6B35',         // orange primary
        lime: '#A3E635',           // lime green
        pink: '#EC4899',           // hot pink
        violet: '#8B5CF6',         // violet
        sky: '#0EA5E9',            // sky blue
        amber: '#F59E0B',          // amber
        rose: '#F43F5E',           // rose red

        // Semantic (for match states)
        win: '#16A34A',
        draw: '#EAB308',
        loss: '#DC2626',
      },
      fontFamily: {
        // Display: Archivo Black (impact, deportivo bold)
        serif: ['var(--font-archivo-black)', 'system-ui', 'sans-serif'],
        display: ['var(--font-archivo-black)', 'system-ui', 'sans-serif'],
        // Body: Inter (moderna, legible)
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // Data: JetBrains Mono (código/stats)
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      fontSize: {
        'mega': ['6rem', { lineHeight: '0.9', letterSpacing: '-0.05em' }],
        'display': ['4rem', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'headline': ['2.25rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'title': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        'bento': '1.25rem',
      },
    },
  },
  plugins: [],
}

export default config
