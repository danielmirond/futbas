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
        // Premier League style palette
        primary: '#37003C',        // púrpura oscuro
        'primary-light': '#5c0066',
        'primary-dark': '#1a001d',
        accent: '#FF2882',         // magenta/rosa fuerte
        'accent-dark': '#e01f70',
        neon: '#00FF85',           // verde neón
        'neon-dark': '#00cc6a',

        // Surfaces
        surface: '#F8F0FF',        // lavender light background
        card: '#FFFFFF',
        bg: '#0f0f1a',             // dark sections

        // Text
        ink: '#37003C',            // primary text (dark purple)
        ink2: '#6B5478',           // secondary text
        ink3: '#9B8AA6',           // muted text
        muted: '#9B8AA6',

        // Borders
        border: '#EBE4F0',
        rule: '#EBE4F0',

        // Semantic
        win: '#00FF85',
        draw: '#9B8AA6',
        loss: '#FF2882',
      },
      fontFamily: {
        display: ['var(--font-barlow-condensed)', 'Impact', 'sans-serif'],
        serif: ['var(--font-barlow-condensed)', 'Impact', 'sans-serif'], // alias
        sans: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'Courier New', 'monospace'],
      },
      fontSize: {
        'mega': ['5rem', { lineHeight: '0.85', letterSpacing: '-0.04em' }],
        'display': ['3.5rem', { lineHeight: '0.9', letterSpacing: '-0.03em' }],
        'headline': ['2rem', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        'title': ['1.375rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        eyebrow: '0.15em',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #37003C, #5c0066, #37003C)',
        'accent-line': 'linear-gradient(90deg, #FF2882, #00FF85)',
      },
    },
  },
  plugins: [],
}

export default config
