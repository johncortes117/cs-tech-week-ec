'use client'

import * as React from 'react'
import { AnimatePresence, LayoutGroup, motion, useSpring } from 'motion/react'
import { CalendarDays, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE, SPRING_SNAP } from '@/lib/motion'
import { speakers, trackByKey, tracks, week, type Slot, type Speaker, type TrackKey } from '@/lib/content'
import { MONTHS, TALKS, WEEKDAYS, isOnAir, namesOf, talkId, toMinutes, type Talk } from '@/lib/schedule'
import { useEventStatus, useJoinable } from '@/lib/use-event-status'
import { JoinLink, LiveDot, SectionTitle } from '@/components/ui/primitives'
import { scrollToHash } from '@/components/ui/smooth-scroll'
import { Timetable } from './timetable'

/* ============================================================
   SPEAKERS — the programme, two ways

   Speakers and schedule are the same information, so they live
   in one section with a switch between two readings of it:

   · Speakers  (default) a card per talk, grouped by day. Front:
               who — portrait, hour, degree, name, position,
               institution. Back: what — the talk, set large.
   · Horario   the timetable: days across, hours down, the talk
               and the speaker in each slot, no faces
               (./timetable.tsx).

   Only one is on screen at a time, so nothing is said twice.
   Picking a talk in the timetable switches back to the cards and
   brings that speaker into view.
   ============================================================ */

type Mode = 'cards' | 'calendar'

const COUNTS = Object.fromEntries(
  tracks.map((t) => [t.key, TALKS.filter((x) => x.tracks.includes(t.key)).length])
) as Record<TrackKey, number>

const byStart = (a: Talk, b: Talk) =>
  toMinutes(a.slot?.start ?? '99:99') - toMinutes(b.slot?.start ?? '99:99')

/** Day index → talks, in schedule order. Talks without a slot go last (-1). */
function byDay(list: Talk[]) {
  const days = new Map<number, Talk[]>()
  for (const t of list) {
    const d = t.slot?.day ?? -1
    days.set(d, [...(days.get(d) ?? []), t])
  }
  return Array.from(days.entries())
    .sort(([a], [b]) => (a === -1 ? 1 : b === -1 ? -1 : a - b))
    .map(([day, talks]) => ({ day, talks: talks.sort(byStart) }))
}

export function Speakers() {
  const [mode, setMode] = React.useState<Mode>('cards')
  const [filter, setFilter] = React.useState<TrackKey | 'all'>('all')
  const [flipped, setFlipped] = React.useState<string | null>(null)
  const [focus, setFocus] = React.useState<string | null>(null)
  const visible = filter === 'all' ? TALKS : TALKS.filter((t) => t.tracks.includes(filter))

  const status = useEventStatus()
  const today = status?.phase === 'live' ? status.day : -1
  const onAir = status?.phase === 'live' ? status.onAir : null
  const room = useJoinable()

  const choose = (key: TrackKey | 'all') => {
    setFilter(key)
    setFlipped(null)
  }

  /* timetable → cards: switch, then bring the card into view and ring it */
  const pick = (t: Talk) => {
    setFlipped(null)
    setFilter('all')
    setFocus(talkId(t))
    setMode('cards')
  }
  React.useEffect(() => {
    if (mode !== 'cards' || !focus) return
    const scroll = window.setTimeout(() => scrollToHash(`#${focus}`), 420)
    const clear = window.setTimeout(() => setFocus(null), 3200)
    return () => {
      window.clearTimeout(scroll)
      window.clearTimeout(clear)
    }
  }, [mode, focus])

  return (
    <section id="speakers" data-tone="day" className="tone-day relative bg-bg pb-32 text-fg md:pb-44">
      <div className="shell">
        <div className="border-t border-line pt-20 md:pt-24">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <div className="flex items-start gap-4">
              <SectionTitle>Quiénes hablan</SectionTitle>
              <span className="mt-2 font-mono text-[12px] font-medium tabular text-subtle">
                {String(speakers.length).padStart(2, '0')}
              </span>
            </div>
            <ViewSwitch value={mode} onChange={setMode} />
          </div>

          <LayoutGroup id="speaker-filter">
            <div role="group" aria-label="Filtrar por temática" className="mt-8 flex flex-wrap gap-1.5">
              <Chip active={filter === 'all'} onClick={() => choose('all')}>
                Todas
              </Chip>
              {tracks.map((t) =>
                COUNTS[t.key] ? (
                  <Chip key={t.key} active={filter === t.key} onClick={() => choose(t.key)} dot={t.hex}>
                    {t.name}
                    <span className="tabular opacity-50">{COUNTS[t.key]}</span>
                  </Chip>
                ) : null
              )}
            </div>
          </LayoutGroup>

          <p className="meta mt-6">
            {mode === 'cards' ? 'Toca una tarjeta para ver de qué habla' : 'Hora de Ecuador · toca una charla para ver al speaker'}
          </p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mt-10"
          >
            {mode === 'cards' ? (
              byDay(visible).map(({ day, talks }) => (
                <div key={day} id={day >= 0 ? `dia-${day}` : 'por-programar'} className="mt-14 scroll-mt-28 first:mt-0">
                  <DayHeader day={day} talks={talks} today={day === today} />
                  <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {talks.map((t, i) => (
                        <Card
                          key={t.key}
                          talk={t}
                          index={i}
                          live={isOnAir(t, onAir)}
                          open={!!room && room.session.day === t.slot?.day && room.session.start === t.slot?.start}
                          focused={focus === talkId(t)}
                          flipped={flipped === t.key}
                          onFlip={() => setFlipped((k) => (k === t.key ? null : t.key))}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              ))
            ) : (
              <Timetable filter={filter} today={today} onAir={onAir} room={room?.session} onPick={pick} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

/* ============================================================
   VIEW SWITCH
   ============================================================ */

function ViewSwitch({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const options = [
    { key: 'cards' as const, label: 'Speakers', Icon: LayoutGrid },
    { key: 'calendar' as const, label: 'Horario', Icon: CalendarDays },
  ]
  return (
    <div role="radiogroup" aria-label="Vista" className="inline-flex rounded-full border border-line-strong p-1">
      {options.map(({ key, label, Icon }) => {
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(key)}
            className={cn(
              'relative inline-flex h-10 items-center gap-2 rounded-full px-4 font-display text-[13px] font-bold transition-colors duration-300 sm:px-5',
              active ? 'text-bg' : 'text-muted hover:text-fg'
            )}
          >
            {active ? (
              <motion.span layoutId="speaker-view" transition={SPRING_SNAP} className="absolute inset-0 rounded-full bg-fg" />
            ) : null}
            <Icon className="relative h-4 w-4" aria-hidden="true" />
            <span className="relative">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ============================================================
   DAY HEADER
   ============================================================ */

function DayHeader({ day, talks, today }: { day: number; talks: Talk[]; today: boolean }) {
  const starts = talks.map((t) => t.slot?.start).filter(Boolean) as string[]
  const ends = talks.map((t) => t.slot?.end).filter(Boolean) as string[]
  const range = starts.length && ends.length ? `${starts.sort()[0]}–${ends.sort()[ends.length - 1]}` : ''

  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-line pb-4">
      <h3 className="font-display text-[1.6rem] font-black leading-none tracking-head md:text-[2.1rem]">
        {day >= 0 ? (
          <>
            {WEEKDAYS[day]}{' '}
            <span className="text-subtle">
              {week.days[day]?.day} {MONTHS[day]}
            </span>
          </>
        ) : (
          'Por programar'
        )}
      </h3>
      <div className="flex items-center gap-3">
        {today ? (
          <span className="rounded-full bg-orange px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-night">
            Hoy
          </span>
        ) : null}
        <span className="meta">
          {talks.length} {talks.length === 1 ? 'charla' : 'charlas'}
          {range ? ` · ${range}` : ''}
        </span>
      </div>
    </div>
  )
}

/* ============================================================
   CARD
   ============================================================ */

function Card({
  talk,
  index,
  live,
  open,
  focused,
  flipped,
  onFlip,
}: {
  talk: Talk
  index: number
  live: boolean
  /** Its Zoom room is open: live, or about to start. */
  open: boolean
  focused: boolean
  flipped: boolean
  onFlip: () => void
}) {
  /* lean towards the cursor — mouse only, a few degrees */
  const tiltX = useSpring(0, { stiffness: 220, damping: 22 })
  const tiltY = useSpring(0, { stiffness: 220, damping: 22 })
  const lean = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 12)
    tiltX.set(-((e.clientY - r.top) / r.height - 0.5) * 12)
  }
  const settle = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  return (
    <motion.li
      id={talkId(talk)}
      layout
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 5) * 0.06 }}
      className="scroll-mt-40"
      data-reveal
    >
      <motion.div
        onPointerMove={lean}
        onPointerLeave={settle}
        style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
        className={cn(
          'group relative rounded-[16px] [perspective:1400px] md:rounded-[20px]',
          'outline outline-2 outline-offset-4 transition-[outline-color] duration-700',
          focused ? 'outline-orange' : 'outline-transparent'
        )}
      >
        <motion.div
          className="relative aspect-[5/7] [transform-style:preserve-3d]"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 17, mass: 0.9 }}
        >
          <Front talk={talk} live={live} hidden={flipped} chip={!(open && talk.zoom)} />
          <Back talk={talk} hidden={!flipped} withJoin={!!talk.zoom} />
        </motion.div>

        {/* one control over the whole card, so it turns wherever it is touched */}
        <button
          type="button"
          onClick={onFlip}
          aria-pressed={flipped}
          aria-label={flipped ? `Volver a la foto de ${namesOf(talk)}` : `Ver la charla de ${namesOf(talk)}`}
          className="absolute inset-0 z-10 rounded-[16px] md:rounded-[20px]"
        />

        {/* Links sit outside the turning faces and above the card's own
            button — inside a face they could never be clicked. */}
        {open && talk.zoom && !flipped ? (
          <JoinLink
            href={talk.zoom}
            live={live}
            hot
            label={live ? 'En vivo · Unirse' : `Unirse · ${talk.slot?.start}`}
            className="absolute left-2.5 top-2.5 z-20 h-7 px-2.5 text-[10.5px] md:left-3 md:top-3"
          />
        ) : null}
        <AnimatePresence>
          {flipped && talk.zoom ? (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE, delay: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="tone-night absolute inset-x-4 bottom-4 z-20 md:inset-x-5 md:bottom-5"
            >
              <JoinLink href={talk.zoom} live={live} hot={open} label="Unirse por Zoom" className="h-9 w-full text-[12px]" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.li>
  )
}

const FACE =
  'absolute inset-0 overflow-hidden rounded-[16px] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] md:rounded-[20px]'

/** The hour, or "En vivo" while the talk is on. */
function TimeChip({ slot, live }: { slot?: Slot; live: boolean }) {
  if (live) {
    return (
      <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-orange px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-night md:left-3 md:top-3">
        <LiveDot className="[&>span]:bg-night" />
        En vivo
      </span>
    )
  }
  if (!slot) return null
  return (
    <span className="absolute left-2.5 top-2.5 rounded-full bg-night/55 px-2 py-1 font-mono text-[10px] font-medium tabular text-paper backdrop-blur-md md:left-3 md:top-3">
      {slot.start}
    </span>
  )
}

/* Who, in four lines, each a step down from the name:
     PhD.                              degree — alone, small
     Diego H. Peluffo-Ordóñez          name
     Research Professor                position, up to two lines
     YACHAY TECH                       institution
   Lines that do not apply simply are not there. A shared card
   lists both names and the institutions only. */
function Front({ talk, live, hidden, chip }: { talk: Talk; live: boolean; hidden: boolean; chip: boolean }) {
  const solo: Speaker | undefined = talk.people.length === 1 ? talk.people[0] : undefined
  const orgs = Array.from(new Set(talk.people.map((p) => p.org))).join(' · ')

  return (
    <div className={cn(FACE, 'bg-line')} aria-hidden={hidden}>
      <Portraits talk={talk} />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-night via-night/70 to-transparent"
      />

      {/* the join link takes this corner while the room is open */}
      {chip ? <TimeChip slot={talk.slot} live={live} /> : null}

      <div className="absolute inset-x-0 bottom-0 p-3 text-paper md:p-4">
        {solo?.degree ? (
          <p className="mb-1 font-display text-[10.5px] font-semibold leading-none tracking-[0.01em] text-paper/65 md:text-[11.5px]">
            {solo.degree}
          </p>
        ) : null}
        <h3 className="font-display text-[14px] font-extrabold leading-[1.15] tracking-[-0.015em] md:text-[17px]">
          {namesOf(talk)}
        </h3>
        {solo?.role ? (
          <p className="mt-1.5 line-clamp-2 text-[10.5px] leading-snug text-paper/80 md:text-[12px]">{solo.role}</p>
        ) : null}
        <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-paper/55 md:text-[9.5px]">{orgs}</p>
      </div>
    </div>
  )
}

/** The talk, set large; the topics beneath it. Nothing else. */
function Back({ talk, hidden, withJoin }: { talk: Talk; hidden: boolean; withJoin: boolean }) {
  /* the longer the title, the smaller the type, so every one fits whole */
  const size =
    talk.talk.length > 120
      ? 'text-[11px] md:text-[14px]'
      : talk.talk.length > 80
        ? 'text-[12px] md:text-[15.5px]'
        : 'text-[13.5px] md:text-[18px]'

  return (
    <div
      className={cn(
        FACE,
        'tone-night flex flex-col bg-bg p-4 text-fg [transform:rotateY(180deg)] md:p-5',
        /* room for the join button, which sits over this face */
        withJoin && 'pb-16 md:pb-[4.5rem]'
      )}
      aria-hidden={hidden}
    >
      <span aria-hidden="true" className="block h-[2px] w-7 flex-none bg-orange" />

      {/* hyphens and overflow-wrap: "universitarios/personales" is one
          unbreakable word otherwise, and runs off a phone-sized card */}
      <p
        lang="es"
        className={cn(
          'mt-4 min-h-0 hyphens-auto font-display font-extrabold leading-[1.18] tracking-[-0.015em] [overflow-wrap:anywhere]',
          size
        )}
      >
        {/* a zero-width space after each slash lets the line break there */}
        {talk.talk.replaceAll('/', '/\u200b')}
      </p>

      <div className="mt-auto flex flex-wrap gap-1 pt-3">
        {talk.tracks.map((k) => (
          <span
            key={k}
            className="inline-flex items-center gap-1 rounded-full border border-fg/15 bg-fg/[0.06] px-1.5 py-[2px] text-[9px] font-semibold leading-tight text-fg/80 md:text-[10px]"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: trackByKey[k].hex }} aria-hidden="true" />
            {trackByKey[k].name}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   PORTRAITS
   Two people on one card are split on a slant like the logo's
   ribbon; each photo fills a little more than its half so the
   face lands in the middle of its side, not on the cut.
   ============================================================ */

const SPLIT = {
  left: 'polygon(0 0, 58% 0, 42% 100%, 0 100%)',
  right: 'polygon(58% 0, 100% 0, 100% 100%, 42% 100%)',
} as const

const TONE =
  'grayscale contrast-[1.06] transition-[filter,transform] duration-700 ease-cs group-hover:scale-[1.04] group-hover:grayscale-0 group-hover:contrast-100'

function Portraits({ talk }: { talk: Talk }) {
  const photos = talk.people.filter((p) => p.photo).slice(0, 2)

  if (photos.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photos[0].photo}
        alt={photos[0].name}
        loading="lazy"
        decoding="async"
        className={cn('absolute inset-0 h-full w-full object-cover object-[50%_22%]', TONE)}
      />
    )
  }

  return (
    <>
      {photos.map((p, i) => {
        const part = i === 0 ? 'left' : 'right'
        return (
          <div key={p.name} className="absolute inset-0" style={{ clipPath: SPLIT[part] }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.photo}
              alt={p.name}
              loading="lazy"
              decoding="async"
              className={cn(
                'absolute top-0 h-full w-[66%] object-cover object-[50%_22%]',
                part === 'left' ? 'left-0' : 'right-0',
                TONE
              )}
            />
          </div>
        )
      })}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="58" y1="0" x2="42" y2="100" stroke="hsl(var(--bg))" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      </svg>
    </>
  )
}

function Chip({
  active,
  onClick,
  children,
  dot,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  dot?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative inline-flex h-9 items-center gap-2 rounded-full border px-3.5 font-display text-[12.5px] font-semibold transition-colors duration-300',
        active ? 'border-transparent text-bg' : 'border-line-strong text-muted hover:text-fg'
      )}
    >
      {active ? (
        <motion.span layoutId="chip" transition={SPRING_SNAP} className="absolute inset-0 rounded-full bg-fg" />
      ) : null}
      {dot ? (
        <span className="relative h-2 w-2 rounded-full" style={{ backgroundColor: dot }} aria-hidden="true" />
      ) : null}
      <span className="relative inline-flex items-center gap-1.5">{children}</span>
    </button>
  )
}
