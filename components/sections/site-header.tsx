'use client'

import * as React from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE, collapse } from '@/lib/motion'
import { event, navLinks } from '@/lib/content'
import { useCountdown } from '@/lib/use-countdown'
import { Btn } from '@/components/ui/primitives'
import { lockScroll, unlockScroll } from '@/components/ui/smooth-scroll'

/* ============================================================
   ANNOUNCEMENT BAR — countdown always visible
   ============================================================ */

function CountUnit({ value, unit }: { value: string; unit: string }) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="rounded-[4px] bg-ink/85 px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular text-primary">
        {value}
      </span>
      <span className="font-mono text-[9px] uppercase text-ink/70">{unit}</span>
    </span>
  )
}

function AnnouncementBar() {
  const c = useCountdown(event.startsAt)

  return (
    <div className="relative z-50 overflow-hidden bg-primary text-primary-foreground">
      <div className="shell flex items-center justify-center gap-x-2.5 gap-y-1 py-1.5 text-center sm:gap-x-3">
        <span className="font-display text-[11px] font-bold tracking-[0.01em] sm:text-[12px]">
          {c.done ? (
            'CS Tech Week Ecuador ya empezó'
          ) : (
            <>
              <span className="sm:hidden">Faltan</span>
              <span className="hidden sm:inline">Faltan para CS Tech Week Ecuador</span>
            </>
          )}
        </span>
        {!c.done ? (
          <span className="inline-flex items-center gap-1.5">
            <CountUnit value={c.days} unit="d" />
            <CountUnit value={c.hours} unit="h" />
            <CountUnit value={c.minutes} unit="m" />
            {/* seconds are redundant on narrow screens */}
            <span className="hidden sm:inline-flex">
              <CountUnit value={c.seconds} unit="s" />
            </span>
          </span>
        ) : null}
      </div>
    </div>
  )
}

/* ============================================================
   NAVIGATION
   ============================================================ */

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24))

  /* Locks background scrolling while the mobile menu is open.
     With Lenis running, plain `overflow: hidden` is no longer
     enough: its loop has to be stopped too, or the wheel keeps
     scrolling the document underneath the menu. */
  React.useEffect(() => {
    if (open) lockScroll()
    else unlockScroll()
    return () => unlockScroll()
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <AnnouncementBar />

      <motion.div
        className={cn(
          'relative border-b transition-colors duration-500 ease-cs',
          scrolled
            ? 'border-line bg-ink/80 backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        )}
      >
        <nav className="shell flex h-[var(--nav-h)] items-center justify-between gap-6">
          <a href="#top" className="flex-none" aria-label="CS Tech Week Ecuador — inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/ieee-cs-80th-white.svg"
              alt="IEEE Computer Society 80.º aniversario"
              className="h-auto w-[168px] md:w-[196px]"
            />
          </a>

          <ul className="hidden items-center gap-7 lg:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="group relative font-display text-[13px] font-semibold text-muted-foreground transition-colors duration-300 hover:text-foreground"
                >
                  {l.label}
                  <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-primary transition-[width] duration-300 ease-cs group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Btn href={event.registerUrl} className="px-3.5 py-2.5 text-[12px] sm:px-5 sm:py-3 sm:text-[13px]">
              Registrarme
            </Btn>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-[6px] border border-line text-foreground transition-colors hover:border-line-strong lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="mobile"
              variants={collapse}
              initial="hidden"
              animate="show"
              exit="exit"
              className="overflow-hidden border-t border-line bg-ink/95 backdrop-blur-xl lg:hidden"
            >
              <ul className="shell flex flex-col py-3">
                {navLinks.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.35, ease: EASE }}
                  >
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between border-b border-line py-3.5 font-display text-[15px] font-semibold text-foreground"
                    >
                      {l.label}
                      <ArrowUpRight className="h-4 w-4 text-subtle" />
                    </a>
                  </motion.li>
                ))}
                <li className="pt-4">
                  <Btn href={event.registerUrl} size="lg" className="w-full">
                    Registrarme gratis
                  </Btn>
                </li>
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </header>
  )
}
