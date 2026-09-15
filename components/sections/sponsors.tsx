'use client'

import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { event, sponsorTiers } from '@/lib/content'
import { Btn, Equator, SectionHead } from '@/components/ui/primitives'
import { Magnetic } from '@/components/ui/magnetic'

/* ============================================================
   SPONSORS
   A familiar event layout: confirmed logos get the stage, while
   available tiers stay concise and secondary.
   ============================================================ */

function SponsorLogo({
  sponsor,
  index,
}: {
  sponsor: (typeof sponsorTiers)[number]['sponsors'][number]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      data-reveal
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE, delay: 0.12 + index * 0.1 }}
      className="flex h-32 items-center justify-center rounded-[10px] border border-line bg-ink-raise px-7 py-5 sm:h-40 sm:px-10"
    >
      {sponsor.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sponsor.logo}
          alt={'Logo ' + sponsor.name}
          className="max-h-20 max-w-full object-contain sm:max-h-24"
        />
      ) : (
        <span className="font-display text-xl font-extrabold tracking-wide text-foreground sm:text-2xl">
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
    <section id="sponsors" className="relative scroll-mt-24 py-24 md:py-32">
      <div
        className="tech-grid mask-fade-y pointer-events-none absolute inset-0 -z-10 opacity-40"
        aria-hidden="true"
      />

      <div className="shell">
        <SectionHead
          eyebrow="Sponsors"
          title="Impulsan esta semana."
          lede="Gracias a las organizaciones que hacen posible CS Tech Week Ecuador."
          align="center"
        />

        {gold ? (
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            data-reveal
            viewport={VIEWPORT}
            transition={{ duration: 0.65, ease: EASE, delay: 0.08 }}
            className="mt-14 rounded-card border border-primary/35 bg-ink/80 p-6 shadow-[0_0_50px_rgba(255,163,0,0.09)] sm:p-8 md:p-10"
          >
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-8 bg-primary" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                {gold.name} Sponsors
              </span>
              <span className="h-px flex-1 bg-primary/25" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {gold.sponsors.map((sponsor, index) => (
                <SponsorLogo key={sponsor.name} sponsor={sponsor} index={index} />
              ))}
            </div>
          </motion.div>
        ) : null}

        <div className="mx-auto mt-5 grid max-w-2xl gap-3 sm:grid-cols-2">
          {available.map((tier, index) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              data-reveal
              viewport={VIEWPORT}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 + index * 0.08 }}
              className="flex items-center justify-between rounded-[8px] border border-dashed border-line-strong bg-ink/50 px-5 py-4"
            >
              <span className="font-display text-[1rem] font-bold text-foreground">{tier.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                Disponible
              </span>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Magnetic radius={35} strength={0.16} maxOffset={6}>
            <Btn
              href={'mailto:' + event.social.email + '?subject=Sponsor%20CS%20Tech%20Week%20Ecuador'}
              size="lg"
            >
              Conviértete en sponsor
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-cs group-hover:translate-x-1" />
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
