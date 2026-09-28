'use client'

import * as React from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE, lineMask } from '@/lib/motion'
import { event } from '@/lib/content'
import { Btn } from '@/components/ui/primitives'
import { StatusLine } from '@/components/ui/event-status'
import { Mark } from '@/components/brand/logo'
import { Logo3D } from '@/components/brand/logo-3d'

/* ============================================================
   HERO

   Words: the name, what the week is, when. Nothing to decode.

   Image: the event logo as a real object. Its pieces are
   extruded from the SVG and fly together on load; then it turns
   to face the cursor, its layers pull apart when you hover it,
   and it turns away as you scroll (components/brand/logo-scene.ts).

   While three.js loads the stage stays empty rather than showing
   the flat mark and swapping it — the 3D intro assembles the logo
   itself. The flat SVG is the fallback: reduced motion, no WebGL,
   or a load that takes too long.
   ============================================================ */

export function Hero() {
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, 110])
  const textFade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={ref}
      id="top"
      data-tone="night"
      className="tone-night relative isolate overflow-hidden bg-bg text-fg"
    >
      <div className="shell relative grid min-h-[100svh] grid-cols-1 content-center gap-y-2 pb-28 pt-[calc(var(--nav-h)+8px)] lg:grid-cols-12 lg:gap-x-6 lg:pb-24">
        {/* ---------- the logo, in 3D ---------- */}
        <div className="relative mx-auto w-[min(70vw,320px)] lg:order-2 lg:col-span-5 lg:w-full lg:max-w-[520px] lg:justify-self-end">
          <HeroStage />
        </div>

        {/* ---------- words ---------- */}
        <motion.div style={{ y: textY, opacity: textFade }} className="relative z-10 lg:order-1 lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
          >
            <StatusLine className="rounded-full border border-line-strong bg-fg/[0.03] px-3.5 py-1.5 text-[13px] font-semibold text-muted" />
          </motion.div>

          <h1 className="mt-7 font-display text-[clamp(2.9rem,6.4vw,6.2rem)] font-black leading-[0.92] tracking-tightest">
            {event.headline.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.07em]">
                <motion.span
                  className={cn('block', i === 1 && 'text-cyan')}
                  variants={lineMask}
                  custom={i}
                  initial="hidden"
                  animate="show"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
            className="mt-7 max-w-[46ch] text-[1.0625rem] leading-relaxed text-muted sm:text-lg"
          >
            {event.summary}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
            className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-[15px] font-bold"
          >
            <span className="inline-flex items-center gap-2.5">
              <CalendarDays className="h-[18px] w-[18px] flex-none text-cyan" aria-hidden="true" />
              {event.when}
            </span>
            <span className="rounded-full border border-line-strong px-2.5 py-0.5 text-[12px] font-semibold text-muted">
              {event.format}
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Btn href={event.registerUrl} target="_blank" rel="noopener noreferrer" size="lg" arrow="next">
              Inscríbete
            </Btn>
            <Btn href="#programa" size="lg" variant="ghost">
              Ver programa
            </Btn>
          </motion.div>
        </motion.div>
      </div>

      {/* endorsement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="shell absolute inset-x-0 bottom-8 flex items-end justify-between"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/ieee-cs-80th-white.svg"
          alt="IEEE Computer Society, 80 años"
          className="h-auto w-[132px] opacity-80 md:w-[150px]"
        />
        <span aria-hidden="true" className="hidden h-12 w-px overflow-hidden bg-fg/10 md:block">
          <motion.span
            className="block h-1/2 w-px bg-cyan"
            animate={{ y: ['-100%', '200%'] }}
            transition={{ duration: 2.2, ease: EASE, repeat: Infinity, repeatDelay: 0.4 }}
          />
        </span>
      </motion.div>
    </section>
  )
}

/* ============================================================
   THE STAGE
   ============================================================ */

type Mode = 'loading' | '3d' | 'flat'

/** How long to wait for WebGL before settling for the flat mark. */
const PATIENCE_MS = 3500

function HeroStage() {
  const [mode, setMode] = React.useState<Mode>('loading')
  const [try3d, setTry3d] = React.useState(false)

  React.useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMode('flat')
      return
    }
    setTry3d(true)
    const timer = window.setTimeout(() => setMode((m) => (m === 'loading' ? 'flat' : m)), PATIENCE_MS)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="relative aspect-[776/856] w-full" aria-hidden="true">
      <Mark
        className={cn(
          'absolute inset-0 h-full w-full transition-opacity duration-700 ease-cs',
          mode === 'flat' ? 'opacity-100' : 'opacity-0'
        )}
      />
      {try3d ? (
        <Logo3D
          /* the canvas is larger than the stage: room to turn and spread */
          className={cn(
            /* every piece starts at zero scale, so a short fade is enough —
               a long one would hide the assembly */
            'pointer-events-none absolute -inset-[20%] transition-opacity duration-300',
            mode === '3d' ? 'opacity-100' : 'opacity-0'
          )}
          onStatus={(s) => setMode(s === 'ready' ? '3d' : 'flat')}
        />
      ) : null}
    </div>
  )
}
