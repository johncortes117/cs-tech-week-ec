'use client'

import { motion } from 'motion/react'
import { Laptop, MessagesSquare, Ticket, ExternalLink, Gamepad2 } from 'lucide-react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { activities, priceNote, tracks, type Activity, type Price } from '@/lib/content'
import { cn } from '@/lib/utils'
import { Btn, Equator, SectionHead } from '@/components/ui/primitives'
import { TeaserVideo } from '@/components/ui/teaser-video'

/* ============================================================
   ACTIVITIES
   ============================================================ */

type Tone = 'dark' | 'orange'

function PriceTag({
  price,
  tone = 'dark',
  size = 'md',
}: {
  price: Price
  tone?: Tone
  size?: 'md' | 'lg'
}) {
  const big =
    size === 'lg'
      ? 'text-[clamp(2rem,4vw,2.6rem)]'
      : 'text-[clamp(1.6rem,3vw,2rem)]'

  return (
    <div className="flex items-stretch gap-4">
      <div className="flex flex-col justify-end gap-1">
        <span
          className={cn(
            'font-mono text-[10px] uppercase tracking-label',
            tone === 'orange' ? 'text-ink/60' : 'text-primary/75'
          )}
        >
          Miembros IEEE CS
        </span>
        <span
          className={cn(
            'font-display font-black leading-none tracking-head',
            big,
            tone === 'orange' ? 'text-ink' : 'text-primary'
          )}
        >
          ${price.member}
        </span>
      </div>

      <span
        className={cn('w-px self-stretch', tone === 'orange' ? 'bg-ink/20' : 'bg-line')}
        aria-hidden="true"
      />

      <div className="flex flex-col justify-end gap-1">
        <span
          className={cn(
            'font-mono text-[10px] uppercase tracking-label',
            tone === 'orange' ? 'text-ink/45' : 'text-subtle'
          )}
        >
          Público general
        </span>
        <span
          className={cn(
            'font-display font-black leading-none tracking-head',
            big,
            tone === 'orange' ? 'text-ink/70' : 'text-foreground'
          )}
        >
          ${price.general}
        </span>
      </div>
    </div>
  )
}

function MetaRow({
  meta,
  tone = 'dark',
  icons,
}: {
  meta: NonNullable<Activity['meta']>
  tone?: Tone
  icons?: React.ReactNode[]
}) {
  return (
    <dl className="flex flex-wrap items-center gap-x-7 gap-y-4">
      {meta.map((m, i) => (
        <div key={m.label} className="flex items-center gap-3">
          {icons?.[i] ?? null}
          <div>
            <dt
              className={cn(
                'font-mono text-[10px] uppercase tracking-label',
                tone === 'orange' ? 'text-ink/55' : 'text-subtle'
              )}
            >
              {m.label}
            </dt>
            <dd
              className={cn(
                'mt-0.5 font-display text-[0.8125rem] font-bold uppercase tracking-[0.06em]',
                tone === 'orange' ? 'text-ink' : 'text-foreground'
              )}
            >
              {m.value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

function CardShell({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      data-reveal
      viewport={VIEWPORT}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={cn('relative rounded-card', className)}
    >
      {children}
    </motion.div>
  )
}

/* ---------- 1 · Charlas y Ponencias ---------- */

function TalksCard({ activity }: { activity: Activity }) {
  return (
    <CardShell>
      <div className="relative overflow-hidden rounded-card border border-line bg-ink-raise">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 120% at 0% 0%, hsl(var(--orange) / 0.10), transparent 55%)',
          }}
        />

        <div className="relative grid gap-10 p-8 md:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="flex flex-col gap-6">
            <span className="label">{activity.kind}</span>

            <div>
              <p className="font-display text-[0.9375rem] font-bold uppercase tracking-[0.12em] text-primary">
                {activity.tagline}
              </p>
              <h3 className="mt-2 font-display text-[clamp(2rem,4.6vw,3.2rem)] font-black leading-[0.98] tracking-head">
                {activity.name}
              </h3>
            </div>

            <p className="max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
              {activity.blurb}
            </p>

            {activity.meta ? <MetaRow meta={activity.meta} /> : null}

            <div className="mt-1 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-6">
              <div>
                <span className="label mb-3 block">Acceso a las charlas</span>
                <span className="font-display text-[clamp(2rem,4vw,2.6rem)] font-black leading-none tracking-head text-primary">
                  Gratis
                </span>
              </div>
              <Btn href="#precios" variant="ghost" size="md">
                Ver inscripciones
              </Btn>
            </div>
          </div>

          {/* the six tracks */}
          <ul className="flex flex-col justify-center gap-2.5 lg:border-l lg:border-line lg:pl-12">
            {tracks.map((t, i) => (
              <motion.li
                key={t.key}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                data-reveal
                viewport={VIEWPORT}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.06 }}
                className="group flex items-center gap-4 rounded-[8px] border border-line bg-ink px-4 py-3 transition-colors duration-500 ease-cs hover:border-line-strong"
              >
                <span
                  className="h-8 w-[3px] flex-none rounded-full transition-all duration-500 ease-cs group-hover:h-10"
                  style={{ backgroundColor: t.hex, boxShadow: `0 0 12px ${t.hex}55` }}
                />
                <span className="font-display text-[0.875rem] font-semibold text-foreground">
                  {t.name}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </CardShell>
  )
}

/* ---------- 2 · CSS Battle ---------- */

function CodeWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-[10px] border border-line-strong bg-ink shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between border-b border-line bg-ink-plate px-3.5 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-label text-subtle">
          cssbattle.dev · arena
        </span>
      </div>
      {children}
    </div>
  )
}

function CssBattleCard({ activity }: { activity: Activity }) {
  return (
    <CardShell delay={0.05}>
      <div className="relative overflow-hidden rounded-card border border-line bg-ink">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 80% at 100% 0%, hsl(var(--orange) / 0.16), transparent 60%), radial-gradient(50% 70% at 0% 100%, hsl(var(--deep) / 0.28), transparent 65%)',
          }}
        />

        <div className="relative grid gap-10 p-8 md:p-12 lg:grid-cols-[1fr_0.95fr] lg:gap-14">
          <div className="flex flex-col justify-center gap-7">
            <div>
              <div className="flex items-center gap-2">
                <span className="label text-primary">Mini Hackathon · 3 y 4 de Octubre</span>
                <a
                  href="https://cssbattle.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-pill border border-line px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:text-primary"
                >
                  cssbattle.dev <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <h3 className="mt-2 font-display text-[clamp(2.3rem,6vw,4.2rem)] font-black uppercase leading-[0.86] tracking-[-0.02em]">
                Hackathon
              </h3>
              <p className="mt-3 flex items-center gap-3 font-display text-[clamp(0.95rem,2.2vw,1.5rem)] font-semibold uppercase leading-none tracking-[0.3em]">
                <span className="text-primary" aria-hidden="true">
                  &lt;
                </span>
                <span>{activity.name}</span>
                <span className="text-primary" aria-hidden="true">
                  /&gt;
                </span>
              </p>
            </div>

            <p className="max-w-[46ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
              {activity.blurb}
            </p>

            {activity.meta ? (
              <MetaRow
                meta={activity.meta}
                icons={[
                  <Laptop key="l" className="h-5 w-5 text-primary" aria-hidden="true" />,
                  <MessagesSquare key="d" className="h-5 w-5 text-primary" aria-hidden="true" />,
                  <Ticket key="t" className="h-5 w-5 text-primary" aria-hidden="true" />,
                ]}
              />
            ) : null}

            <div className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-6">
              <div>
                <span className="label mb-3 block">Inscripción individual o a 2 concursos</span>
                <PriceTag price={activity.price} />
              </div>
              <Btn href="#precios" variant="ghost" size="md">
                Ver inscripciones
              </Btn>
            </div>
          </div>

          {/* CSS Battle Preview / Clip */}
          <div className="flex w-full flex-col justify-center gap-3">
            <CodeWindow>
              <div className="relative aspect-[16/10] w-full bg-ink-plate">
                {activity.video ? (
                  <TeaserVideo src={activity.video} className="h-full w-full" />
                ) : activity.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activity.image}
                    alt="Plataforma CSSBattle"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            </CodeWindow>
            <div className="flex items-center justify-between px-1 text-[11px] text-subtle font-mono">
              <span>Auspiciado por CSSBattle</span>
              <span>Duelos 1 vs 1 en vivo</span>
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  )
}

/* ---------- 3 · Torneo de Minecraft ---------- */

function MinecraftCard({ activity }: { activity: Activity }) {
  return (
    <CardShell delay={0.1}>
      <div className="relative overflow-hidden rounded-card bg-primary text-ink">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--ink) / 0.10) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--ink) / 0.10) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
            maskImage: 'linear-gradient(105deg, #000 10%, transparent 70%)',
            WebkitMaskImage: 'linear-gradient(105deg, #000 10%, transparent 70%)',
          }}
        />

        <div className="relative grid gap-10 p-8 md:p-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="flex flex-col justify-center gap-7">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-label text-ink/75">
                {activity.kind}
              </span>
              <span className="rounded-pill bg-ink/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-ink">
                Servidor Dedicado
              </span>
            </div>

            <div>
              <h3 className="font-pixel text-[clamp(1.6rem,5vw,3rem)] leading-[1.05] text-ink">
                {activity.name}
              </h3>
              <p className="mt-5 inline-block bg-foreground px-4 py-2 font-pixel text-[clamp(0.55rem,1.5vw,0.8rem)] leading-relaxed text-primary">
                {activity.tagline}
              </p>
            </div>

            <p className="max-w-[46ch] text-[0.9375rem] font-medium leading-relaxed text-ink/85">
              {activity.blurb}
            </p>

            {activity.meta ? (
              <MetaRow
                meta={activity.meta}
                tone="orange"
                icons={[
                  <Gamepad2 key="g" className="h-5 w-5 text-ink" aria-hidden="true" />,
                  <Ticket key="t" className="h-5 w-5 text-ink" aria-hidden="true" />,
                ]}
              />
            ) : null}

            <div className="flex flex-wrap items-end justify-between gap-6 border-t border-ink/20 pt-6">
              <div>
                <span className="mb-3 block font-mono text-[10px] uppercase tracking-label text-ink/75">
                  Inscripción individual o a 2 concursos
                </span>
                <PriceTag price={activity.price} tone="orange" />
              </div>
              <a
                href="#precios"
                className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-ink/30 bg-ink px-5 py-3 font-display text-[0.875rem] font-bold text-primary transition-all duration-300 hover:bg-ink-raise"
              >
                Ver inscripciones
              </a>
            </div>
          </div>

          {/* Minecraft dedicated server screenshot & character renders */}
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[12px] border border-ink/20 bg-ink/10 p-3 shadow-xl">
            {activity.image ? (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[8px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activity.image}
                  alt="Servidor Dedicado Minecraft CS TECH WEEK"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-3 font-mono text-[10px] uppercase tracking-label text-white">
                  Captura del Servidor Oficial CS TECH WEEK
                </span>
              </div>
            ) : null}

            <div className="relative mt-3 flex w-full items-center justify-around">
              <motion.img
                src="/minecraft/creeper.png"
                alt=""
                aria-hidden="true"
                className="w-[18%] max-w-[80px] drop-shadow-md"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink">
                Torneo Individual
              </span>
              <motion.img
                src="/minecraft/steve.png"
                alt="Steve Minecraft"
                className="w-[22%] max-w-[100px] drop-shadow-md"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  )
}

/* ---------- the section ---------- */

const CARDS: Record<string, (a: Activity) => React.ReactNode> = {
  charlas: (a) => <TalksCard activity={a} />,
  hackathon: (a) => <CssBattleCard activity={a} />,
  minecraft: (a) => <MinecraftCard activity={a} />,
}

export function Activities() {
  return (
    <section id="actividades" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Actividades y Competencias"
          title="Charlas, un duelo y un torneo."
          lede="Las conferencias académicas de la semana son gratuitas. Inscríbete en los concursos del fin de semana con tarifa especial para miembros IEEE."
        />

        <div className="mt-14 flex flex-col gap-5">
          {activities.map((a) => (
            <div key={a.key}>{CARDS[a.key]?.(a) ?? null}</div>
          ))}
        </div>

        <p className="mt-7 flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-subtle">
          <Ticket className="mt-0.5 h-3.5 w-3.5 flex-none text-primary/70" aria-hidden="true" />
          {priceNote}
        </p>
      </div>

      <div className="shell mt-24">
        <Equator label="ACTIVIDADES → AGENDA" />
      </div>
    </section>
  )
}
