'use client'

import { motion } from 'motion/react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { isTbd, stats, tracks } from '@/lib/content'
import { Card, Equator, RevealGroup, RevealItem, SectionHead } from '@/components/ui/primitives'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { CountUp } from '@/components/ui/count-up'
import { Orbit } from './orbit'

/* ============================================================
   ABOUT THE EVENT — figures + tracks
   Every track carries a hex from the official IEEE CS bright
   palette. That brings colour into the site without breaking the
   black base or stealing focus from the orange, which stays
   reserved for the calls to action.

   Aceternity UI's "Glowing Effect" is what turns that colour
   decision into interaction: the arc travelling around each card
   is drawn with ITS hex, not a generic one. Six cards, six
   different lights, one single system.
   ============================================================ */

function TrackCard({ track, index }: { track: (typeof tracks)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      data-reveal
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
      className="group relative h-full rounded-card"
      data-cursor
    >
      {/* The arc lives OUTSIDE the card: inside it would be clipped
          by its overflow-hidden and lose the outer halo. */}
      <GlowingEffect
        color={track.hex}
        accent="#FFA300"
        spread={38}
        proximity={56}
        className="rounded-card"
      />

      <Card className="relative h-full p-6 transition-colors duration-500 ease-cs">
        {/* the track's own colour wash, only on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-cs group-hover:opacity-100"
          style={{
            background: `radial-gradient(120% 90% at 0% 0%, ${track.hex}1F, transparent 62%)`,
          }}
        />
        <div className="relative flex h-full flex-col gap-3">
          <span className="flex items-center gap-2.5">
            <span
              className="h-2 w-2 flex-none rounded-full transition-transform duration-500 ease-cs group-hover:scale-150"
              style={{ backgroundColor: track.hex, boxShadow: `0 0 14px ${track.hex}66` }}
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              {track.pms}
            </span>
          </span>
          <h3 className="font-display text-[1.0625rem] font-bold leading-snug tracking-[-0.01em]">
            {track.name}
          </h3>
          <p className="text-[0.875rem] leading-relaxed text-muted-foreground">{track.blurb}</p>
        </div>
      </Card>
    </motion.div>
  )
}

export function About() {
  return (
    <section id="evento" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Sobre el evento"
          title={
            <>
              Una semana entera dedicada a <span className="grad-text">computación</span>.
            </>
          }
          lede="Seis días de charlas, talleres y retos técnicos, abiertos y gratuitos, organizados en conjunto por los capítulos Computer Society del Ecuador."
        />

        {/* figures */}
        <RevealGroup
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-4"
          step={0.08}
        >
          {stats.map((s, i) => {
            const n = Number(s.value)
            const countable = !isTbd(s.value) && Number.isFinite(n)

            return (
              <RevealItem key={s.label} className="group relative bg-ink-raise p-6">
                <div className="flex h-[clamp(2rem,4vw,2.75rem)] items-center font-display text-[clamp(2rem,4vw,2.75rem)] font-extrabold leading-none tracking-head tabular">
                  {isTbd(s.value) ? (
                    /* explicit gap: reads as reserved, not as an error */
                    <span
                      className="h-[0.62em] w-[1.15em] rounded-[4px] border border-dashed border-primary/45 bg-primary/[0.06]"
                      title="Dato pendiente de confirmar"
                      aria-label="Por confirmar"
                    />
                  ) : countable ? (
                    /* the figure counts up from zero when it enters the viewport */
                    <CountUp to={n} delay={i * 0.08} className="grad-text" />
                  ) : (
                    <span className="grad-text">{s.value}</span>
                  )}
                </div>
                <div className="mt-3 font-display text-[0.8125rem] font-bold uppercase tracking-[0.08em]">
                  {s.label}
                </div>
                <div className="mt-1 text-[0.8125rem] leading-snug text-subtle">{s.detail}</div>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>

      {/* constellation */}
      <div className="mt-24 md:mt-28">
        <Orbit />
      </div>

      <div className="shell mt-24 md:mt-28">
        <SectionHead
          eyebrow="Seis tracks"
          title="Elige por dónde entrar."
          lede="Cada track tiene su propio color, tomado de la paleta oficial de IEEE Computer Society. Ese color te acompaña en toda la agenda: sabes de qué trata una sesión antes de leer el título."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t, i) => (
            <TrackCard key={t.key} track={t} index={i} />
          ))}
        </div>
      </div>

      <div className="shell mt-24">
        <Equator label="EVENTO → AGENDA" />
      </div>
    </section>
  )
}
