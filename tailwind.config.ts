import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Rampa de fondos: negros sesgados al azul CS (PMS 295), nunca #000 puro */
        ink: {
          DEFAULT: 'hsl(var(--ink))',
          raise: 'hsl(var(--ink-raise))',
          plate: 'hsl(var(--ink-plate))',
        },
        background: 'hsl(var(--ink))',
        foreground: 'hsl(var(--paper))',
        border: 'hsl(var(--line))',
        line: {
          DEFAULT: 'hsl(var(--line))',
          strong: 'hsl(var(--line-strong))',
        },
        muted: {
          DEFAULT: 'hsl(var(--ink-plate))',
          foreground: 'hsl(var(--paper-2))',
        },
        subtle: 'hsl(var(--paper-3))',

        /* Acentos oficiales IEEE Computer Society */
        primary: {
          DEFAULT: 'hsl(var(--orange))',
          foreground: 'hsl(var(--ink))',
        },
        cyan: 'hsl(var(--cyan))',
        deep: 'hsl(var(--deep))',
        abyss: 'hsl(var(--abyss))',

        /* Tracks — todos de la paleta bright oficial del brand guide */
        track: {
          ia: 'hsl(var(--track-ia))',
          cloud: 'hsl(var(--track-cloud))',
          sec: 'hsl(var(--track-sec))',
          data: 'hsl(var(--track-data))',
          dev: 'hsl(var(--track-dev))',
          quantum: 'hsl(var(--track-quantum))',
        },
      },
      fontFamily: {
        display: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        display: '-0.04em',
        head: '-0.03em',
        label: '0.16em',
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'orbit-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-ring': {
          '0%': { opacity: '0.55', transform: 'scale(1)' },
          '70%': { opacity: '0', transform: 'scale(1.9)' },
          '100%': { opacity: '0', transform: 'scale(1.9)' },
        },
        /* transform, no backgroundPosition: la GPU compone el
           desplazamiento sin repintar la capa */
        aurora: {
          '0%,100%': { transform: 'translate3d(-3%, -2%, 0) scale(1.06)' },
          '50%': { transform: 'translate3d(4%, 3%, 0) scale(1.16)' },
        },
        drift: {
          '0%,100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-14px,0)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        'orbit-spin': 'orbit-spin 90s linear infinite',
        'pulse-ring': 'pulse-ring 3.2s cubic-bezier(0.22,1,0.36,1) infinite',
        drift: 'drift 7s ease-in-out infinite',
        aurora: 'aurora 26s ease-in-out infinite',
      },
      transitionTimingFunction: {
        /* Curva única del sitio: salida rápida, asentamiento largo */
        cs: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}

export default config
