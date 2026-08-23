'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bell, Check, Clock, MapPin, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE, SPRING_SNAP, VIEWPORT } from '@/lib/motion'
import {
  days,
  modalityLabels,
  tracks,
  trackByKey,
  typeLabels,
  type Modality,
  type SessionType,
  type TrackKey,
} from '@/lib/content'
import { Card, Equator, Pill, SectionHead, Reveal } from '@/components/ui/primitives'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { TracingBeam } from '@/components/ui/tracing-beam'

/* ============================================================
   AGENDA
   Mientras `days` esté vacío la sección entra en modo "en
   construcción": no dibujamos cajas huecas ni texto de relleno,
   mostramos lo que sí sabemos (los tracks) y capturamos correos.
   El vacío se convierte en lista de contactos.
   ============================================================ */

type Filter<T extends string> = T | 'todos'

function Chip({
  active,
  onClick,
  children,
  hex,
  layoutGroup,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  hex?: string
  layoutGroup: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative rounded-pill px-3.5 py-1.5 font-display text-[12px] font-semibold transition-colors duration-300',
        active ? 'text-ink' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {active ? (
        <motion.span
          layoutId={layoutGroup}
          transition={SPRING_SNAP}
          className="absolute inset-0 rounded-pill"
          style={{ backgroundColor: hex ?? 'hsl(var(--orange))' }}
        />
      ) : (
        <span className="absolute inset-0 rounded-pill border border-line" />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

function FilterRow<T extends string>({
  label,
  options,
  value,
  onChange,
  group,
  colorOf,
}: {
  label: string
  options: { key: T; name: string }[]
  value: Filter<T>
  onChange: (v: Filter<T>) => void
  group: string
  colorOf?: (k: T) => string
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <span className="label w-24 flex-none">{label}</span>
      <div className="flex flex-wrap gap-2">
        <Chip active={value === 'todos'} onClick={() => onChange('todos')} layoutGroup={group}>
          Todos
        </Chip>
        {options.map((o) => (
          <Chip
            key={o.key}
            active={value === o.key}
            onClick={() => onChange(o.key)}
            hex={colorOf?.(o.key)}
            layoutGroup={group}
          >
            {o.name}
          </Chip>
        ))}
      </div>
    </div>
  )
}

/* ---------- estado "programa en construcción" ---------- */

function NotifyForm() {
  const [email, setEmail] = React.useState('')
  const [sent, setSent] = React.useState(false)

  // TODO: conectar a la lista real (Resend, Supabase o vTools).
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) return
    setSent(true)
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-2.5 sm:flex-row">
      <label className="sr-only" htmlFor="notify-email">
        Tu correo
      </label>
      <input
        id="notify-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={sent}
        placeholder="tu@correo.com"
        className="min-w-0 flex-1 rounded-[6px] border border-line bg-ink px-4 py-3 font-sans text-[0.9375rem] text-foreground placeholder:text-subtle focus:border-primary/60 focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={sent}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-3',
          'font-display text-[0.8125rem] font-bold transition-colors duration-300',
          sent
            ? 'bg-cyan/15 text-cyan'
            : 'bg-primary text-primary-foreground hover:bg-[#FFB733]'
        )}
      >
        {sent ? (
          <>
            <Check className="h-4 w-4" /> Listo
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" /> Avísenme
          </>
        )}
      </button>
    </form>
  )
}

function AgendaEmpty() {
  return (
    <div className="relative mt-14 rounded-card">
      {/* La única tarjeta de la sección lleva el arco de luz: es
          donde queremos que caiga la atención mientras no haya
          programa que mostrar. */}
      <GlowingEffect
        color="#FFA300"
        accent="#00B5E2"
        spread={46}
        proximity={72}
        className="rounded-card"
      />
      <Card interactive={false} className="grad-border overflow-hidden">
      <div className="relative grid gap-10 p-8 md:grid-cols-[1.1fr_1fr] md:p-12">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-pill border border-line bg-ink px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-cyan animate-pulse-ring" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
            </span>
            <span className="label text-cyan">Programa en construcción</span>
          </span>

          <h3 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-[1.1] tracking-head">
            Todavía estamos cerrando el cronograma.
          </h3>

          <p className="max-w-[46ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
            Preferimos no publicar horarios que después cambien. Lo que sí está definido son los
            seis tracks. Déjanos tu correo y te escribimos el día que se publique la agenda
            completa — sin spam, un solo mensaje.
          </p>

          <NotifyForm />
        </div>

        {/* vista previa de los tracks como líneas de tiempo fantasma */}
        <div className="relative flex flex-col gap-2.5" aria-hidden="true">
          {tracks.map((t, i) => (
            <motion.div
              key={t.key}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              data-reveal
              viewport={VIEWPORT}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.07 }}
              className="flex items-center gap-3 rounded-[8px] border border-line bg-ink px-3.5 py-3"
            >
              <span
                className="h-full min-h-[26px] w-[3px] flex-none rounded-full"
                style={{ backgroundColor: t.hex }}
              />
              <span className="flex-1 font-display text-[12px] font-semibold text-muted-foreground">
                {t.name}
              </span>
              <span
                className="h-1.5 rounded-full bg-line"
                style={{ width: `${28 + ((i * 13) % 34)}px` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
      </Card>
    </div>
  )
}

/* ---------- timeline real ---------- */

function SessionRow({ s, index }: { s: (typeof days)[number]['sessions'][number]; index: number }) {
  const track = trackByKey[s.track]

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: EASE, delay: Math.min(index * 0.04, 0.3) }}
      className="grid grid-cols-[64px_1fr] gap-4 md:grid-cols-[86px_1fr] md:gap-6"
    >
      {/* columna de hora */}
      <div className="relative pt-4 text-right">
        <div className="font-mono text-[13px] font-semibold tabular text-foreground">{s.start}</div>
        <div className="font-mono text-[11px] tabular text-subtle">{s.end}</div>
        <span
          className="absolute -right-[calc(0.5rem+1px)] top-[1.35rem] hidden h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full md:block"
          style={{ backgroundColor: track.hex }}
          aria-hidden="true"
        />
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Pill hex={track.hex}>{track.name}</Pill>
          <Pill className="border-line text-muted-foreground">
            {s.modality === 'virtual' ? (
              <Video className="h-3 w-3" />
            ) : (
              <MapPin className="h-3 w-3" />
            )}
            {modalityLabels[s.modality]}
          </Pill>
          <Pill className="border-line text-muted-foreground">{typeLabels[s.type]}</Pill>
        </div>
        <h4 className="mt-3 font-display text-[1rem] font-bold leading-snug tracking-[-0.01em]">
          {s.title}
        </h4>
        {s.speaker ? (
          <p className="mt-1 text-[0.875rem] text-muted-foreground">{s.speaker}</p>
        ) : null}
        {s.venue ? (
          <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-subtle">
            <Clock className="h-3 w-3" /> {s.venue}
          </p>
        ) : null}
      </Card>
    </motion.li>
  )
}

export function Agenda() {
  const [track, setTrack] = React.useState<Filter<TrackKey>>('todos')
  const [modality, setModality] = React.useState<Filter<Modality>>('todos')
  const [type, setType] = React.useState<Filter<SessionType>>('todos')
  const [dayKey, setDayKey] = React.useState(days[0]?.key ?? '')

  const day = days.find((d) => d.key === dayKey) ?? days[0]

  const sessions = React.useMemo(() => {
    if (!day) return []
    return day.sessions.filter(
      (s) =>
        (track === 'todos' || s.track === track) &&
        (modality === 'todos' || s.modality === modality) &&
        (type === 'todos' || s.type === type)
    )
  }, [day, track, modality, type])

  return (
    <section id="agenda" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Agenda"
          title="Seis días, seis tracks, un solo calendario."
          lede="Filtra por temática, modalidad o tipo de sesión para armar tu propia semana."
        />

        {days.length === 0 ? (
          <AgendaEmpty />
        ) : (
          <>
            {/* filtros */}
            <Reveal className="mt-14 flex flex-col gap-5">
              <FilterRow
                label="Track"
                group="f-track"
                options={tracks.map((t) => ({ key: t.key, name: t.name }))}
                value={track}
                onChange={setTrack}
                colorOf={(k) => trackByKey[k].hex}
              />
              <FilterRow
                label="Modalidad"
                group="f-mod"
                options={(['presencial', 'virtual', 'hibrido'] as Modality[]).map((k) => ({
                  key: k,
                  name: modalityLabels[k],
                }))}
                value={modality}
                onChange={setModality}
              />
              <FilterRow
                label="Tipo"
                group="f-type"
                options={(['ponencia', 'panel', 'workshop', 'reto'] as SessionType[]).map((k) => ({
                  key: k,
                  name: typeLabels[k],
                }))}
                value={type}
                onChange={setType}
              />
            </Reveal>

            {/* pestañas de día */}
            <div className="mask-fade-x mt-10 overflow-x-auto pb-1">
              <div className="flex min-w-max gap-1 border-b border-line">
                {days.map((d) => {
                  const active = d.key === dayKey
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDayKey(d.key)}
                      className={cn(
                        'relative px-4 py-3 font-display text-[13px] font-semibold transition-colors duration-300',
                        active ? 'text-foreground' : 'text-subtle hover:text-muted-foreground'
                      )}
                    >
                      {d.label}
                      <span className="ml-2 font-mono text-[10px] tabular text-subtle">
                        {d.sessions.length}
                      </span>
                      {active ? (
                        <motion.span
                          layoutId="day-underline"
                          transition={SPRING_SNAP}
                          className="absolute inset-x-2 -bottom-px h-[2px] bg-primary"
                        />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* sesiones — el haz de Aceternity se dibuja al ritmo
                del scroll y dice cuánto del día llevas leído */}
            <TracingBeam className="mt-8">
            <ul className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {sessions.length > 0 ? (
                  sessions.map((s, i) => <SessionRow key={s.title} s={s} index={i} />)
                ) : (
                  <motion.li
                    key="vacio"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-card border border-dashed border-line py-14 text-center text-[0.9375rem] text-subtle"
                  >
                    No hay sesiones con esos filtros. Prueba quitando alguno.
                  </motion.li>
                )}
              </AnimatePresence>
            </ul>
            </TracingBeam>
          </>
        )}
      </div>

      <div className="shell mt-24">
        <Equator label="AGENDA → SPEAKERS" />
      </div>
    </section>
  )
}
