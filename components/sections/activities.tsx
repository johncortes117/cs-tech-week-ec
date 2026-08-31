'use client'

import { motion } from 'motion/react'
import { Laptop, MessagesSquare, Ticket } from 'lucide-react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { activities, priceNote, tracks, type Activity, type Price } from '@/lib/content'
import { cn } from '@/lib/utils'
import { Equator, SectionHead } from '@/components/ui/primitives'
import { TeaserVideo } from '@/components/ui/teaser-video'

/* ============================================================
   ACTIVITIES

   Three cards, in the order they matter: the talks are the week
   itself, the two competitions hang off it. Each one carries the
   branding of its own announcement rather than a shared template
   — a CSS duel and a Minecraft tournament have nothing to do
   with each other visually, and pretending otherwise would make
   both forgettable.

   · Talks — the site's own language, with the six track colours
     doing the work.
   · CSS Battle — the poster's typographic lockup (MINI /
     HACKATHON / <CSS BATTLE/>) beside the announcement clip,
     framed as an editor window.
   · Minecraft — the poster inverted into orange, set in a pixel
     face, with isometric blocks built in SVG.

   The member price leads and is set apart in every card: the
   discount is the strongest argument the page has for joining
   the society.
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

/** The poster's "coming soon" line: an outlined pill plus what is still missing. */
function PendingRow({ items, tone = 'dark' }: { items: string[]; tone?: Tone }) {
  return (
    <div className="flex flex-col gap-3">
      <span
        className={cn(
          'inline-flex w-fit items-center rounded-pill px-5 py-2 font-mono text-[11px] uppercase tracking-[0.3em]',
          tone === 'orange'
            ? 'border border-ink/25 text-ink'
            : 'grad-border text-primary'
        )}
      >
        Próximamente
      </span>
      <p
        className={cn(
          'font-mono text-[10px] uppercase tracking-label',
          tone === 'orange' ? 'text-ink/55' : 'text-subtle'
        )}
      >
        {items.join('  ·  ')}
      </p>
    </div>
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

/* ---------- 1 · the talks, which are the week ---------- */

function TalksCard({ activity }: { activity: Activity }) {
  return (
    <CardShell>
      <div
        className="relative overflow-hidden rounded-card border border-line bg-ink-raise"
      >
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

            <div className="mt-1 border-t border-line pt-6">
              <span className="label mb-3 block">Inscripción</span>
              <PriceTag price={activity.price} size="lg" />
            </div>
          </div>

          {/* the six tracks, doing the explaining */}
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

/* ---------- 2 · CSS Battle, following its poster ---------- */

function CodeWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-[10px] border border-line-strong bg-ink shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
      {/* the poster's window chrome, traffic lights and all */}
      <div className="flex items-center gap-1.5 border-b border-line bg-ink-plate px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
      </div>
      {children}
    </div>
  )
}

function CssBattleCard({ activity }: { activity: Activity }) {
  return (
    <CardShell delay={0.05}>
      <div
        className="relative overflow-hidden rounded-card border border-line bg-ink"
      >
        {/* the corner glow the poster has behind its title */}
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
            {/* the lockup, straight off the poster */}
            <div>
              <p className="font-display text-[clamp(1rem,2vw,1.4rem)] font-light uppercase leading-none tracking-[0.42em] text-muted-foreground">
                {activity.kind.replace('Mini hackathon', 'Mini')}
              </p>
              <h3 className="mt-1.5 font-display text-[clamp(2.3rem,6vw,4.2rem)] font-black uppercase leading-[0.86] tracking-[-0.02em]">
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
                ]}
              />
            ) : null}

            <div className="flex flex-wrap items-end justify-between gap-6 border-t border-line pt-6">
              <div>
                <span className="label mb-3 block">Inscripción</span>
                <PriceTag price={activity.price} />
              </div>
              {activity.pending ? <PendingRow items={activity.pending} /> : null}
            </div>
          </div>

          {/* the announcement clip, framed as an editor */}
          {activity.video ? (
            <div className="flex w-full items-center">
              <CodeWindow>
                <div className="relative aspect-[16/10] w-full bg-ink-plate">
                  <TeaserVideo src={activity.video} className="h-full w-full" />
                </div>
              </CodeWindow>
            </div>
          ) : null}
        </div>
      </div>
    </CardShell>
  )
}

/* ---------- 3 · the Minecraft tournament ---------- */

function MinecraftCard({ activity }: { activity: Activity }) {
  return (
    <CardShell delay={0.1}>
      <div
        className="relative overflow-hidden rounded-card bg-primary text-ink"
      >
        {/* the poster's pixel field, fading out to the right */}
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
        {/* scattered blocks, the way the poster scatters pixels */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-[0.18]"
          style={{
            backgroundImage: 'radial-gradient(hsl(var(--ink)) 2px, transparent 2px)',
            backgroundSize: '22px 22px',
            maskImage: 'radial-gradient(70% 90% at 100% 60%, #000, transparent)',
            WebkitMaskImage: 'radial-gradient(70% 90% at 100% 60%, #000, transparent)',
          }}
        />

        <div className="relative grid gap-10 p-8 md:p-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="flex flex-col justify-center gap-7">
            <span className="font-mono text-[10px] uppercase tracking-label text-ink/60">
              {activity.kind}
            </span>

            <div>
              <h3 className="font-pixel text-[clamp(1.6rem,5vw,3rem)] leading-[1.05] text-ink">
                {activity.name}
              </h3>
              {/* the poster sets its line in a white band */}
              <p className="mt-5 inline-block bg-foreground px-4 py-2 font-pixel text-[clamp(0.55rem,1.5vw,0.8rem)] leading-relaxed text-primary">
                {activity.tagline}
              </p>
            </div>

            <p className="max-w-[46ch] text-[0.9375rem] font-medium leading-relaxed text-ink/75">
              {activity.blurb}
            </p>

            {activity.meta ? <MetaRow meta={activity.meta} tone="orange" /> : null}

            <div className="flex flex-wrap items-end justify-between gap-6 border-t border-ink/20 pt-6">
              <div>
                <span className="mb-3 block font-mono text-[10px] uppercase tracking-label text-ink/60">
                  Inscripción
                </span>
                <PriceTag price={activity.price} tone="orange" />
              </div>
              {activity.pending ? <PendingRow items={activity.pending} tone="orange" /> : null}
            </div>
          </div>

          {/* Steve and a creeper, drifting out of step with each
              other. Renders of the default skins — the same figure
              the tournament poster uses. */}
          <div className="relative flex min-h-[240px] items-end justify-center lg:min-h-[300px]">
            <motion.img
              src="/minecraft/creeper.png"
              alt=""
              aria-hidden="true"
              className="absolute bottom-[18%] left-[10%] w-[26%] max-w-[130px] drop-shadow-[0_18px_22px_rgba(0,0,0,0.28)]"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            />
            <motion.img
              src="/minecraft/steve.png"
              alt="Personaje de Minecraft"
              className="relative w-[38%] max-w-[210px] drop-shadow-[0_26px_30px_rgba(0,0,0,0.3)]"
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            />
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
          eyebrow="Actividades"
          title="Charlas, un duelo y un torneo."
          lede="Cada actividad se inscribe por separado. Ser miembro de IEEE Computer Society cuesta menos."
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
