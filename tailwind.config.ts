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
        serif: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-ibm-plex-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      fontSize: {
        'mega': ['5rem', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'display': ['3.5rem', { lineHeight: '1.0', letterSpacing: '-0.03em' }],
        'headline': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'title': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        'bento': '1.25rem',
      },
    },
  },
  plugins: [],
}

export default config
