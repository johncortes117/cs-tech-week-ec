import type { Config } from 'tailwindcss'

/* Colours resolve through CSS variables so a whole section can switch
   between night and day by changing its class (see globals.css). The
   `<alpha-value>` placeholder keeps opacity modifiers like `bg-fg/10`
   working on top of that. */
const v = (name: string) => `hsl(var(--${name}) / <alpha-value>)`

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* Tone-aware: these change with .tone-night / .tone-day */
        bg: v('bg'),
        surface: v('surface'),
        fg: v('fg'),
        muted: v('fg-2'),
        subtle: v('fg-3'),
        line: { DEFAULT: v('line'), strong: v('line-strong') },

        /* Fixed brand colours — the same in every tone */
        cyan: v('cyan'),
        orange: v('orange'),
        slate: v('slate'),
        navy: v('navy'),
        night: v('night'),
        paper: v('paper'),

        /* Tracks — the official IEEE CS bright palette */
        track: {
          investigacion: v('track-investigacion'),
          iot: v('track-iot'),
          software: v('track-software'),
          ia: v('track-ia'),
          seguridad: v('track-seguridad'),
        },
      },
      fontFamily: {
        display: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-open-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
        /* Minecraft card only — see app/layout.tsx */
        pixel: ['var(--font-pixel)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.055em',
        display: '-0.045em',
        head: '-0.03em',
        label: '0.14em',
      },
      transitionTimingFunction: {
        /* The site's single curve: leaves fast, settles long */
        cs: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'live-pulse': {
          '0%': { transform: 'scale(1)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(2.6)', opacity: '0' },
        },
      },
      animation: {
        'live-pulse': 'live-pulse 1.8s cubic-bezier(0.22,1,0.36,1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
