import { contests, speakers, week, type Slot, type Speaker, type TrackKey } from './content'

/* ============================================================
   THE SCHEDULE, DERIVED
   There is no separate timetable to keep in sync: every session
   comes from where its content already lives — a speaker's
   `slot` or a contest's. This module only collects them, so the
   live status, the speaker cards and the timetable agree.
   ============================================================ */

/** One talk: usually one speaker, sometimes two sharing a title. */
export type Talk = {
  key: string
  talk: string
  tracks: TrackKey[]
  people: Speaker[]
  slot?: Slot
}

/** Speakers that share a talk title become one talk; their topics are merged. */
function groupTalks(list: Speaker[]): Talk[] {
  const byTitle = new Map<string, Talk>()
  for (const s of list) {
    const found = byTitle.get(s.talk)
    if (found) {
      found.people.push(s)
      s.tracks.forEach((t) => found.tracks.includes(t) || found.tracks.push(t))
    } else {
      byTitle.set(s.talk, { key: s.name, talk: s.talk, tracks: [...s.tracks], people: [s], slot: s.slot })
    }
  }
  return Array.from(byTitle.values())
}

export const TALKS = groupTalks(speakers)

/** "Lesly Salas Cueva y Meybili T. Olivares" */
export const namesOf = (t: Talk) => t.people.map((p) => p.name).join(' y ')

/** Stable id for a talk's card, so the timetable can point at it. */
export const talkId = (t: Talk) =>
  `charla-${t.key
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`

export type Session = {
  day: number
  start?: string
  end?: string
  block: 'charlas' | 'concursos'
  /** Who or what is on, for "En vivo · …". */
  label: string
}

export const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export const SESSIONS: Session[] = [
  ...TALKS.filter((t) => t.slot).map((t) => ({ ...t.slot!, block: 'charlas' as const, label: namesOf(t) })),
  ...contests.map((c) => ({ ...c.slot, block: 'concursos' as const, label: c.name })),
]

/** The session running at `minutes` past midnight (Ecuador time) on `day`. */
export function sessionAt(day: number, minutes: number) {
  return SESSIONS.find(
    (s) =>
      s.day === day &&
      s.start !== undefined &&
      s.end !== undefined &&
      toMinutes(s.start) <= minutes &&
      minutes < toMinutes(s.end)
  )
}

/** Is this talk the session on air? */
export const isOnAir = (t: Talk, onAir?: Session | null) =>
  !!onAir && onAir.block === 'charlas' && t.slot?.day === onAir.day && t.slot?.start === onAir.start

export const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/** Month of each day of the week strip, carried forward from where it is written. */
export const MONTHS = week.days.reduce<string[]>((acc, d) => {
  acc.push('month' in d ? d.month.toLowerCase() : acc[acc.length - 1])
  return acc
}, [])

/** "Mié 30" */
export const dayLabel = (day: number) => `${week.days[day]?.weekday} ${week.days[day]?.day}`

/** "17:00–18:00", or nothing while the hours are unconfirmed. */
export const hoursLabel = (s: { start?: string; end?: string }) =>
  s.start && s.end ? `${s.start}–${s.end}` : ''
