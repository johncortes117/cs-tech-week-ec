'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import NumberFlow from '@number-flow/react'
import { cn } from '@/lib/utils'
import { EASE, SPRING_SNAP, VIEWPORT } from '@/lib/motion'
import { event, passes, passesNote, type Pass } from '@/lib/content'
import { Btn, SectionTitle } from '@/components/ui/primitives'

/* ============================================================
   PASSES

   Three passes, one switch. The level of each pass is drawn with
   the screw base of the logo's bulb — one, two, three threads —
   and the free pass is the only card at night: it is the one
   most people will take, so it is the one that stands out.
   ============================================================ */

type Rate = 'member' | 'general'

export function Tickets() {
  const [rate, setRate] = React.useState<Rate>('member')

  return (
    <section id="entradas" data-tone="day" className="tone-day relative bg-bg py-24 text-fg md:py-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionTitle>Tu entrada</SectionTitle>
          <RateSwitch value={rate} onChange={setRate} />
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3 md:gap-5">
          {passes.map((p, i) => (
            <PassCard key={p.key} pass={p} level={i + 1} rate={rate} featured={i === 0} index={i} />
          ))}
        </div>

        <p className="mt-8 max-w-[60ch] text-[0.875rem] leading-relaxed text-subtle">{passesNote}</p>
      </div>
    </section>
  )
}

function RateSwitch({ value, onChange }: { value: Rate; onChange: (r: Rate) => void }) {
  const options: { key: Rate; label: string }[] = [
    { key: 'member', label: 'Miembro IEEE' },
    { key: 'general', label: 'Público general' },
  ]
  return (
    <div role="radiogroup" aria-label="Tarifa" className="inline-flex rounded-full border border-line-strong p-1">
      {options.map((o) => {
        const active = value === o.key
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.key)}
            className={cn(
              'relative h-10 rounded-full px-4 font-display text-[13px] font-bold transition-colors duration-300 sm:px-5',
              active ? 'text-bg' : 'text-muted hover:text-fg'
            )}
          >
            {active ? (
              <motion.span layoutId="rate" transition={SPRING_SNAP} className="absolute inset-0 rounded-full bg-fg" />
            ) : null}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/** The bulb's screw base as a level meter. */
function Threads({ level }: { level: number }) {
  return (
    <span className="flex flex-col gap-[3px]" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={cn('h-[5px] w-8 rounded-full', n <= level ? 'bg-orange' : 'bg-fg/10')}
          style={{ marginLeft: `${(n - 1) * 1.5}px` }}
        />
      ))}
    </span>
  )
}

function PassCard({
  pass,
  level,
  rate,
  featured,
  index,
}: {
  pass: Pass
  level: number
  rate: Rate
  featured: boolean
  index: number
}) {
  const price = pass.price[rate]
  const free = pass.price.member === 0 && pass.price.general === 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.85, ease: EASE, delay: index * 0.1 }}
      className={cn(
        'relative flex flex-col rounded-[26px] border p-7 md:rounded-[30px] md:p-8',
        featured ? 'tone-night border-transparent bg-bg text-fg' : 'border-line bg-surface'
      )}
      data-reveal
    >
      <Threads level={level} />

      <h3 className="mt-8 font-display text-[1.6rem] font-black leading-none tracking-head">{pass.name}</h3>

      <div className="mt-6 flex h-[4.2rem] items-end gap-2 border-b border-line pb-5">
        {free ? (
          <span className="font-display text-[3.4rem] font-black leading-[0.8] tracking-display">Gratis</span>
        ) : (
          <>
            <NumberFlow
              value={price}
              format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
              className="font-display text-[3.4rem] font-black leading-[0.8] tracking-display tabular"
            />
            <span className="meta pb-1">{rate === 'member' ? 'IEEE' : 'General'}</span>
          </>
        )}
      </div>

      <ul className="mt-5 space-y-2 text-[0.9375rem] text-muted">
        {pass.includes.map((line) => (
          <li key={line} className="flex gap-3">
            <span className="mt-[0.6em] h-px w-3 flex-none bg-current opacity-60" aria-hidden="true" />
            {line}
          </li>
        ))}
      </ul>

      <Btn
        href={event.registerUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant={featured ? 'primary' : 'ghost'}
        arrow="next"
        className="mt-10 w-full"
      >
        Inscribirme
      </Btn>
    </motion.article>
  )
}
