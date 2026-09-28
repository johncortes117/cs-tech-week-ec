'use client'

import * as React from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { cn } from '@/lib/utils'
import { EASE } from '@/lib/motion'
import { event, nav } from '@/lib/content'
import { Btn } from '@/components/ui/primitives'
import { StatusLine } from '@/components/ui/event-status'
import { Lockup } from '@/components/brand/logo'
import { lockScroll, unlockScroll } from '@/components/ui/smooth-scroll'

/* ============================================================
   HEADER

   It reads the tone of whatever section is passing underneath
   and takes it on — navy text over day, light text over night —
   so it never needs a heavy background of its own to stay
   legible. The same observer tells the nav which section you
   are in.

   The status (countdown / "Día 3 de 7" / "En vivo") appears
   here only once the hero, which states it in full, has gone.
   ============================================================ */

type Tone = 'night' | 'day'

function useSectionUnderHeader() {
  const [state, setState] = React.useState<{ tone: Tone; id: string }>({ tone: 'night', id: 'top' })

  React.useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-tone]'))
    let io: IntersectionObserver | undefined

    /* A one-pixel band across the middle of the header: whichever
       section crosses it is the one underneath. */
    const observe = () => {
      io?.disconnect()
      const line = Math.round(
        parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) / 2 || 32
      )
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            const el = e.target as HTMLElement
            setState({ tone: el.dataset.tone === 'day' ? 'day' : 'night', id: el.id })
          }
        },
        { rootMargin: `-${line}px 0px -${window.innerHeight - line - 1}px 0px` }
      )
      sections.forEach((s) => io!.observe(s))
    }

    observe()
    window.addEventListener('resize', observe)
    return () => {
      io?.disconnect()
      window.removeEventListener('resize', observe)
    }
  }, [])

  return state
}

export function SiteHeader() {
  const { tone, id } = useSectionUnderHeader()
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 12))

  /* With Lenis running, overflow: hidden alone does not stop the
     wheel: its loop has to be paused too. */
  React.useEffect(() => {
    if (open) lockScroll()
    else unlockScroll()
    return () => unlockScroll()
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const headerTone: Tone = open ? 'night' : tone
  const pastHero = id !== 'top'

  return (
    <>
      <header
        className={cn(
          `tone-${headerTone}`,
          'fixed inset-x-0 top-0 z-50 border-b text-fg transition-[background-color,border-color] duration-500 ease-cs',
          scrolled && !open
            ? 'border-line/70 bg-bg/75 backdrop-blur-xl backdrop-saturate-150'
            : 'border-transparent bg-transparent'
        )}
      >
        <nav className="shell flex h-[var(--nav-h)] items-center justify-between gap-4" aria-label="Principal">
          <a href="#top" className="flex-none" aria-label="CS Tech Week Ecuador 2026, inicio" onClick={() => setOpen(false)}>
            <Lockup />
          </a>

          <ul className="hidden items-center lg:flex">
            {nav.map((l) => {
              const current = `#${id}` === l.href
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    aria-current={current ? 'location' : undefined}
                    className={cn(
                      'relative block px-3.5 py-2 font-display text-[13px] font-semibold transition-colors duration-300',
                      current ? 'text-fg' : 'text-muted hover:text-fg'
                    )}
                  >
                    {l.label}
                    {current ? (
                      <motion.span
                        layoutId="nav-current"
                        className="absolute bottom-0 left-[calc(50%-2px)] h-1 w-1 rounded-full bg-orange"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2 sm:gap-4">
            <AnimatePresence>
              {pastHero && !open ? (
                <motion.span
                  key="status"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="hidden xl:inline-flex"
                >
                  <StatusLine compact className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted" />
                </motion.span>
              ) : null}
            </AnimatePresence>

            <Btn href={event.registerUrl} target="_blank" rel="noopener noreferrer" className="h-10 px-4 sm:px-5">
              Inscríbete
            </Btn>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="relative grid h-10 w-10 place-items-center rounded-full border border-line-strong lg:hidden"
            >
              <span className="sr-only">Menú</span>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute h-[1.5px] w-4 rounded-full bg-fg transition-transform duration-300 ease-cs',
                  open ? 'rotate-45' : '-translate-y-[3.5px]'
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'absolute h-[1.5px] w-4 rounded-full bg-fg transition-transform duration-300 ease-cs',
                  open ? '-rotate-45' : 'translate-y-[3.5px]'
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* ---------- mobile menu ---------- */}
      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            key="menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="tone-night fixed inset-0 z-40 flex flex-col bg-bg text-fg lg:hidden"
            data-lenis-prevent
          >
            <ul className="shell flex flex-1 flex-col justify-center gap-1 pt-[var(--nav-h)]">
              {nav.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.12 + i * 0.05 }}
                    className="flex items-baseline justify-between py-1.5 font-display text-[clamp(2.1rem,10vw,3.2rem)] font-black leading-none tracking-display"
                  >
                    {l.label}
                    <span className="font-mono text-[11px] font-medium tracking-[0.1em] text-subtle">
                      0{i + 1}
                    </span>
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="shell flex items-center justify-between border-t border-line py-6"
            >
              <StatusLine className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted" />
              <a href={event.social.instagram} target="_blank" rel="noopener noreferrer" className="meta text-muted">
                Instagram
              </a>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
