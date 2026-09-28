'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { EASE, VIEWPORT, collapse } from '@/lib/motion'
import { faq } from '@/lib/content'
import { SectionTitle } from '@/components/ui/primitives'

/* ============================================================
   FAQ
   Only questions no other section already answers. One open at
   a time, so the list never grows into a wall of text.
   ============================================================ */

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0)

  return (
    <section id="faq" data-tone="day" className="tone-day relative bg-bg pb-24 text-fg md:pb-32">
      <div className="shell grid gap-12 border-t border-line pt-20 md:pt-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <SectionTitle>Preguntas</SectionTitle>

        <ul className="border-t border-line lg:mt-3">
          {faq.map((f, i) => {
            const isOpen = open === i
            const id = `faq-${i}`
            return (
              <motion.li
                key={f.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
                className="border-b border-line"
                data-reveal
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={id}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-[1.0625rem] font-bold leading-snug tracking-[-0.015em] md:text-[1.2rem]">
                      {f.q}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'relative grid h-8 w-8 flex-none place-items-center rounded-full border transition-colors duration-300',
                        isOpen ? 'border-fg bg-fg text-bg' : 'border-line-strong group-hover:border-fg'
                      )}
                    >
                      <span className="absolute h-[1.5px] w-3 rounded-full bg-current" />
                      <span
                        className={cn(
                          'absolute h-3 w-[1.5px] rounded-full bg-current transition-transform duration-300 ease-cs',
                          isOpen && 'scale-y-0'
                        )}
                      />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={id}
                      key="a"
                      variants={collapse}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="overflow-hidden"
                    >
                      <p className="max-w-[58ch] pb-7 pr-12 text-[1rem] leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
