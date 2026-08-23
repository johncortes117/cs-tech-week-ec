'use client'

import * as React from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { EASE, drawLine, lineMask } from '@/lib/motion'
import { event, chapterSlots, chapters } from '@/lib/content'
import { Btn, Val } from '@/components/ui/primitives'
import { HeroBackdrop } from '@/components/ui/hero-backdrop'
import { PixelatedCanvas } from '@/components/ui/pixelated-canvas'
import { Magnetic } from '@/components/ui/magnetic'
import { Scramble } from '@/components/ui/text-fx'

/* ============================================================
   HERO

   The event logo is the subject. It is not drawn as an image but
   sampled into a grid of dots that assemble on load and scatter
   under the pointer — the mark reads as something built out of
   pixels, which is the point of a computing event.
   See components/ui/pixelated-canvas.tsx.

   Behind it, the backdrop carries the nebula and a warm ember
   behind the mark. No hard lines: the light is the only thing
   that shapes the scene.

   The text is spread across depth planes. The headline moves more
   than the body, and the logo leans the other way: that
   difference in travel is what makes the whole thing read as
   space rather than as stacked layers.
   ============================================================ */

/** Travel in pixels of each plane as the cursor moves. */
const PLANES = { title: 10, body: 6, logo: 22 }

export function Hero() {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  /* A single listener for all of the hero's parallax, batched in
     one rAF: four planes reading the pointer on their own would be
     the same layout work four times over. */
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 90, damping: 22, mass: 0.7 })
  const py = useSpring(my, { stiffness: 90, damping: 22, mass: 0.7 })

  React.useEffect(() => {
    if (reduce) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      if (frame) return
      const { clientX, clientY } = e
      frame = requestAnimationFrame(() => {
        frame = 0
        mx.set((clientX / window.innerWidth) * 2 - 1)
        my.set((clientY / window.innerHeight) * 2 - 1)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduce, mx, my])

  const titleX = useTransform(px, [-1, 1], [PLANES.title, -PLANES.title])
  const titleY = useTransform(py, [-1, 1], [PLANES.title * 0.55, -PLANES.title * 0.55])
  const bodyX = useTransform(px, [-1, 1], [PLANES.body, -PLANES.body])
  const bodyY = useTransform(py, [-1, 1], [PLANES.body * 0.55, -PLANES.body * 0.55])
  /* the logo leans the other way, so it and the text pull apart */
  const logoX = useTransform(px, [-1, 1], [-PLANES.logo, PLANES.logo])
  const logoY = useTransform(py, [-1, 1], [-PLANES.logo * 0.5, PLANES.logo * 0.5])

  const meta = [
    { label: 'Fechas', value: event.dates },
    { label: 'Sede', value: event.venue },
    { label: 'Formato', value: event.format },
  ]

  return (
    <section
      ref={ref}
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pb-20 pt-[calc(var(--nav-h)+28px)] lg:pb-24 lg:pt-[calc(var(--nav-h)+80px)]"
    >
      <HeroBackdrop className="-z-10" />

      {/* The text needs its own ground or it competes with the glow
          behind the logo. A flat gradient, no filters. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(100deg, hsl(var(--ink) / 0.88) 0%, hsl(var(--ink) / 0.55) 42%, transparent 74%)',
        }}
      />

      <motion.div
        className="shell relative grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        {/* ---------- copy ---------- */}
        <div className="order-last lg:order-first">
          {/* headline in masked lines */}
          <motion.h1
            style={reduce ? undefined : { x: titleX, y: titleY }}
            className="font-display text-[clamp(2.6rem,6.4vw,5.2rem)] font-black leading-[0.92] tracking-display"
          >
            {event.headline.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  custom={i}
                  variants={lineMask}
                  initial="hidden"
                  animate="show"
                >
                  {/* No glow on the orange line: the mask above has
                      to clip, and a blurred text-shadow inside it
                      gets cut into a visible rectangle. */}
                  {i === event.headline.length - 1 ? (
                    <span className="text-primary">{line}</span>
                  ) : (
                    line
                  )}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.div style={reduce ? undefined : { x: bodyX, y: bodyY }}>
            {/* equatorial line, drawn on load */}
            <motion.div
              aria-hidden="true"
              variants={drawLine}
              initial="hidden"
              animate="show"
              className="relative mt-8 h-px origin-left"
              style={{
                background:
                  'linear-gradient(90deg, hsl(var(--orange)) 0%, hsl(var(--orange) / 0.45) 22%, hsl(var(--line)) 60%, transparent 100%)',
              }}
            >
              <span className="absolute -top-[3px] left-0 h-[7px] w-px bg-primary" />
            </motion.div>

            {/* The coordinates decrypt on entry: it is the only piece
                of hero data that is literally a number, and it
                deserves to read like an instrument readout. */}
            <div className="mt-3 flex items-center gap-1.5 text-primary">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <Scramble
                text={event.coords}
                step={34}
                trigger="mount"
                className="block font-mono text-[10px] tracking-[0.16em]"
              />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
              className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-muted-foreground"
            >
              {event.intro}
            </motion.p>

            {/* metadata */}
            <motion.dl
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.66 }}
              className="mt-7 flex flex-wrap gap-x-8 gap-y-5 lg:mt-9"
            >
              {meta.map((m) => (
                <div key={m.label} className="border-l border-line-strong pl-4">
                  <dt className="label">{m.label}</dt>
                  <dd className="mt-1 font-display text-[0.9375rem] font-bold tracking-[-0.01em]">
                    <Val value={m.value} />
                  </dd>
                </div>
              ))}
            </motion.dl>

            {/* calls to action */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.78 }}
              className="mt-8 flex flex-wrap gap-3 lg:mt-10"
            >
              <Magnetic radius={70} strength={0.26}>
                <Btn href={event.registerUrl} size="lg">
                  Registro gratuito
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-cs group-hover:translate-x-1" />
                </Btn>
              </Magnetic>
              <Magnetic radius={70} strength={0.2}>
                <Btn href={event.sponsorUrl} size="lg" variant="ghost">
                  Quiero ser sponsor
                </Btn>
              </Magnetic>
            </motion.div>

            {/* organisers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.95 }}
              className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line/70 pt-6"
            >
              <span className="label">Organizan</span>
              {chapters.length > 0
                ? chapters.map((c) => (
                    <span
                      key={c.name}
                      className="font-display text-[12px] font-semibold text-muted-foreground"
                    >
                      {c.name}
                    </span>
                  ))
                : Array.from({ length: Math.min(chapterSlots, 4) }).map((_, i) => (
                    <span
                      key={i}
                      className="h-3 w-24 rounded-[3px] border border-dashed border-primary/35 bg-primary/[0.05]"
                      aria-label="Capítulo por confirmar"
                    />
                  ))}
            </motion.div>
          </motion.div>
        </div>

        {/* ---------- the logo, sampled into dots ---------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          style={reduce ? undefined : { x: logoX, y: logoY }}
          /* The mark is tall (776:990). On desktop its height, not
             its width, is the constraint: at the old 460px width it
             ran ~590px tall and the wordmark fell below the fold
             under the nav + countdown bar. Derive the width from a
             share of viewport height (via the aspect ratio) so the
             whole logo always fits the first screen, and cap it so
             it never dominates on very tall windows. */
          className="order-first mx-auto w-[min(56vw,248px)] lg:order-last lg:-mt-16 lg:w-[calc(52vh*776/990)] lg:max-w-[420px] xl:-mt-24"
        >
          <div className="relative aspect-[776/990] w-full">
            <PixelatedCanvas
              src="/logo/cs-tech-week-ec.svg"
              fill
              /* Resolution is fixed in cells, not pixels: the ribbon
                 lettering and the wordmark need a certain number of
                 cells per glyph to stay readable, and a fixed
                 cellSize would drop below that as soon as the
                 element shrank on mobile. */
              columns={120}
              dotScale={0.8}
              shape="square"
              /* Dropout thins low-contrast areas — which is exactly
                 where thin letter strokes live. Kept low so the
                 texture stays in the flat fills. */
              dropoutStrength={0.08}
              distortionMode="swirl"
              distortionStrength={4}
              distortionRadius={95}
              followSpeed={0.18}
              jitterStrength={3}
              jitterSpeed={3}
              /* the mark is drawn for light backgrounds: gamma lifts
                 its darkest navy off #05070B while leaving the
                 brand cyan and orange where they are */
              gamma={1.55}
              revealDuration={1.6}
              className="pointer-events-none h-full w-full"
            />
          </div>
          <span className="sr-only">CS Tech Week Ecuador</span>
        </motion.div>
      </motion.div>

      {/* scroll cue: a bit falling down the rail */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="scroll-cue pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center md:flex"
      >
        <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="mt-2 block h-10 w-px bg-gradient-to-b from-primary/45 to-transparent" />
      </motion.div>
    </section>
  )
}
