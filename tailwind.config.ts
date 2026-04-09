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
        surface: '#FAFAF7',
        ink: '#0A0A0A',
        accent: '#1B4FFF',
        'accent-light': '#E8EDFF',
        win: '#15803D',
        draw: '#A16207',
        loss: '#DC2626',
        muted: '#6B7280',
        border: '#E5E5E0',
      },
      fontFamily: {
        serif: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-ibm-plex-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'monospace'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'title': ['1.25rem', { lineHeight: '1.3' }],
      },
    },
  },
  plugins: [],
}

export default config
