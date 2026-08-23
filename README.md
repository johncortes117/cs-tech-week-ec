# CS Tech Week Ecuador

Website for CS Tech Week Ecuador — a week of talks, workshops and technical
challenges organised jointly by the IEEE Computer Society chapters of Ecuador,
in the year IEEE Computer Society turns eighty.

> **Language note.** The site copy is written in Spanish, because the audience
> is Ecuadorian. Everything else — code, comments, documentation and commit
> messages — is in English.

## Stack

| | |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, static export) |
| UI | React 19 · TypeScript |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com) |
| Animation | [Motion 12](https://motion.dev) |
| Smooth scroll | [Lenis](https://lenis.darkroom.engineering) |
| Globe | [cobe](https://cobe.vercel.app) |
| Icons | [lucide-react](https://lucide.dev) |

There is no 3D engine in the dependency list. The hero scene is written directly
against the WebGL API (see `components/ui/hero-scene.tsx`).

## Getting started

Requires **Node.js 20+** and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `pnpm dev` | Development server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Next.js ESLint rules |

## Project structure

```
app/                     App Router entry, global styles and fonts
├── layout.tsx           Root layout, fonts, providers
├── page.tsx             The single page: sections in order
└── globals.css          Design tokens, component classes, utilities

lib/
├── content.ts           ← all editable copy and data lives here
├── motion.ts            Shared easing curves and animation variants
├── use-countdown.ts     Countdown to the event start
├── use-reduced-motion.ts  Hydration-safe motion-preference hook
└── utils.ts             `cn()` class helper

components/
├── sections/            One file per page section
└── ui/                  Reusable pieces: primitives, effects, the WebGL scene

public/logo/             Logos served to the browser
brand/                   Brand assets and the internal branding proposal
```

## Editing the content

**All copy and data live in `lib/content.ts`.** Components contain no hard-coded
text, so updating the event means editing that one file: dates, venue, tracks,
speakers, sponsor tiers, FAQ, navigation and footer.

Sections fill themselves in from that data. While `speakers`, `days`, `venues`
or `chapters` are empty arrays, the matching section renders a deliberate
"to be announced" state instead of placeholder cards.

### Unconfirmed data

Anything not yet confirmed is wrapped with the `tbd()` helper:

```ts
dates: tbd('Fechas por confirmar'),
```

It renders on screen as a dotted orange placeholder, so unconfirmed information
can never be mistaken for a real announcement. Replace the call with a plain
string once the value is final:

```ts
dates: '9–14 de noviembre de 2026',
```

Search the file for `tbd(` to see everything still pending.

### Countdown

`event.startsAt` drives the countdown in the announcement bar and in the final
call to action. It is an ISO string in Ecuador time (UTC−5) and currently holds
a placeholder date.

## Conventions

- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org)
  and are written in English: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- **Animation** comes from `lib/motion.ts`. If a curve or variant is not defined
  there, it should not be used — one vocabulary for the whole site.
- **Motion preference** is handled globally by `MotionProvider`
  (`MotionConfig reducedMotion="user"`). Components must not branch their
  variants on the preference; when the value is genuinely needed in JavaScript,
  use `useReducedMotion` from `lib/use-reduced-motion.ts`, not the one from
  `motion/react`.
- **Rendering cost.** Avoid `filter: blur()` on large or animated elements,
  animate `transform` and `opacity` rather than layout or background
  properties, and stop every `requestAnimationFrame` loop with an
  `IntersectionObserver` when its element leaves the viewport.

## Accessibility

- `prefers-reduced-motion` is honoured throughout: transform and layout
  animations are disabled, smooth scroll and the custom cursor never mount, and
  a CSS safety net guarantees no content depends on an animation to become
  visible.
- Cursor-driven effects require a fine pointer, so they do not exist on touch
  devices.
- The WebGL hero falls back to a gradient when WebGL is unavailable.

## Deployment

The project builds to static output and runs on any Node or static host.
On [Vercel](https://vercel.com), importing the repository is enough — the
framework is detected automatically and no environment variables are required.

```bash
pnpm build
pnpm start
```

## Credits

Built by the IEEE Computer Society chapters of Ecuador.

Several interaction components are adapted from [Aceternity UI](https://ui.aceternity.com)
and [React Bits](https://reactbits.dev), reworked to match the event's visual
system.

IEEE, the IEEE logo and the IEEE Computer Society logo are trademarks of their
respective owners. The brand assets in this repository are used under the
IEEE Computer Society brand guidelines for chapter activities.
