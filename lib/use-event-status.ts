'use client'

import { useSyncExternalStore } from 'react'
import { event, week } from '@/lib/content'
import { joinableAt, sessionAt, toMinutes, type Session } from '@/lib/schedule'

/* ============================================================
   EVENT STATUS

   The site changes its own voice as the week happens: a
   countdown before the talks open, "Día 3 de 7" during the week,
   "En vivo · <who>" while a session is on air, and silence
   afterwards.
   Nobody has to redeploy for any of it.

   One clock for the whole page: a single interval shared by
   every component that asks, through useSyncExternalStore. On
   the server — and during hydration — there is no "now", so the
   status is `null` and components render their neutral state;
   the real value arrives on the first client tick.
   ============================================================ */

let now: number | null = null
let timer: number | undefined
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  if (timer === undefined) {
    now = Date.now()
    timer = window.setInterval(() => {
      now = Date.now()
      listeners.forEach((l) => l())
    }, 1000)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.clearInterval(timer)
      timer = undefined
    }
  }
}

const getSnapshot = () => now
const getServerSnapshot = () => null

const START = Date.parse(event.startsAt)
const END = Date.parse(event.endsAt)
const FIRST_DAY = Date.parse(week.firstDay)
const DAY = 86_400_000
/** Ecuador has no daylight saving: UTC−5 all year. */
const ECT_OFFSET = -5 * 3_600_000

export type EventStatus =
  | {
      phase: 'soon'
      days: number
      hours: number
      minutes: number
      seconds: number
    }
  | {
      phase: 'live'
      /** 0 = Monday 28 */
      day: number
      /** The session on air right now, if any. */
      onAir: Session | null
    }
  | { phase: 'done' }

export function statusAt(t: number): EventStatus {
  if (t < START) {
    const s = Math.floor((START - t) / 1000)
    return {
      phase: 'soon',
      days: Math.floor(s / 86_400),
      hours: Math.floor((s % 86_400) / 3_600),
      minutes: Math.floor((s % 3_600) / 60),
      seconds: s % 60,
    }
  }
  if (t >= END) return { phase: 'done' }

  const day = Math.floor((t - FIRST_DAY) / DAY)
  const clock = new Date(t + ECT_OFFSET)
  const minutes = clock.getUTCHours() * 60 + clock.getUTCMinutes()
  return { phase: 'live', day, onAir: sessionAt(day, minutes) ?? null }
}

export function useEventStatus(): EventStatus | null {
  const t = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return t === null ? null : statusAt(t)
}

export const pad = (n: number) => String(n).padStart(2, '0')

/** "2d 04:31:09" — or "04:31:09" on the last day. */
export function countdownLabel(s: Extract<EventStatus, { phase: 'soon' }>) {
  const clock = `${pad(s.hours)}:${pad(s.minutes)}:${pad(s.seconds)}`
  return s.days > 0 ? `${s.days}d ${clock}` : clock
}

/* ------------------------------------------------------------
   THE ROOM TO JOIN
   Independent of the phase: on Monday the first room opens at
   16:45, while the countdown to 17:00 is still running.
   ------------------------------------------------------------ */

export type Joinable = { session: Session; live: boolean }

export function joinableFor(t: number): Joinable | null {
  if (t < FIRST_DAY || t >= END) return null
  const day = Math.floor((t - FIRST_DAY) / DAY)
  const clock = new Date(t + ECT_OFFSET)
  const minutes = clock.getUTCHours() * 60 + clock.getUTCMinutes()
  const session = joinableAt(day, minutes)
  if (!session?.start) return null
  return { session, live: minutes >= toMinutes(session.start) }
}

/** The talk whose Zoom room is open right now, if it has a link. */
export function useJoinable(): Joinable | null {
  const t = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return t === null ? null : joinableFor(t)
}
