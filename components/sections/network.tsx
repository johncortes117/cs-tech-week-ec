'use client'

import { motion } from 'motion/react'
import { Building2, MapPin, Video } from 'lucide-react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { chapters, chapterSlots, globeCities, modalityLabels, venues } from '@/lib/content'
import { Card, Equator, Pill, SectionHead, Tbd } from '@/components/ui/primitives'
import { Globe } from '@/components/ui/globe'
import { GlareHover } from '@/components/ui/glare-hover'

/* ============================================================
   VENUES
   The globe is the centrepiece of the section and the only thing
   on the site you can grab: it drags and spins. The idea comes
   from Aceternity UI's "3D Globe", but built on `cobe` (~5 kB)
   instead of three.js — see components/ui/globe.tsx.

   It starts framed on Ecuador, with the equatorial line crossing
   the sphere through the middle. It is not a generic globe
   ornament: it is the brand concept drawn at planet scale.

   The dots are cities of the country, NOT confirmed venues, and
   the caption says so in as many words.
   ============================================================ */

/* Stable reference: if the array were built during render, the
   globe would be destroyed and recreated on every pass.

   No arcs on purpose: cobe supports them, but between cities two
   degrees apart they are invisible — they only muddy the spot. */
const GLOBE_MARKERS = globeCities.map((c) => ({ location: c.location, size: c.size ?? 0.03 }))

function CityLegend() {
  return (
    <ul className="flex flex-wrap gap-2">
      {globeCities.map((c, i) => (
        <motion.li
          key={c.name}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          data-reveal
          viewport={VIEWPORT}
          transition={{ duration: 0.45, ease: EASE, delay: 0.3 + i * 0.045 }}
          className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-ink-raise/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground backdrop-blur-sm"
        >
          <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
          {c.name}
        </motion.li>
      ))}
    </ul>
  )
}

export function Venues() {
  return (
    <section id="sedes" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Sedes"
          title={
            <>
              Vive CS Tech Week desde <span className="grad-text">cualquier punto</span> del país.
            </>
          }
          lede="La idea es simple: sedes presenciales donde haya capítulo anfitrión, y transmisión para el resto del Ecuador. Nadie se queda fuera por vivir lejos."
        />

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[1fr_0.95fr] lg:gap-16">
          {/* ---------- the globe ---------- */}
          <div className="relative mx-auto w-full max-w-[520px]">
            {/* glow beneath the sphere: it separates it from the black */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-12%] -z-10"
              style={{
                background:
                  'radial-gradient(50% 50% at 50% 50%, hsl(var(--deep) / 0.28), transparent 70%)',
              }}
            />
            <Globe markers={GLOBE_MARKERS} />

            <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
              Arrástralo para girar
            </p>
          </div>

          {/* ---------- reading the globe ---------- */}
          <div className="flex flex-col gap-7">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              data-reveal
              viewport={VIEWPORT}
              transition={{ duration: 0.6, ease: EASE }}
              className="max-w-[46ch] text-[1.0625rem] leading-relaxed text-muted-foreground"
            >
              Ecuador es uno de los pocos países que el paralelo cero atraviesa por completo. Esa
              línea —la misma que separa cada sección de este sitio— es el punto de partida de la
              identidad del evento.
            </motion.p>

            <div className="flex flex-col gap-3">
              <span className="label">Ciudades marcadas</span>
              <CityLegend />
              <p className="mt-1 max-w-[44ch] text-[0.8125rem] leading-relaxed text-subtle">
                Los puntos del globo son ciudades del país, no sedes confirmadas. El mapa real de
                sedes se publica junto con la agenda.
              </p>
            </div>
          </div>
        </div>

        {venues.length > 0 ? (
          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((v, i) => (
              <motion.div
                key={v.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                data-reveal
                viewport={VIEWPORT}
                transition={{ duration: 0.55, ease: EASE, delay: i * 0.06 }}
              >
                <GlareHover className="h-full rounded-card">
                  <Card className="h-full p-6" data-cursor>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      <span className="label">{v.city}</span>
                    </div>
                    <h3 className="mt-3 font-display text-[1.0625rem] font-bold leading-snug tracking-[-0.01em]">
                      {v.name}
                    </h3>
                    <p className="mt-1 text-[0.875rem] text-muted-foreground">{v.chapter}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Pill className="border-line text-muted-foreground">
                        {v.modality === 'virtual' ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <Building2 className="h-3 w-3" />
                        )}
                        {modalityLabels[v.modality]}
                      </Pill>
                      {v.capacity ? (
                        <Pill className="border-line text-muted-foreground">{v.capacity}</Pill>
                      ) : null}
                    </div>
                  </Card>
                </GlareHover>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card interactive={false} className="mt-16 p-8 text-center md:p-10">
            <p className="mx-auto max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
              El mapa de sedes se publica junto con la agenda.{' '}
              <Tbd>Número de sedes por confirmar</Tbd> — depende de cuántos capítulos se sumen
              como anfitriones.
            </p>
          </Card>
        )}
      </div>

      <div className="shell mt-24">
        <Equator label="SEDES → SPONSORS" />
      </div>
    </section>
  )
}

/* ============================================================
   ORGANISING CHAPTERS
   The brand guide requires the chapter's full name, with no
   acronyms and with "IEEE COMPUTER SOCIETY" in capitals.
   ============================================================ */

export function Chapters() {
  const items = chapters.length > 0 ? chapters : Array.from({ length: chapterSlots }, () => null)

  return (
    <section id="capitulos" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Quiénes organizan"
          title="Varios capítulos, un solo frente."
          lede="CS Tech Week Ecuador no es de un capítulo: es de todos los que decidieron juntar agenda, contactos y equipo en la misma semana."
          align="center"
        />

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              data-reveal
              viewport={VIEWPORT}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
              className="group relative flex min-h-[128px] flex-col justify-center gap-2 overflow-hidden bg-ink-raise p-6 transition-colors duration-500 ease-cs hover:bg-ink-plate"
              data-cursor
            >
              {/* halo that follows the cursor inside the cell */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-cs group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(110% 90% at 50% 0%, hsl(var(--orange) / 0.09), transparent 65%)',
                }}
              />
              <span className="relative font-mono text-[10px] tabular text-subtle">
                {String(i + 1).padStart(2, '0')}
              </span>
              {c ? (
                <>
                  <span className="relative font-display text-[0.9375rem] font-bold leading-snug tracking-[-0.01em]">
                    {c.name}
                  </span>
                  <span className="label relative">{c.city}</span>
                </>
              ) : (
                <>
                  <span className="relative h-2.5 w-3/4 rounded-full bg-line" />
                  <span className="relative h-2 w-1/3 rounded-full bg-line/70" />
                  <span className="relative mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/60">
                    Por confirmar
                  </span>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
