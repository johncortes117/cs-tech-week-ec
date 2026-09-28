'use client'

import { motion } from 'motion/react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { event, sponsorTiers } from '@/lib/content'
import { Btn, SectionTitle } from '@/components/ui/primitives'

/* ============================================================
   SPONSORS
   Logos on white tiles — several arrive with a white box of their
   own, and a tile makes that look intended. Empty tiers are not
   drawn: an empty "Platinum" row only advertises an absence.
   ============================================================ */

export function Sponsors() {
  const tiers = sponsorTiers.filter((t) => t.sponsors.length > 0)

  return (
    <section id="sponsors" data-tone="day" className="tone-day relative bg-bg pb-24 text-fg md:pb-32">
      <div className="shell border-t border-line pt-20 md:pt-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle>Con el apoyo de</SectionTitle>
          <Btn
            href={`mailto:${event.social.email}?subject=Auspicio%20CS%20Tech%20Week%20Ecuador`}
            variant="ghost"
            arrow="out"
          >
            Auspiciar
          </Btn>
        </div>

        {tiers.map((tier) => (
          <div key={tier.key} className="mt-14">
            <p className="meta">{tier.name}</p>
            <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {tier.sponsors.map((s, i) => (
                <motion.li
                  key={s.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
                  className="group flex h-32 items-center justify-center rounded-[22px] border border-line bg-white px-8 transition-[border-color,box-shadow] duration-500 hover:border-line-strong hover:shadow-[0_20px_40px_-28px_rgba(5,15,28,0.45)] md:h-44 md:px-12"
                  data-reveal
                >
                  {s.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logo}
                      alt={s.name}
                      loading="lazy"
                      className="max-h-[72px] w-auto max-w-full object-contain transition-transform duration-500 ease-cs group-hover:scale-[1.04] md:max-h-[92px]"
                    />
                  ) : (
                    <span className="font-display text-[1.6rem] font-black tracking-head text-night md:text-[2rem]">
                      {s.name}
                    </span>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
