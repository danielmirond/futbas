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
        surface: '#0D0D0F',
        card: '#18181B',
        ink: '#F5F5F3',
        accent: '#3B82F6',
        'accent-light': '#1E293B',
        win: '#22C55E',
        draw: '#EAB308',
        loss: '#EF4444',
        muted: '#71717A',
        border: '#27272A',
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
