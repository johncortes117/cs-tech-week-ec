'use client'

import { cn } from '@/lib/utils'
import { trackByKey, week, type TrackKey } from '@/lib/content'
import {
  MONTHS,
  TALKS,
  WEEKDAYS,
  isOnAir,
  namesOf,
  toMinutes,
  type Session,
  type Talk,
} from '@/lib/schedule'
import { LiveDot } from '@/components/ui/primitives'

/* ============================================================
   TIMETABLE — the programme read by the clock

   The same talks as the speaker cards, without faces: days
   across, hours down, each slot the talk and who gives it.

   One structure serves both sizes. On desktop it is a grid whose
   day columns are subgrids of the same rows, so a long title in
   one column grows the whole hour and every column stays aligned.
   On phones the grid switches off and the very same day blocks
   stack into an agenda — which is also why the week strip's
   #dia-N links land correctly at any width.

   A topic filter dims what does not match instead of removing
   it: holes in a timetable would read as free slots.
   ============================================================ */

const SCHEDULED = TALKS.filter((t) => t.slot)
const DAYS = Array.from(new Set(SCHEDULED.map((t) => t.slot!.day))).sort((a, b) => a - b)
const HOURS = Array.from(new Set(SCHEDULED.map((t) => t.slot!.start))).sort((a, b) => toMinutes(a) - toMinutes(b))
const at = (day: number, hour: string) => SCHEDULED.filter((t) => t.slot!.day === day && t.slot!.start === hour)

export function Timetable({
  filter,
  today,
  onAir,
  onPick,
}: {
  filter: TrackKey | 'all'
  today: number
  onAir?: Session | null
  onPick: (t: Talk) => void
}) {
  const rows = `1 / span ${HOURS.length + 1}`

  return (
    <div
      className="lg:grid lg:gap-x-3"
      style={{
        gridTemplateColumns: `3.5rem repeat(${DAYS.length}, minmax(0, 1fr))`,
        gridTemplateRows: `auto repeat(${HOURS.length}, auto)`,
      }}
    >
      {/* the hours, down the side (desktop) */}
      <div aria-hidden="true" className="hidden lg:grid lg:[grid-template-rows:subgrid]" style={{ gridRow: rows }}>
        <span />
        {HOURS.map((h) => (
          <span key={h} className="border-t border-line pt-3.5 font-mono text-[12px] font-medium tabular text-subtle">
            {h}
          </span>
        ))}
      </div>

      {DAYS.map((d) => (
        <section
          key={d}
          id={`dia-${d}`}
          aria-label={`${WEEKDAYS[d]} ${week.days[d]?.day} ${MONTHS[d]}`}
          className={cn(
            'mt-12 scroll-mt-28 first-of-type:mt-0 lg:mt-0 lg:grid lg:[grid-template-rows:subgrid]',
            today > d && 'opacity-45'
          )}
          style={{ gridRow: rows }}
        >
          <header className="flex items-end justify-between gap-3 border-b border-line pb-3 lg:block lg:border-b-0 lg:pb-4">
            <h3 className="font-display text-[1.5rem] font-black leading-none tracking-head lg:text-[1.2rem]">
              {WEEKDAYS[d]}{' '}
              <span className="text-subtle lg:mt-1.5 lg:block lg:font-mono lg:text-[11px] lg:font-medium lg:uppercase lg:tracking-label">
                {week.days[d]?.day} {MONTHS[d]}
              </span>
            </h3>
            {d === today ? (
              <span className="rounded-full bg-orange px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-night lg:mt-3 lg:inline-block">
                Hoy
              </span>
            ) : null}
          </header>

          {HOURS.map((h) => {
            const talks = at(d, h)
            if (!talks.length) {
              return <div key={h} aria-hidden="true" className="hidden border-t border-line lg:block" />
            }
            return (
              <div key={h} className="lg:border-t lg:border-line lg:py-2">
                {talks.map((t) => (
                  <Cell
                    key={t.key}
                    talk={t}
                    live={isOnAir(t, onAir)}
                    dim={filter !== 'all' && !t.tracks.includes(filter)}
                    onPick={() => onPick(t)}
                  />
                ))}
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}

function Cell({
  talk,
  live,
  dim,
  onPick,
}: {
  talk: Talk
  live: boolean
  dim: boolean
  onPick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={`${talk.slot?.start}, ${talk.talk}, ${namesOf(talk)}. Ver al speaker`}
      className={cn(
        'group grid w-full grid-cols-[3.25rem_minmax(0,1fr)] gap-3 border-b border-line py-4 text-left transition-opacity duration-300',
        'lg:flex lg:h-full lg:flex-col lg:rounded-[14px] lg:border lg:bg-surface lg:p-3.5',
        'lg:transition-[border-color,box-shadow,opacity] lg:hover:border-line-strong lg:hover:shadow-[0_16px_32px_-22px_rgba(5,15,28,0.4)]',
        live && 'lg:border-orange',
        dim && 'opacity-25'
      )}
    >
      <span className="pt-0.5 font-mono text-[12px] font-medium tabular text-subtle lg:hidden">{talk.slot?.start}</span>

      <span className="flex min-w-0 flex-col lg:h-full">
        {live ? (
          <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-orange px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-night">
            <LiveDot className="[&>span]:bg-night" />
            En vivo
          </span>
        ) : null}

        <span className="font-display text-[15px] font-extrabold leading-[1.25] tracking-[-0.01em] lg:line-clamp-6 lg:text-[13px]">
          {talk.talk}
        </span>
        <span className="mt-1.5 text-[12.5px] leading-snug text-muted lg:mt-auto lg:pt-3 lg:text-[11.5px]">
          {namesOf(talk)}
        </span>
        <span className="mt-2 flex gap-1" aria-hidden="true">
          {talk.tracks.map((k) => (
            <span key={k} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: trackByKey[k].hex }} />
          ))}
        </span>
      </span>
    </button>
  )
}
