'use client'

import { motion } from 'motion/react'
import { MapPin, Sparkles, PackageCheck } from 'lucide-react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { Equator, SectionHead } from '@/components/ui/primitives'
import { Carousel360 } from '@/components/ui/image-fan-carousel'

/* ============================================================
   MERCHANDISING & STICKERS SECTION
   3D Fan Carousel showcasing the official stickers & chapter merch.
   ============================================================ */

export function Merchandising() {
  return (
    <section id="merch" className="relative scroll-mt-24 py-20 md:py-28 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, hsl(var(--orange) / 0.07), transparent 75%)',
        }}
      />

      <div className="shell flex flex-col items-center text-center">
        <SectionHead
          eyebrow="Merch Conmemorativo"
          title={
            <>
              <span className="grad-text">Merchandising</span>
            </>
          }
          lede="Contaremos con merchandising físico conmemorativo con puntos de entrega física en cada campus universitario."
          align="center"
        />

        {/* Badges row */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          data-reveal
          viewport={VIEWPORT}
          transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[0.8125rem]"
        >
        </motion.div>

        {/* 3D Interactive Fan Carousel with clean, balanced spacing */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          data-reveal
          viewport={VIEWPORT}
          transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
          className="mt-8 sm:mt-10 w-full max-w-4xl"
        >
          <Carousel360 />
        </motion.div>

        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          Desliza o usa los controles para explorar los diseños
        </p>
      </div>
    </section>
  )
}
