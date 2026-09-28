'use client'

import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { contests, prizes, type Contest } from '@/lib/content'
import { dayLabel, hoursLabel } from '@/lib/schedule'
import { Btn, SectionTitle } from '@/components/ui/primitives'
import { LoopVideo } from '@/components/ui/loop-video'

/* ============================================================
   CONTESTS

   Two cards cut from the same frame, each allowed one accent of
   its own world: CSS Battle speaks in code comments, Minecraft in
   its pixel face and the green of its chat prompt. Everything
   else — type, radius, rhythm — is the site's.

   Each card carries its own day and hours; prices stay with the
   passes.
   ============================================================ */

export function Contests() {
  return (
    <section id="concursos" data-tone="night" className="tone-night relative bg-bg py-24 text-fg md:py-32">
      <div className="shell">
        <SectionTitle className="max-w-[15ch]">El fin de semana, se compite</SectionTitle>

        <div className="mt-16 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {contests.map((c, i) => (
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

function ContestCard({ contest, index }: { contest: Contest; index: number }) {
  const minecraft = contest.key === 'minecraft'

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, ease: EASE, delay: index * 0.12 }}
      className="group relative flex flex-col overflow-hidden rounded-[26px] border border-line bg-surface md:rounded-[32px]"
      data-reveal
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-night">
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

      <div className="flex flex-1 flex-col p-7 md:p-10">
        <div className="flex items-baseline justify-between gap-4">
          {minecraft ? (
            <p className="font-mono text-[12px] text-[#78BE20]">&gt; {contest.kind.toLowerCase()}</p>
          ) : (
            <p className="font-mono text-[12px] text-cyan">/* {contest.kind.toLowerCase()} */</p>
          )}
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

        <p className="mt-5 max-w-[40ch] text-[1rem] leading-relaxed text-muted">{contest.blurb}</p>

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
        ) : null}
      </div>
    </motion.article>
  )
}
