import type { Transition, Variants } from 'motion/react'

/* ============================================================
   MOTION VOCABULARY
   One set of curves for the whole site. Two gestures, both
   taken from the logo:

   · rise     text comes up from beneath its own mask
   · wrap     a ribbon unrolls left to right, the way the logo's
              ribbon travels round the bulb

   The hero's 3D logo has its own choreography, in
   components/brand/logo-scene.ts. If an animation is none of
   these, it should not exist.
   ============================================================ */

/** Signature curve: leaves fast, settles long. */
export const EASE = [0.22, 1, 0.36, 1] as const

/** Short spring for micro-interaction (chips, toggles). */
export const SPRING_SNAP: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.6,
}

/** Default viewport: once only, triggering a little after the element enters.
 *  The margin is vertical only — a bare '-80px' also shrinks the root on the
 *  left and right, and on a phone anything within 80px of the edge (the first
 *  word of a heading, say) would never count as visible. */
export const VIEWPORT = { once: true, margin: '-80px 0px' } as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

/** A line of the hero headline rising from beneath its mask. */
export const lineMask: Variants = {
  hidden: { y: '108%' },
  show: (i: number = 0) => ({
    y: '0%',
    transition: { duration: 1, ease: EASE, delay: 0.15 + i * 0.1 },
  }),
}

/** A ribbon unrolling from its start. */
export const wrap: Variants = {
  hidden: { scaleX: 0 },
  show: (i: number = 0) => ({
    scaleX: 1,
    transition: { duration: 1.1, ease: EASE, delay: 0.1 + i * 0.18 },
  }),
}

/** Height collapse/expand for accordions. */
export const collapse: Variants = {
  hidden: { height: 0, opacity: 0 },
  show: {
    height: 'auto',
    opacity: 1,
    transition: { height: { duration: 0.4, ease: EASE }, opacity: { duration: 0.25, delay: 0.08 } },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.32, ease: EASE }, opacity: { duration: 0.15 } },
  },
}
