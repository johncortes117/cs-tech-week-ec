'use client'

import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE, VIEWPORT } from '@/lib/motion'
import { chapters, contests, prizes, type Contest } from '@/lib/content'
import { dayLabel, hoursLabel, toMinutes } from '@/lib/schedule'
import { Btn, SectionTitle } from '@/components/ui/primitives'
import { LoopVideo } from '@/components/ui/loop-video'

/* ============================================================
   CONTESTS

   Large panels cut from the same frame, in the order they happen —
   the first, which has no screenshot, across the full width. Each
   allowed one accent of its own world: Cloud Explorers speaks in
   shell prompts, CSS Battle in code comments, Minecraft in its
   pixel face and the green of its chat prompt. Everything else —
   type, radius, rhythm — is the site's.

   Each card carries its own day and hours. Prices stay with the
   passes, except where a contest has its own (Cloud Explorers).
   ============================================================ */

const ORDERED = [...contests].sort(
  (a, b) => a.slot.day - b.slot.day || toMinutes(a.slot.start ?? '00:00') - toMinutes(b.slot.start ?? '00:00')
)

export function Contests() {
  return (
    <section id="concursos" data-tone="night" className="tone-night relative bg-bg py-24 text-fg md:py-32">
      <div className="shell">
        <SectionTitle>Tres retos</SectionTitle>

        <div className="mt-16 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {ORDERED.map((c, i) => (
            <ContestCard key={c.key} contest={c} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8"
          data-reveal
        >
          <p className="text-[1.0625rem] text-muted">{prizes}</p>
          <Btn href="#entradas" variant="ghost" arrow="next">
            Ver entradas
          </Btn>
        </motion.div>
      </div>
    </section>
  )
}

/** The small line above each title — one accent per contest. */
const KIND: Record<Contest['key'], { className: string; format: (kind: string) => string }> = {
  cloud: { className: 'text-orange', format: (k) => `$ ${k}` },
  cssbattle: { className: 'text-cyan', format: (k) => `/* ${k} */` },
  minecraft: { className: 'text-[#78BE20]', format: (k) => `> ${k}` },
}

function ContestCard({ contest, index }: { contest: Contest; index: number }) {
  const minecraft = contest.key === 'minecraft'
  /* the one without a screenshot takes a full row: picture beside the words */
  const wide = contest.key === 'cloud'
  const host = contest.host ? chapters.find((c) => c.short === contest.host) : undefined
  const kind = KIND[contest.key]

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, ease: EASE, delay: index * 0.12 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[26px] border border-line bg-surface md:rounded-[32px]',
        wide && 'lg:col-span-2 lg:grid lg:grid-cols-[1.1fr_1fr]'
      )}
      data-reveal
    >
      <div className={cn('relative aspect-[16/10] overflow-hidden bg-night', wide && 'lg:aspect-auto lg:h-full lg:min-h-[420px]')}>
        {contest.video ? (
          <LoopVideo
            src={contest.video}
            poster={contest.image}
            label={`clip de ${contest.name}`}
            className="h-full w-full"
          />
        ) : contest.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={contest.image}
            alt={`Construcción de CS Tech Week en el servidor de ${contest.name} del evento`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[1.4s] ease-cs group-hover:scale-[1.04]"
          />
        ) : contest.key === 'cloud' ? (
          <DeployLog logo={host?.logo} hostName={host?.fullName} />
        ) : null}

        {minecraft ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/minecraft/steve.png"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none absolute bottom-0 right-[7%] h-[72%] w-auto translate-y-[14%] drop-shadow-[0_14px_24px_rgba(0,0,0,0.55)] transition-transform duration-700 ease-cs [image-rendering:pixelated] group-hover:translate-y-[4%]"
          />
        ) : null}
      </div>

      <div className={cn('flex flex-1 flex-col p-7 md:p-10', wide && 'lg:justify-center lg:p-12')}>
        {/* in a narrow card the date drops to its own line instead of both wrapping */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className={cn('whitespace-nowrap font-mono text-[12px]', kind.className)}>{kind.format(contest.kind.toLowerCase())}</p>
          <p className="meta flex-none text-fg">
            {dayLabel(contest.slot.day)}
            {hoursLabel(contest.slot) ? <span className="text-subtle"> · {hoursLabel(contest.slot)}</span> : null}
          </p>
        </div>

        <h3
          className={
            minecraft
              ? 'mt-4 font-pixel text-[clamp(1.5rem,2.9vw,2.3rem)] leading-[1.15]'
              : 'mt-3 font-display text-[clamp(2.4rem,4.4vw,3.6rem)] font-black leading-[0.9] tracking-display'
          }
        >
          {contest.name}
        </h3>

        <p className="mt-5 max-w-[42ch] text-[1rem] leading-relaxed text-muted">{contest.blurb}</p>

        {contest.facts?.length ? (
          <ul className="mt-5 space-y-1.5 text-[0.9375rem] text-fg/85">
            {contest.facts.map((f) => (
              <li key={f} className="flex gap-3">
                <span className="mt-[0.65em] h-px w-3 flex-none bg-orange" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>
        ) : null}

        {contest.partner ? (
          <a
            href={contest.partner.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-8 font-mono text-[12px] text-subtle transition-colors hover:text-fg"
          >
            con {contest.partner.name}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : host ? (
          <a
            href={host.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-8 font-mono text-[12px] text-subtle transition-colors hover:text-fg"
          >
            organiza {host.fullName}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </motion.article>
  )
}

/* ============================================================
   DEPLOY LOG — Cloud Explorers has no screenshot to show, so its
   picture is the thing it is about: a container going live. It
   says nothing about the challenge itself, which stays secret
   until the day.
   ============================================================ */

const LOG = [
  { prompt: true, text: 'docker build -t reto .' },
  { prompt: false, text: '✓ imagen lista' },
  { prompt: true, text: 'deploy --solo-puertos 443' },
  { prompt: false, text: '● en línea' },
]

function DeployLog({ logo, hostName }: { logo?: string; hostName?: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col justify-between p-5 md:p-6"
      style={{
        background:
          'radial-gradient(90% 80% at 85% 10%, hsl(var(--orange) / 0.16), transparent 60%), radial-gradient(80% 90% at 0% 100%, hsl(var(--cyan) / 0.14), transparent 65%), hsl(var(--night))',
      }}
    >
      <div className="rounded-[14px] border border-paper/10 bg-paper/[0.03] p-4 font-mono text-[11.5px] leading-[1.9] md:text-[12.5px]">
        {LOG.map((l, i) => (
          <motion.p
            key={l.text}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.35 }}
            className={l.prompt ? 'text-paper/85' : i === LOG.length - 1 ? 'text-orange' : 'text-cyan'}
            data-reveal
          >
            {l.prompt ? <span className="text-paper/40">$ </span> : null}
            {l.text}
          </motion.p>
        ))}
        <span className="mt-1 inline-block h-[1.1em] w-[0.55em] animate-pulse bg-paper/70 align-middle" />
      </div>

      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt={hostName ?? ''} className="h-9 w-auto max-w-[70%] self-start object-contain opacity-80 md:h-10" />
      ) : null}
    </div>
  )
}
