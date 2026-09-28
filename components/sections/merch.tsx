'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { merch } from '@/lib/content'
import { SectionTitle } from '@/components/ui/primitives'

/* ============================================================
   MERCH

   The sticker sheets are physical things, so they behave like
   paper on a desk: tilted, casting a shadow, and loose enough to
   be picked up and moved around. Nothing else happens here.
   ============================================================ */

const LAYOUT = [
  { className: 'left-0 top-[4%] w-[74%] sm:w-[62%]', rotate: -5 },
  { className: 'right-0 bottom-[2%] w-[70%] sm:w-[54%]', rotate: 4 },
] as const

export function Merch() {
  const desk = React.useRef<HTMLDivElement>(null)

  return (
    <section id="merch" data-tone="day" className="tone-day relative overflow-hidden bg-bg py-24 text-fg md:py-32">
      <div className="shell grid items-center gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
        <div>
          <SectionTitle>Merch</SectionTitle>
          <p className="mt-6 max-w-[30ch] text-[1.0625rem] leading-relaxed text-muted sm:text-lg">{merch.blurb}</p>
        </div>

        <div ref={desk} className="relative h-[300px] sm:h-[440px] lg:h-[500px]">
          {merch.sheets.map((s, i) => (
            <motion.div
              key={s.src}
              drag
              dragConstraints={desk}
              dragElastic={0.12}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 24 }}
              initial={{ opacity: 0, y: 60, rotate: LAYOUT[i].rotate * 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: LAYOUT[i].rotate }}
              whileHover={{ y: -8 }}
              whileDrag={{ scale: 1.04, rotate: 0, zIndex: 10 }}
              viewport={VIEWPORT}
              transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.15 }}
              className={`absolute cursor-grab touch-pan-y rounded-[18px] bg-white p-3 shadow-[0_2px_4px_rgba(5,15,28,0.06),0_24px_48px_-20px_rgba(5,15,28,0.35)] active:cursor-grabbing sm:p-4 ${LAYOUT[i].className}`}
              data-reveal
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.alt}
                width={s.width}
                height={s.height}
                loading="lazy"
                draggable={false}
                className="pointer-events-none h-auto w-full select-none rounded-[10px] mix-blend-multiply brightness-[1.07]"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
