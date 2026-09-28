'use client'

import { motion } from 'motion/react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { event, footerNote, nav } from '@/lib/content'
import { Btn } from '@/components/ui/primitives'
import { StatusLine } from '@/components/ui/event-status'
import { Lockup, Mark } from '@/components/brand/logo'

/* ============================================================
   CLOSING + FOOTER

   The page ends where the hero began: on the line. The mark sits
   on latitude zero like a sun on the horizon, and the last
   sentence names the place every Ecuadorian knows the line by.
   ============================================================ */

export function Closing() {
  return (
    <footer data-tone="night" id="cierre" className="tone-night relative overflow-hidden bg-bg text-fg">
      <div className="shell relative flex flex-col items-center pb-24 pt-32 text-center md:pb-32 md:pt-44">
        {/* the mark rising over the line */}
        <div className="relative flex w-full justify-center">
          <motion.div
            aria-hidden="true"
            className="absolute left-1/2 top-[46%] h-px w-[200vw] origin-center"
            style={{
              x: '-50%',
              background:
                'linear-gradient(90deg, transparent 10%, hsl(var(--fg) / 0.14) 35%, hsl(var(--orange) / 0.75) 50%, hsl(var(--fg) / 0.14) 65%, transparent 90%)',
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={VIEWPORT}
            transition={{ duration: 1.6, ease: EASE }}
            data-reveal
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
            data-reveal
          >
            <Mark className="relative h-[120px] w-auto md:h-[150px]" />
          </motion.div>
        </div>

        <h2 className="mt-14 max-w-[14ch] font-display text-[clamp(2.4rem,6.6vw,5.6rem)] font-black leading-[0.92] tracking-tightest">
          {event.closing}
          <span className="text-orange">.</span>
        </h2>

        <div className="mt-10 flex flex-col items-center gap-6">
          <Btn href={event.registerUrl} target="_blank" rel="noopener noreferrer" size="lg" arrow="next">
            Inscríbete
          </Btn>
          <StatusLine className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle" />
        </div>
      </div>

      <div className="shell border-t border-line py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-6">
            <a href="#top" aria-label="Volver al inicio" className="w-fit">
              <Lockup />
            </a>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/ieee-cs-80th-white.svg"
              alt="IEEE Computer Society, 80 años"
              loading="lazy"
              className="h-auto w-[150px] opacity-80"
            />
          </div>

          <nav aria-label="Pie de página" className="grid grid-cols-2 gap-x-16 gap-y-3 sm:grid-cols-3">
            {nav.map((l) => (
              <a key={l.href} href={l.href} className="font-display text-[14px] font-semibold text-muted transition-colors hover:text-fg">
                {l.label}
              </a>
            ))}
            <a
              href={event.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-[14px] font-semibold text-muted transition-colors hover:text-fg"
            >
              Instagram
            </a>
            <a
              href={`mailto:${event.social.email}`}
              className="font-display text-[14px] font-semibold text-muted transition-colors hover:text-fg"
            >
              {event.social.email}
            </a>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-start md:justify-between md:gap-12">
          <p className="max-w-[80ch] text-[12px] leading-relaxed text-subtle">{footerNote}</p>
          <p className="flex-none font-mono text-[11px] tracking-[0.12em] text-subtle">
            © {event.year} · <span className="text-orange">0°00′00″</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
