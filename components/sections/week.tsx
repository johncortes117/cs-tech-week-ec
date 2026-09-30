'use client'

import { motion } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE, VIEWPORT, wrap } from '@/lib/motion'
import { week } from '@/lib/content'
import { SESSIONS } from '@/lib/schedule'
import { useEventStatus } from '@/lib/use-event-status'
import { LiveDot, SectionTitle } from '@/components/ui/primitives'
import { Ribbon } from '@/components/brand/ribbon'

/* ============================================================
   THE WEEK

   The whole structure of the event in one figure: seven days,
   and the two blocks as ribbons laid across the days they cover.
   It is the overview; the hour-by-hour programme is the speaker
   wall below, grouped by day — each day here links to its group.

   During the week it becomes a live chart: past days fade, today
   is marked, and a block on air says so.
   ============================================================ */

const BLOCK_STYLE: Record<string, { bg: string; ink: string }> = {
  charlas: { bg: 'hsl(var(--cyan))', ink: 'hsl(var(--night))' },
  /* every contest is orange; the hackathon and the weekend share a row */
  cloud: { bg: 'hsl(var(--orange))', ink: 'hsl(var(--night))' },
  concursos: { bg: 'hsl(var(--orange))', ink: 'hsl(var(--night))' },
}

/** Days with talks open their group on the speaker wall; the rest, the contests. */
const TALK_DAYS = new Set(SESSIONS.filter((s) => s.block === 'charlas').map((s) => s.day))
const dayHref = (i: number) => (TALK_DAYS.has(i) ? `#dia-${i}` : '#concursos')

export function Week() {
  const status = useEventStatus()
  const today = status?.phase === 'live' ? status.day : status?.phase === 'done' ? week.days.length : -1
  const onAir = status?.phase === 'live' ? status.onAir : null

  return (
    <section id="programa" data-tone="day" className="tone-day relative bg-bg pb-16 pt-24 text-fg md:pb-20 md:pt-32">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle>La semana</SectionTitle>
          <p className="meta">Hora de Ecuador · UTC−5</p>
        </div>

        {/* ---------- desktop: days across, ribbons beneath ---------- */}
        <div className="relative mt-16 hidden md:block">
          <ol className="grid grid-cols-7 border-y border-line">
            {week.days.map((d, i) => (
              <li
                key={d.day}
                className={cn(
                  'relative border-l border-line transition-opacity duration-700 first:border-l-0',
                  i < today && 'opacity-35'
                )}
              >
                {i === today ? (
                  <motion.span
                    layoutId="week-today"
                    className="absolute inset-x-0 -top-px h-[3px] bg-orange"
                  />
                ) : null}
                <a
                  href={dayHref(i)}
                  aria-label={`${d.weekday} ${d.day}: ver el programa del día`}
                  className="group block px-4 pb-7 pt-5 transition-colors duration-300 hover:bg-fg/[0.035]"
                >
                  <span className="flex items-center justify-between">
                    <span className="meta">{d.weekday}</span>
                    {i === today ? (
                      <span className="meta text-fg">Hoy</span>
                    ) : (
                      <ArrowDown
                        aria-hidden="true"
                        className="h-3.5 w-3.5 -translate-y-1 text-subtle opacity-0 transition-all duration-300 ease-cs group-hover:translate-y-0 group-hover:opacity-100"
                      />
                    )}
                  </span>
                  <span className="mt-3 block font-display text-[clamp(2.6rem,4.6vw,4.2rem)] font-black leading-none tracking-display tabular">
                    {d.day}
                  </span>
                  <span className="meta mt-2 block h-4">{'month' in d ? d.month : ''}</span>
                </a>
              </li>
            ))}
          </ol>

          <div className="mt-6 grid grid-cols-7 gap-y-3">
            {week.blocks.map((b, i) => {
              const style = BLOCK_STYLE[b.key]
              /* a contest session lights the ribbon laid over its own day */
              const live =
                !!onAir &&
                (b.key === 'charlas'
                  ? onAir.block === 'charlas'
                  : onAir.block === 'concursos' && onAir.day >= b.from && onAir.day <= b.to)
              const narrow = b.from === b.to
              return (
                <motion.div
                  key={b.key}
                  className="origin-left"
                  style={{ gridColumn: `${b.from + 1} / ${b.to + 2}` }}
                  variants={wrap}
                  custom={i}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  data-reveal
                >
                  <Ribbon
                    className="flex w-full justify-between py-4 text-[13px] lg:text-[15px]"
                    style={{ backgroundColor: style.bg, color: style.ink, ['--tip' as string]: '1.35em' }}
                  >
                    <span className="flex items-center gap-2.5">
                      {live ? <LiveDot className="[&>span]:bg-night" /> : null}
                      {b.name}
                      {live ? <span className="font-mono text-[11px] font-medium tracking-[0.1em]">En vivo</span> : null}
                    </span>
                    {/* a one-day ribbon only has room for its hours on wide screens */}
                    <span
                      className={cn(
                        'font-mono text-[11px] font-medium normal-case tracking-[0.06em] opacity-80 lg:text-[12px]',
                        narrow && 'hidden xl:inline'
                      )}
                    >
                      {b.detail}
                    </span>
                  </Ribbon>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ---------- phones: days down, ribbons as vertical bands ---------- */}
        <div className="mt-12 md:hidden">
          <ul className="flex flex-col gap-2.5">
            {week.blocks.map((b) => (
              <li key={b.key} className="flex items-center gap-3">
                <span className="h-3 w-6 flex-none" style={{ backgroundColor: BLOCK_STYLE[b.key].bg }} />
                <span className="font-display text-[15px] font-extrabold">{b.name}</span>
                <span className="font-mono text-[11px] text-muted">{b.detail}</span>
              </li>
            ))}
          </ul>

          <ol
            className="mt-8 grid gap-x-2 border-t border-line"
            style={{
              gridTemplateColumns: `1fr repeat(${week.blocks.length}, 18px)`,
              gridTemplateRows: `repeat(${week.days.length}, auto)`,
            }}
          >
            {week.days.map((d, i) => (
              <li
                key={d.day}
                className={cn('col-start-1 border-b border-line', i < today && 'opacity-35')}
                style={{ gridRow: i + 1 }}
              >
                <a href={dayHref(i)} className="flex items-baseline gap-4 py-3.5">
                  <span className="meta w-9">{d.weekday}</span>
                  <span className="font-display text-[1.9rem] font-black leading-none tracking-display tabular">
                    {d.day}
                  </span>
                  <span className="meta">{'month' in d ? d.month : ''}</span>
                  {i === today ? (
                    <span className="meta ml-auto mr-2 text-fg">Hoy</span>
                  ) : (
                    <ArrowDown aria-hidden="true" className="ml-auto mr-2 h-3.5 w-3.5 self-center text-subtle" />
                  )}
                </a>
              </li>
            ))}
            {week.blocks.map((b, i) => (
              <motion.span
                key={b.key}
                aria-hidden="true"
                className="my-2 origin-top"
                style={{
                  gridColumn: i + 2,
                  gridRow: `${b.from + 1} / ${b.to + 2}`,
                  backgroundColor: BLOCK_STYLE[b.key].bg,
                  clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 9px), 50% 100%, 0 calc(100% - 9px))',
                }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: 1.1, ease: EASE, delay: 0.1 + i * 0.18 }}
                data-reveal
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
