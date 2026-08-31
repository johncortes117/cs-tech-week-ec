'use client'

import { motion } from 'motion/react'
import { Lock, Swords, Ticket } from 'lucide-react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { activities, priceNote, type Activity, type Price } from '@/lib/content'
import { useCountdown } from '@/lib/use-countdown'
import { Card, Equator, SectionHead } from '@/components/ui/primitives'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { GlareHover } from '@/components/ui/glare-hover'
import { TeaserVideo } from '@/components/ui/teaser-video'
import { SplitFlap } from '@/components/ui/split-flap'
import { Redacted } from '@/components/ui/text-fx'

/* ============================================================
   ACTIVITIES

   What you can actually sign up for, and what it costs. The
   member price sits first and in orange on purpose: the discount
   is the page's strongest argument for joining the society, so
   it leads rather than hiding in a footnote.

   The featured activity gets the wide card at the top, with its
   clip playing blurred underneath. While `revealed` is false the
   name is redacted and a countdown runs to the announcement;
   once it flips, the name takes its place and whatever is still
   undefined is listed as pending rather than invented.

   The visual language follows the tournament poster: black
   ground, monospaced micro-labels, an outlined "coming soon"
   pill, and the angle brackets that frame the challenge name.
   ============================================================ */

function PriceTag({ price, large = false }: { price: Price; large?: boolean }) {
  return (
    <div className="flex items-stretch gap-4">
      <div className="flex flex-col justify-end">
        <span className="label text-primary/75">Miembros IEEE CS</span>
        <span
          className={
            large
              ? 'font-display text-[clamp(2rem,4vw,2.8rem)] font-black leading-none tracking-head text-primary'
              : 'font-display text-[1.75rem] font-black leading-none tracking-head text-primary'
          }
        >
          ${price.member}
        </span>
      </div>

      <span className="w-px self-stretch bg-line" aria-hidden="true" />

      <div className="flex flex-col justify-end">
        <span className="label">Público general</span>
        <span
          className={
            large
              ? 'font-display text-[clamp(2rem,4vw,2.8rem)] font-black leading-none tracking-head text-foreground'
              : 'font-display text-[1.75rem] font-black leading-none tracking-head text-foreground'
          }
        >
          ${price.general}
        </span>
      </div>
    </div>
  )
}

function MetaRow({ meta }: { meta: NonNullable<Activity['meta']> }) {
  return (
    <dl className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {meta.map((m, i) => (
        <div key={m.label} className="flex items-center gap-6">
          {i > 0 ? <span className="h-7 w-px bg-line" aria-hidden="true" /> : null}
          <div>
            <dt className="label">{m.label}</dt>
            <dd className="mt-0.5 font-display text-[0.8125rem] font-bold uppercase tracking-[0.06em]">
              {m.value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

/* ---------- the headline activity ---------- */

function FeaturedActivity({ activity }: { activity: Activity }) {
  const c = useCountdown(activity.revealAt ?? '')
  const showCountdown = !activity.revealed && Boolean(activity.revealAt) && !c.done

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      data-reveal
      viewport={VIEWPORT}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative mt-14 rounded-card"
    >
      <GlowingEffect color="#FFA300" accent="#00B5E2" spread={44} proximity={70} className="rounded-card" />

      <div
        className="relative overflow-hidden rounded-card border border-line bg-ink-raise"
        data-cursor
      >
        {/* the clip, blurred past recognition */}
        {activity.video ? (
          <TeaserVideo
            src={activity.video}
            scale={22}
            blur={2}
            clipEnd={24}
            /* screen blending drops the clip's blacks entirely, so
               only its glows land on the card instead of a grey film */
            className="opacity-90 mix-blend-screen"
          />
        ) : null}

        {/* scrim: the copy has to stay readable over moving video */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, hsl(var(--ink) / 0.93) 0%, hsl(var(--ink) / 0.7) 44%, hsl(var(--ink) / 0.32) 100%)',
          }}
        />
        {/* scanlines: reads as a signal being withheld */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, hsl(var(--paper) / 0.5) 0px, hsl(var(--paper) / 0.5) 1px, transparent 1px, transparent 4px)',
            maskImage: 'radial-gradient(80% 70% at 60% 50%, #000, transparent)',
            WebkitMaskImage: 'radial-gradient(80% 70% at 60% 50%, #000, transparent)',
          }}
        />

        <div className="relative grid gap-10 p-8 md:p-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          {/* ---------- left: what it is ---------- */}
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-pill border border-primary/40 bg-ink/70 px-3 py-1.5">
              {activity.revealed ? (
                <Swords className="h-3 w-3 text-primary" aria-hidden="true" />
              ) : (
                <Lock className="h-3 w-3 text-primary" aria-hidden="true" />
              )}
              <span className="label text-primary">
                {activity.revealed ? 'Ya anunciado' : 'Reto por revelar'}
              </span>
            </span>

            <div>
              <span className="label block">{activity.kind}</span>
              {/* the brackets are the poster's, kept as a quote */}
              <h3 className="mt-3 flex items-center gap-3 font-display text-[clamp(1.6rem,4vw,2.6rem)] font-black uppercase leading-none tracking-head">
                <span className="text-primary" aria-hidden="true">
                  &lt;
                </span>
                {activity.revealed ? (
                  <span>{activity.name}</span>
                ) : (
                  <Redacted length={11} label="Nombre por revelar" className="text-foreground/80" />
                )}
                <span className="text-primary" aria-hidden="true">
                  /&gt;
                </span>
              </h3>
            </div>

            <p className="max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
              {activity.blurb}
            </p>

            {activity.meta ? <MetaRow meta={activity.meta} /> : null}
          </div>

          {/* ---------- right: when and how much ---------- */}
          <div className="flex flex-col justify-center gap-7 lg:border-l lg:border-line lg:pl-12">
            {showCountdown ? (
              <div className="flex flex-col gap-3">
                <span className="label">Se revela en</span>
                <div className="flex items-end gap-3">
                  {[
                    { v: c.days, u: 'd' },
                    { v: c.hours, u: 'h' },
                    { v: c.minutes, u: 'm' },
                    { v: c.seconds, u: 's' },
                  ].map((unit) => (
                    <div key={unit.u} className="flex items-end gap-1">
                      <SplitFlap
                        value={unit.v}
                        label={`${unit.v} ${unit.u}`}
                        cellClassName="h-11 w-8 font-display text-[1.15rem] font-black leading-none text-foreground"
                      />
                      <span className="pb-1 font-mono text-[10px] uppercase text-subtle">
                        {unit.u}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : activity.pending ? (
              /* The poster promises these and does not have them yet.
                 Listing them as reserved beats inventing a date. */
              <div className="flex flex-col gap-3">
                <span className="label">Por anunciar</span>
                <ul className="flex flex-col gap-2">
                  {activity.pending.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span
                        className="h-1.5 w-1.5 flex-none rounded-full border border-dashed border-primary/60"
                        aria-hidden="true"
                      />
                      <span className="font-display text-[0.9375rem] font-bold tracking-[-0.01em] text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              <span className="label">Inscripción</span>
              <PriceTag price={activity.price} large />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ---------- the ones already public ---------- */

function ActivityCard({ activity, index }: { activity: Activity; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      data-reveal
      viewport={VIEWPORT}
      transition={{ duration: 0.55, ease: EASE, delay: index * 0.07 }}
      className="h-full"
    >
      <GlareHover className="h-full rounded-card" intensity={0.08}>
        <Card className="flex h-full flex-col gap-5 p-7" data-cursor>
          <div>
            <span className="label block">{activity.kind}</span>
            <h3 className="mt-2 font-display text-[1.25rem] font-extrabold leading-tight tracking-head">
              {activity.name}
            </h3>
          </div>

          <p className="flex-1 text-[0.875rem] leading-relaxed text-muted-foreground">
            {activity.blurb}
          </p>

          {activity.meta ? <MetaRow meta={activity.meta} /> : null}

          <div className="mt-1 border-t border-line pt-5">
            <span className="label mb-3 block">Inscripción</span>
            <PriceTag price={activity.price} />
          </div>
        </Card>
      </GlareHover>
    </motion.div>
  )
}

export function Activities() {
  const featured = activities.find((a) => a.featured)
  const rest = activities.filter((a) => a !== featured)

  return (
    <section id="actividades" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Actividades"
          title="Charlas, retos y un torneo."
          lede="Cada actividad se inscribe por separado y tiene su propio valor. Ser miembro de IEEE Computer Society siempre cuesta menos."
        />

        {featured ? <FeaturedActivity activity={featured} /> : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {rest.map((a, i) => (
            <ActivityCard key={a.key} activity={a} index={i} />
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
