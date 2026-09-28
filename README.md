# CS Tech Week Ecuador

Website for CS Tech Week Ecuador — a week of talks and two contests organised
jointly by the IEEE Computer Society chapters of Ecuador, in the year IEEE
Computer Society turns eighty.

> **Language note.** The site copy is written in Spanish, because the audience
> is Ecuadorian. Everything else — code, comments, documentation and commit
> messages — is in English.

## Identity: "Latitud Cero"

The event logo is a bulb with a ribbon wrapped around it — an equator around a
sphere. Ecuador is the country named after that line. Every visual decision on
the site comes from there:

| Device | What it is | Where it lives |
| --- | --- | --- |
| **La cinta** | The logo's ribbon: a cyan band ending in an arrow tip (`.ribbon`) | Week strip, speaker tracks, the band under the hero |
| **La línea** | Latitude zero: one hairline, used as a horizon | Hero, organisers map, closing |
| **Día / noche** | At the equator day and night last twelve hours each. Sections alternate between two tones (`.tone-day` / `.tone-night`) | Decided by assets: white chapter logos at night, white-backed sponsor logos and sticker sheets by day |

The mark is always drawn from the event's own SVG (`components/brand/`), never
a raster. Its cyan and orange are the logo's exact values; its dark blue follows
the section tone so the same mark works by day and by night.

**Copy rule:** every fact is said once. Dates and hours live in the week strip,
prices in the passes, tracks in the speaker filter. If a sentence repeats what
another section already shows, it goes.

## Stack

| | |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, statically prerendered) |
| UI | React 19 · TypeScript |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com) |
| Animation | [Motion 12](https://motion.dev) |
| Smooth scroll | [Lenis](https://lenis.darkroom.engineering) |
| Icons | [lucide-react](https://lucide.dev) |
| 3D | [three.js](https://threejs.org) — hero logo only, loaded on demand |

The hero logo is extruded at runtime from the event's own SVG paths
(`components/brand/logo-scene.ts`): no model file to keep in sync with the
brand. Its pieces assemble on load, the logo turns towards the cursor, its
layers pull apart on hover and it turns away on scroll. three.js lives in its
own chunk, fetched after the first paint; with reduced motion or no WebGL the
flat SVG mark is shown instead. Everything else — week strip, map — is SVG and
CSS.

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
| `pnpm images` | Write optimised WebP copies of new photos and logos |

## Project structure

```
app/                     App Router entry, global styles and fonts
├── layout.tsx           Root layout, fonts, providers
├── page.tsx             The single page: sections in order
└── globals.css          Tokens, day/night tones, the ribbon shape

lib/
├── content.ts           ← all editable copy and data lives here
├── use-event-status.ts  Countdown → "Día 3 de 7" → "En vivo", from one clock
├── geo.ts               Ecuador outline (Natural Earth, generated)
├── motion.ts            The three motion gestures: rise, wrap, light
├── use-reduced-motion.ts  Hydration-safe motion-preference hook
└── utils.ts             `cn()` class helper

components/
├── brand/               The mark, the wordmark and the ribbon
├── sections/            One file per page section
└── ui/                  Primitives and small reusable pieces

scripts/optimize-images.mjs   Source images → /web/*.webp
```

## Editing the content

**All copy and data live in `lib/content.ts`.** Components contain no copy of
their own.

### Adding a speaker

1. Drop the photo in `public/speakers/`.
2. Run `pnpm images` — it prints the path of the optimised WebP
   (a 2–6 MB phone photo becomes ~40 KB).
3. Add an entry to `speakers` with `photo` pointing at that path.

```ts
{
  name: 'Nombre Apellido',
  talk: 'Título de la charla',
  org: 'UTN',
  degree: 'PhD.',                           // optional — set small before the name
  role: 'AI Engineer',                      // optional — shown before the institution
  photo: '/speakers/web/nombre.webp',
  tracks: ['software', 'ia'],              // every topic it covers
  slot: { day: 2, start: '17:00', end: '18:00' }, // day 0 = Monday 28, Ecuador time
  category: 'profesional',
}
```

`degree` is for academic titles (PhD., MSc., Mg., Ing.) and reads as part of the
name, a step smaller. `role` is for positions that are not degrees (AI Engineer,
Docente investigador) and opens the line under the name: `AI ENGINEER · UTN`.
Students usually have neither, which is what sets them apart on the wall.

### The programme

There is no separate timetable. The speaker wall is the programme: it is laid
out day by day from each speaker's `slot`, every card shows its hour, and the
day columns of the week strip link to their group. Two entries with the same
`talk` share one card. A speaker appears only once added to `speakers` — there
are no placeholder cards.

A switch at the top of the section swaps between two readings of the same data:

- **Speakers** (default): a card per talk, grouped by day. Each card turns over
  on click or tap. The front says who — portrait (black and white, colour on
  hover), hour, then degree, name, position and institution, each on its own
  line. The back says what — the talk, set large, and its topics. Long titles
  step down in size so they always fit whole.
- **Horario**: the timetable (`components/sections/timetable.tsx`) — days
  across, hours down, talk and speaker in each slot, no photos. On phones the
  same blocks stack into a day-by-day agenda. Picking a talk switches back to
  the cards and rings that speaker.

Contest times live in `contests[].slot`.

### The live status

`event.startsAt`, `event.endsAt` and the sessions (`lib/schedule.ts`, collected
from speakers, pending slots and contests) drive everything time-based: the
countdown before the talks open, "Día N de 7" during the week, "En vivo · name"
while a session is on air — in the hero, the header, the week strip and on the
card itself — and the closing line afterwards. Nothing needs a redeploy when
the week begins.

## Conventions

- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org)
  and are written in English: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- **Animation** comes from `lib/motion.ts`. If a gesture is not defined there,
  it should not be used — one vocabulary for the whole site.
- **Motion preference** is handled globally by `MotionProvider`
  (`MotionConfig reducedMotion="user"`). When the value is genuinely needed in
  JavaScript, use `useReducedMotion` from `lib/use-reduced-motion.ts`.
- **Motion vs Tailwind transforms.** An element Motion animates must not use a
  Tailwind `translate-*` for positioning — Motion rewrites `transform` and the
  class is lost. Centre it through Motion's `style={{ x: '-50%' }}` instead.
- **Viewport margins are vertical only** (`'-80px 0px'`). A bare `'-80px'`
  shrinks the root on the sides too, and on a phone anything near the edge
  never counts as visible.

## Accessibility

- `prefers-reduced-motion` is honoured throughout: transform animations are
  disabled, smooth scroll never mounts, video stays on its poster, and a CSS
  safety net guarantees no content depends on an animation to become visible.
- Sound is never automatic: the contest clip plays muted until asked.
- Pointer-driven parallax requires a fine pointer.
- The map's cities are buttons, so it works with a keyboard.

## Deployment

On [Vercel](https://vercel.com), importing the repository is enough — the
framework is detected automatically and no environment variables are required.

```bash
pnpm build
pnpm start
```

## Credits

Built by the IEEE Computer Society chapters of Ecuador. Map outline from
[Natural Earth](https://www.naturalearthdata.com) (public domain).

IEEE, the IEEE logo and the IEEE Computer Society logo are trademarks of their
respective owners. The brand assets in this repository are used under the
IEEE Computer Society brand guidelines for chapter activities.
