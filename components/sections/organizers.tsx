'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { EASE, VIEWPORT } from '@/lib/motion'
import { chapters, cities, type CityName } from '@/lib/content'
import { GEO, project } from '@/lib/geo'
import { SectionTitle } from '@/components/ui/primitives'

/* ============================================================
   ORGANISERS

   "Latitud cero" stops being a metaphor here. The country is
   drawn from real coordinates, latitude zero crosses it where it
   really does, and the eleven chapters sit on their cities.

   The list beside the map is sorted by latitude, north to south,
   so the equator lands between Ibarra and Quito on its own — the
   list is the map, read as text.
   ============================================================ */

const EQUATOR = project(-80, 0).y
const MITAD_DEL_MUNDO = project(-78.4558, 0)

/** Which side of each dot the city name goes on, so neighbours never collide. */
const LABEL_SIDE: Record<CityName, 'left' | 'right'> = {
  Tulcán: 'right',
  Urcuquí: 'left',
  Ibarra: 'right',
  Quito: 'left',
  Riobamba: 'right',
  Guayaquil: 'right',
  Cuenca: 'right',
}

function latLabel(lat: number) {
  const a = Math.abs(lat)
  const deg = Math.floor(a)
  const min = Math.round((a - deg) * 60)
  return `${deg}°${String(min).padStart(2, '0')}′${lat >= 0 ? 'N' : 'S'}`
}

const byCity = (name: CityName) => chapters.filter((c) => c.city === name)
const NORTH = cities.filter((c) => c.lat > 0)
const SOUTH = cities.filter((c) => c.lat <= 0)

export function Organizers() {
  const [active, setActive] = React.useState<CityName>('Quito')
  const activeCity = cities.find((c) => c.name === active)!

  return (
    <section id="organizan" data-tone="night" className="tone-night relative overflow-hidden bg-bg py-24 text-fg md:py-32">
      <div className="shell grid items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        {/* ---------- the list ---------- */}
        <div className="lg:pt-4">
          <SectionTitle>A ambos lados de la línea</SectionTitle>
          <p className="meta mt-6">
            {chapters.length} capítulos · {cities.length} ciudades
          </p>

          <ol className="mt-10 border-t border-line">
            {NORTH.map((c) => (
              <CityRow key={c.name} city={c} active={active === c.name} onSelect={setActive} />
            ))}
            <li aria-hidden="true" className="flex items-center gap-3 border-b border-line py-3">
              <span className="w-[4.6rem] flex-none font-mono text-[11px] tracking-[0.1em] text-orange">0°00′00″</span>
              <motion.span
                className="h-px flex-1 origin-left bg-orange"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
                data-reveal
              />
              <span className="font-mono text-[11px] tracking-[0.1em] text-orange">Mitad del Mundo</span>
            </li>
            {SOUTH.map((c) => (
              <CityRow key={c.name} city={c} active={active === c.name} onSelect={setActive} />
            ))}
          </ol>
        </div>

        {/* ---------- the map ---------- */}
        <div className="relative">
          <EcuadorMap active={active} onSelect={setActive} />

          {/* the chapters of the selected city, in their own logos */}
          <div className="mt-8 min-h-[176px] lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:w-[40%]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <p className="meta">
                  <span className="text-fg">{active}</span> · {latLabel(activeCity.lat)}
                </p>
                <ul className="mt-5 flex flex-col gap-4">
                  {byCity(active).map((ch) => (
                    <li key={ch.short}>
                      <a
                        href={ch.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${ch.fullName} en Instagram`}
                        className="block w-fit opacity-80 transition-opacity duration-300 hover:opacity-100"
                      >
                        {ch.logo ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={ch.logo}
                            alt={ch.fullName}
                            loading="lazy"
                            className="h-10 w-auto max-w-[260px] object-contain object-left"
                          />
                        ) : (
                          <span className="flex items-center gap-4">
                            <span className="font-display text-[2.5rem] font-extrabold leading-none tracking-[-0.04em] text-fg">
                              {ch.short}
                            </span>
                            {ch.lead ? (
                              <span className="flex flex-col gap-1 border-l border-line pl-4">
                                <span className="font-display text-[15px] font-bold leading-tight text-fg">
                                  {ch.lead.name}
                                </span>
                                <span className="meta">{ch.lead.role}</span>
                              </span>
                            ) : null}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

function CityRow({
  city,
  active,
  onSelect,
}: {
  city: (typeof cities)[number]
  active: boolean
  onSelect: (c: CityName) => void
}) {
  return (
    <li
      onMouseEnter={() => onSelect(city.name)}
      className="flex items-baseline gap-3 border-b border-line py-3.5"
    >
      <span className={cn('meta w-[4.6rem] flex-none tabular transition-colors', active && 'text-cyan')}>
        {latLabel(city.lat)}
      </span>
      <button
        type="button"
        onClick={() => onSelect(city.name)}
        onFocus={() => onSelect(city.name)}
        aria-pressed={active}
        className={cn(
          'text-left font-display text-[1.125rem] font-extrabold tracking-[-0.02em] transition-colors duration-300',
          active ? 'text-fg' : 'text-muted hover:text-fg'
        )}
      >
        {city.name}
      </button>
      <span className="ml-auto flex flex-wrap justify-end gap-x-3 gap-y-1">
        {byCity(city.name).map((ch) => (
          <a
            key={ch.short}
            href={ch.instagram}
            target="_blank"
            rel="noopener noreferrer"
            title={`${ch.fullName} en Instagram`}
            className="font-display text-[13px] font-semibold text-subtle transition-colors hover:text-fg"
          >
            {ch.short}
          </a>
        ))}
      </span>
    </li>
  )
}

function EcuadorMap({ active, onSelect }: { active: CityName; onSelect: (c: CityName) => void }) {
  const g = GEO.galapagosBox
  const parallels = [1, -1, -2, -3, -4]

  return (
    <div className="relative w-full" style={{ aspectRatio: `${GEO.width} / ${GEO.height}` }}>
      <svg viewBox={`0 0 ${GEO.width} ${GEO.height}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
        {/* graticule */}
        {parallels.map((lat) => {
          const y = project(-80, lat).y
          return (
            <g key={lat}>
              <line x1={0} x2={GEO.width} y1={y} y2={y} stroke="hsl(var(--fg) / 0.07)" strokeDasharray="2 6" />
              {/* labels sit just outside the frame, clear of the coastline */}
              <text x={GEO.width + 12} y={y + 4} className="fill-subtle font-mono text-[13px] max-md:hidden">
                {Math.abs(lat)}°{lat > 0 ? 'N' : 'S'}
              </text>
            </g>
          )
        })}

        {/* Galápagos, as an inset */}
        <rect
          x={g.x - 22}
          y={g.y - 22}
          width={g.x2 - g.x + 44}
          height={g.y2 - g.y + 44}
          rx={14}
          fill="none"
          stroke="hsl(var(--fg) / 0.12)"
          strokeDasharray="3 5"
        />
        <text x={g.x - 22} y={g.y2 + 52} className="fill-subtle font-mono text-[13px] uppercase tracking-[0.14em] max-md:text-[24px]">
          Galápagos
        </text>
        <motion.path
          d={GEO.galapagos}
          fill="hsl(var(--fg) / 0.06)"
          stroke="hsl(var(--fg) / 0.4)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, delay: 0.9 }}
        />

        {/* the mainland: traced first, then filled */}
        <motion.path
          d={GEO.mainland}
          fill="hsl(var(--fg) / 0.055)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1, delay: 1.2 }}
          data-reveal
        />
        <motion.path
          d={GEO.mainland}
          fill="none"
          stroke="hsl(var(--fg) / 0.5)"
          strokeWidth={1.2}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 2, ease: EASE }}
          data-reveal
        />

        {/* latitude zero */}
        <motion.line
          x1={0}
          x2={GEO.width}
          y1={EQUATOR}
          y2={EQUATOR}
          stroke="hsl(var(--orange))"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
          data-reveal
        />
        <text x={GEO.width + 12} y={EQUATOR + 4} className="fill-orange font-mono text-[13px] max-md:hidden">
          0°
        </text>
        {/* the monument itself, a tick on the line */}
        <line
          x1={MITAD_DEL_MUNDO.x}
          x2={MITAD_DEL_MUNDO.x}
          y1={EQUATOR - 7}
          y2={EQUATOR + 7}
          stroke="hsl(var(--orange))"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* cities: real buttons, so the map works with a keyboard too */}
      {cities.map((c, i) => {
        const p = project(c.lon, c.lat)
        const on = active === c.name
        const side = LABEL_SIDE[c.name]
        return (
          <motion.button
            key={c.name}
            type="button"
            onMouseEnter={() => onSelect(c.name)}
            onFocus={() => onSelect(c.name)}
            onClick={() => onSelect(c.name)}
            aria-label={`${c.name}: ${byCity(c.name).map((ch) => ch.short).join(', ')}`}
            aria-pressed={on}
            className="group absolute p-2"
            /* centring goes through Motion: a Tailwind translate would be
               overwritten by the scale it animates */
            style={{ left: `${(p.x / GEO.width) * 100}%`, top: `${(p.y / GEO.height) * 100}%`, x: '-50%', y: '-50%' }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.6, ease: EASE, delay: 1.1 + i * 0.08 }}
            data-reveal
          >
            <span className="relative block h-2.5 w-2.5">
              {on ? (
                <motion.span
                  layoutId="city-ring"
                  className="absolute -inset-2 rounded-full border border-cyan"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              ) : null}
              <span
                className={cn(
                  'absolute inset-0 rounded-full transition-colors duration-300',
                  on ? 'bg-cyan' : 'bg-fg/60 group-hover:bg-fg'
                )}
              />
            </span>
            <span
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[12px] font-bold transition-colors duration-300 md:text-[13px]',
                side === 'right' ? 'left-full ml-1' : 'right-full mr-1',
                on ? 'text-fg' : 'text-subtle'
              )}
            >
              {c.name}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
