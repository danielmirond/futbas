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
        // Mundo Deportivo palette — black / yellow / red
        primary: '#000000',        // negro MD (header, bottom nav, hero)
        'primary-light': '#1a1a1a',
        'primary-dark': '#000000',
        accent: '#FFD100',         // amarillo MD (titulares, destacados, active)
        'accent-dark': '#E8BE00',
        danger: '#E30613',         // rojo MD (alertas, live, rojos)
        'danger-dark': '#C1050F',

        // Alias neón → amarillo (mantengo nombre por compat)
        neon: '#FFD100',
        'neon-dark': '#E8BE00',

        // Surfaces
        surface: '#F4F4F4',        // gris muy claro (fondo página)
        card: '#FFFFFF',
        bg: '#0a0a0a',             // secciones oscuras

        // Text
        ink: '#0a0a0a',            // texto principal (negro editorial)
        ink2: '#4a4a4a',
        ink3: '#8a8a8a',
        muted: '#8a8a8a',

        // Borders
        border: '#E5E5E5',
        rule: '#E5E5E5',

        // Semantic (form W/D/L y status)
        win: '#00A651',            // verde pitch (convención resultados)
        draw: '#8a8a8a',
        loss: '#E30613',           // rojo MD
        live: '#E30613',           // rojo MD para LIVE
      },
      fontFamily: {
        display: ['var(--font-barlow-condensed)', 'Impact', 'sans-serif'],
        serif: ['var(--font-barlow-condensed)', 'Impact', 'sans-serif'],
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
        // Hero MD: negro sólido (sin degradado — editorial)
        'hero-gradient': 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
        // Línea MD: amarillo → rojo (firma visual)
        'accent-line': 'linear-gradient(90deg, #FFD100 0%, #FFD100 50%, #E30613 50%, #E30613 100%)',
        // Barras laterales MD (amarillo|rojo) como fondo repetible para logos
        'md-bars': 'linear-gradient(90deg, #FFD100 0%, #FFD100 40%, #E30613 40%, #E30613 100%)',
      },
    },
  },
  plugins: [],
}

export default config
