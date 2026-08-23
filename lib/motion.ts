import type { Transition, Variants } from 'motion/react'

/* ============================================================
   MOTION VOCABULARY
   One single set of curves and variants for the whole site. If
   an animation does not come from here, it should not exist:
   consistency is what separates "modern" from "noisy".
   ============================================================ */

/** Signature curve: leaves fast, settles long. */
export const EASE = [0.22, 1, 0.36, 1] as const

/** Standard spring — the same one we use in DevIAthon. */
export const SPRING: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 18,
  mass: 0.9,
}

/** Short spring for micro-interaction (hover, tap, chips). */
export const SPRING_SNAP: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.6,
}

/** Default viewport: once only, triggering slightly early. */
export const VIEWPORT = { once: true, margin: '-80px' } as const

/* ---------- reusable variants ---------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: SPRING },
}

/** Container that staggers its children. */
export const stagger = (staggerChildren = 0.07, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

/**
 * Headline by lines: each line rises from beneath its own mask.
 * It is the page's one orchestrated moment — used ONCE.
 */
export const lineMask: Variants = {
  hidden: { y: '110%' },
  show: (i: number = 0) => ({
    y: '0%',
    transition: { duration: 0.9, ease: EASE, delay: 0.12 + i * 0.09 },
  }),
}

/** Stroke of the equatorial line on hero load. */
export const drawLine: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1.1, ease: EASE, delay: 0.35 },
  },
}

/** Height collapse/expand for accordions. */
export const collapse: Variants = {
  hidden: { height: 0, opacity: 0 },
  show: {
    height: 'auto',
    opacity: 1,
    transition: { height: { duration: 0.36, ease: EASE }, opacity: { duration: 0.25, delay: 0.06 } },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.3, ease: EASE }, opacity: { duration: 0.15 } },
  },
}

/**
 * Returns neutralised variants when the user asks for less
 * motion: everything resolves to opacity, with no displacement.
 */
export const still: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
}
