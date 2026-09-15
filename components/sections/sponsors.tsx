'use client'

import { motion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE, VIEWPORT } from '@/lib/motion'
import { event, sponsorPitch, sponsorTiers } from '@/lib/content'
import { Btn, Card, Equator, SectionHead } from '@/components/ui/primitives'
import { GlareHover } from '@/components/ui/glare-hover'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { Magnetic } from '@/components/ui/magnetic'

/* ============================================================
   SPONSORS
   Each tier shows confirmed sponsors first; empty tiers remain
   clearly available for future partners.
   ============================================================ */

function TierCard({ tier, index }: { tier: (typeof sponsorTiers)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      data-reveal
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.07 }}
      className="relative h-full rounded-card"
    >
      {/* Only the featured tier lights the arc: if every card
          glowed, none of them would be the featured one. */}
      {tier.featured ? (
        <GlowingEffect color="#FFA300" accent="#00B5E2" spread={40} className="rounded-card" />
      ) : null}

      <GlareHover className="h-full rounded-card" intensity={tier.featured ? 0.13 : 0.07}>
        <Card
          className={cn('flex h-full flex-col p-6', tier.featured && 'grad-border')}
          data-cursor
        >
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className={cn(
              'font-display text-[1.125rem] font-extrabold tracking-[-0.02em]',
              tier.featured && 'text-primary'
            )}
          >
            {tier.name}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
            {tier.sponsors.length > 0 ? `${tier.sponsors.length} confirmados` : 'Disponible'}
          </span>
        </div>

        <p className="mt-3 flex-1 text-[0.875rem] leading-relaxed text-muted-foreground">
          {tier.blurb}
        </p>

        {tier.sponsors.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-2">
            {tier.sponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="flex min-h-14 items-center justify-center rounded-[5px] border border-line bg-ink/60 px-3 py-2"
              >
                {sponsor.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sponsor.logo}
                    alt={`Logo ${sponsor.name}`}
                    className="max-h-10 max-w-full object-contain"
                  />
                ) : (
                  <span className="font-display text-sm font-bold tracking-wide text-foreground">
                    {sponsor.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="mt-6 flex h-14 items-center justify-center rounded-[5px] border border-dashed border-line-strong bg-ink/60 font-mono text-[10px] uppercase tracking-[0.14em] text-primary/60">
            Tier disponible
          </span>
        )}
        </Card>
      </GlareHover>
    </motion.div>
  )
}

export function Sponsors() {
  return (
    <section id="sponsors" className="relative scroll-mt-24 py-24 md:py-32">
      {/* technical grid only behind this block */}
      <div
        className="tech-grid mask-fade-y pointer-events-none absolute inset-0 -z-10 opacity-50"
        aria-hidden="true"
      />

      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
          <div>
            <SectionHead eyebrow="Sponsors" title={sponsorPitch.title} />

            <ul className="mt-8 flex flex-col gap-3.5">
              {sponsorPitch.points.map((p, i) => (
                <motion.li
                  key={p}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  data-reveal
                  viewport={VIEWPORT}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.07 }}
                  className="flex gap-3 text-[0.9375rem] leading-relaxed text-muted-foreground"
                >
                  <Check className="mt-1 h-4 w-4 flex-none text-cyan" aria-hidden="true" />
                  <span>{p}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-5">
              <Magnetic radius={35} strength={0.16} maxOffset={6}>
                <Btn
                  href={`mailto:${event.social.email}?subject=Sponsor%20CS%20Tech%20Week%20Ecuador`}
                  size="lg"
                >
                  Pedir el dossier
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-cs group-hover:translate-x-1" />
                </Btn>
              </Magnetic>
              <Magnetic radius={35} strength={0.16} maxOffset={6}>
                <Btn href={`mailto:${event.social.email}`} size="lg" variant="ghost">
                  Hablar con el comité
                </Btn>
              </Magnetic>
            </div>
          </div>

          <div className="grid gap-4">
            {sponsorTiers.map((t, i) => (
              <TierCard key={t.key} tier={t} index={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="shell mt-24">
        <Equator label="SPONSORS → FAQ" />
      </div>
    </section>
  )
}
