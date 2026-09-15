'use client'

import { motion } from 'motion/react'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { event, sponsorTiers } from '@/lib/content'
import { Btn, Equator } from '@/components/ui/primitives'
import { Magnetic } from '@/components/ui/magnetic'

/* ============================================================
   SPONSORS
   A compact partner wall: the confirmed logos carry the visual
   weight and the available tiers stay intentionally quiet.
   ============================================================ */

function PartnerMark({
  sponsor,
  index,
}: {
  sponsor: (typeof sponsorTiers)[number]['sponsors'][number]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      data-reveal
      viewport={VIEWPORT}
      transition={{ duration: 0.65, ease: EASE, delay: 0.18 + index * 0.11 }}
      className="group relative flex h-40 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.11] bg-white/[0.045] px-7 py-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-primary/60 hover:bg-white/[0.075] sm:h-48 sm:px-10"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/0 blur-3xl transition-colors duration-500 group-hover:bg-primary/20"
      />
      {sponsor.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sponsor.logo}
          alt={'Logo ' + sponsor.name}
          className="relative max-h-20 max-w-full object-contain brightness-110 contrast-125 transition-transform duration-500 group-hover:scale-105 sm:max-h-24"
        />
      ) : (
        <span className="relative font-display text-[1.8rem] font-black tracking-[0.16em] text-white sm:text-[2.25rem]">
          {sponsor.name}
        </span>
      )}
    </motion.div>
  )
}

export function Sponsors() {
  const gold = sponsorTiers.find((tier) => tier.featured)
  const available = sponsorTiers.filter((tier) => !tier.featured)

  return (
    <section id="sponsors" className="relative isolate scroll-mt-24 overflow-hidden py-24 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_35%,hsl(var(--orange)_/_0.16),transparent_70%),radial-gradient(42%_38%_at_0%_85%,hsl(var(--cyan)_/_0.12),transparent_74%)]"
      />
      <div
        aria-hidden="true"
        className="tech-grid mask-fade-y pointer-events-none absolute inset-0 -z-10 opacity-30"
      />

      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          data-reveal
          viewport={VIEWPORT}
          transition={{ duration: 0.65, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-primary" />
            <span className="label text-primary">Sponsors 2026</span>
            <span className="h-px w-8 bg-primary" />
          </div>
          <h2 className="mt-5 font-display text-[clamp(2.35rem,6vw,4.6rem)] font-black leading-[0.9] tracking-display">
            Construimos el futuro <span className="grad-text">juntos.</span>
          </h2>
        </motion.div>

        {gold ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            data-reveal
            viewport={VIEWPORT}
            transition={{ duration: 0.8, ease: EASE, delay: 0.08 }}
            className="relative mt-14 overflow-hidden rounded-[28px] border border-primary/30 bg-ink-raise p-1 shadow-[0_28px_90px_-42px_rgba(255,163,0,0.75)]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_20%,hsl(var(--orange)_/_0.13)_50%,transparent_78%)]"
            />
            <div className="relative rounded-[24px] border border-white/[0.07] bg-ink/70 p-6 sm:p-9 md:p-12">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-primary/35 bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                    {gold.name} Partners
                  </span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">
                  CS Tech Week Ecuador
                </span>
              </div>

              <div className="my-8 h-px bg-gradient-to-r from-primary/50 via-white/15 to-transparent" />

              <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
                {gold.sponsors.map((sponsor, index) => (
                  <PartnerMark key={sponsor.name} sponsor={sponsor} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}

        <div className="mt-5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-ink/50 px-5 py-4 backdrop-blur-sm sm:flex-row sm:px-7">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-subtle">
            Sponsorships
          </span>
          <div className="flex items-center gap-4">
            {available.map((tier, index) => (
              <span key={tier.key} className="flex items-center gap-2 font-display text-sm font-bold text-muted-foreground">
                {index > 0 ? <span className="h-1 w-1 rounded-full bg-primary/70" /> : null}
                {tier.name}
              </span>
            ))}
            <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-primary">Disponibles</span>
          </div>
          <Magnetic radius={25} strength={0.12} maxOffset={4}>
            <Btn
              href={'mailto:' + event.social.email + '?subject=Sponsor%20CS%20Tech%20Week%20Ecuador'}
              size="md"
              variant="ghost"
            >
              Ser sponsor <ArrowUpRight className="h-3.5 w-3.5" />
            </Btn>
          </Magnetic>
        </div>
      </div>

      <div className="shell mt-24">
        <Equator label="SPONSORS → FAQ" />
      </div>
    </section>
  )
}
