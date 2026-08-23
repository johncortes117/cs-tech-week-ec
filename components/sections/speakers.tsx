'use client'

import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { speakers, speakerSlots, trackByKey, event } from '@/lib/content'
import { Btn, Card, Equator, Pill, SectionHead } from '@/components/ui/primitives'
import { CometCard } from '@/components/ui/comet-card'

/* ============================================================
   SPEAKERS
   Mientras no haya confirmados, los huecos se muestran como
   marcos vacíos deliberados — con número de orden y "por
   anunciar" — en vez de tarjetas falsas con nombres inventados.

   Las tarjetas van dentro del "Comet Card" de Aceternity UI: la
   ficha se inclina en perspectiva siguiendo al cursor y un
   reflejo especular se desplaza sobre ella. Es el sitio exacto
   donde ese efecto tiene sentido — una ficha de persona se
   siente objeto, y un objeto se toma en la mano.
   ============================================================ */

function GhostSpeaker({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      data-reveal
      viewport={VIEWPORT}
      transition={{ duration: 0.55, ease: EASE, delay: index * 0.05 }}
    >
      <CometCard rotateDepth={9} translateDepth={8}>
        <div
          className="group relative aspect-[4/5] overflow-hidden rounded-card border border-dashed border-line-strong bg-ink-raise"
          data-cursor
        >
          {/* trama de puntos: el mismo lenguaje del domo orbital */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40 transition-opacity duration-500 ease-cs group-hover:opacity-80"
            style={{
              backgroundImage: 'radial-gradient(hsl(var(--line-strong)) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
              maskImage: 'radial-gradient(70% 60% at 50% 38%, #000, transparent)',
              WebkitMaskImage: 'radial-gradient(70% 60% at 50% 38%, #000, transparent)',
            }}
          />
          {/* barrido: el hueco se está "escaneando" a la espera de alguien */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 -translate-y-full opacity-0 transition-all duration-[900ms] ease-cs group-hover:translate-y-[420%] group-hover:opacity-100 motion-reduce:hidden"
            style={{
              background:
                'linear-gradient(180deg, transparent, hsl(var(--orange) / 0.16), transparent)',
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-between p-5">
            <span className="font-mono text-[11px] tabular text-subtle">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <div className="h-2.5 w-2/3 rounded-full bg-line" />
              <div className="mt-2 h-2 w-1/2 rounded-full bg-line/70" />
              <span className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-primary/70">
                Por anunciar
              </span>
            </div>
          </div>
        </div>
      </CometCard>
    </motion.div>
  )
}

export function Speakers() {
  return (
    <section id="speakers" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHead
            eyebrow="Speakers"
            title="Quiénes vienen a hablar."
            lede="Perfiles de industria y academia, seleccionados por lo que hacen todos los días, no por su cargo. Los anuncios salen por tandas."
            className="flex-1"
          />
          <Btn href="#registro" variant="ghost" className="w-fit flex-none">
            Postular como ponente
            <ArrowUpRight className="h-4 w-4" />
          </Btn>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {speakers.length > 0
            ? speakers.map((sp, i) => (
                <motion.div
                  key={sp.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  data-reveal
                  viewport={VIEWPORT}
                  transition={{ duration: 0.55, ease: EASE, delay: i * 0.05 }}
                >
                  <CometCard rotateDepth={10} translateDepth={9}>
                    <Card className="group h-full overflow-hidden" data-cursor>
                      <div className="relative aspect-[4/5] overflow-hidden bg-ink-plate">
                        {sp.photo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={sp.photo}
                            alt={sp.name}
                            className="h-full w-full object-cover transition-transform duration-700 ease-cs group-hover:scale-105"
                          />
                        ) : null}
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink-raise via-ink-raise/70 to-transparent" />
                      </div>
                      <div className="relative -mt-14 flex flex-col gap-1.5 p-5">
                        {sp.track ? (
                          <Pill hex={trackByKey[sp.track].hex} className="w-fit">
                            {trackByKey[sp.track].name}
                          </Pill>
                        ) : null}
                        <h3 className="mt-1 font-display text-[0.9375rem] font-bold leading-snug tracking-[-0.01em]">
                          {sp.name}
                        </h3>
                        <p className="text-[0.8125rem] leading-snug text-muted-foreground">
                          {sp.role}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                          {sp.org}
                        </p>
                      </div>
                    </Card>
                  </CometCard>
                </motion.div>
              ))
            : Array.from({ length: speakerSlots }).map((_, i) => (
                <GhostSpeaker key={i} index={i} />
              ))}
        </div>

        <p className="mt-8 text-[0.875rem] text-subtle">
          ¿Tienes a alguien en mente que debería estar acá? Escríbenos a{' '}
          <a
            href={`mailto:${event.social.email}`}
            className="text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
          >
            {event.social.email}
          </a>
          .
        </p>
      </div>

      <div className="shell mt-24">
        <Equator label="SPEAKERS → SEDES" />
      </div>
    </section>
  )
}
