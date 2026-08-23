'use client'

import * as React from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/* ============================================================
   SMOOTH SCROLL — Lenis

   It is the layer you feel most and see least: it changes the
   inertia of the WHOLE site. Without it, every parallax and
   every scroll beam moves in wheel-sized jumps; with it, the
   entire document travels on the same curve as everything else.

   Lenis is switched off entirely with prefers-reduced-motion:
   there the system's native scroll takes over. Anchor
   navigation, by contrast, is ALWAYS handled here — see below
   for why the native jump is not enough.
   ============================================================ */

let instance: Lenis | null = null

/** Freezes scrolling (mobile menu open, modals). */
export const lockScroll = () => {
  instance?.stop()
  document.body.style.overflow = 'hidden'
}

/** Gives scrolling back. */
export const unlockScroll = () => {
  instance?.start()
  document.body.style.overflow = ''
}

/**
 * A one-pixel nudge, out and back, over two consecutive frames.
 *
 * Not superstition: the IntersectionObservers that fire the
 * reveals (`whileInView`, `useInView`) are evaluated during the
 * rendering step, and a long instantaneous scroll jump —the kind
 * an anchor produces— can complete without a single
 * re-evaluation happening. The result is a target section stuck
 * in its initial state, invisible, until the user moves the
 * wheel. It reproduces above all with reduced-motion, where the
 * jump is genuinely instantaneous.
 *
 * A minimal displacement forces that re-evaluation and the user
 * never notices it.
 */
const nudgeObservers = () => {
  requestAnimationFrame(() => {
    window.scrollBy(0, 1)
    requestAnimationFrame(() => window.scrollBy(0, -1))
  })
}

const navOffset = () => {
  const nav = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
    10
  )
  return -((Number.isNaN(nav) ? 68 : nav) + 28)
}

/** Scrolls to an anchor, allowing for the fixed bar height. */
export const scrollToHash = (hash: string) => {
  const el = document.querySelector(hash)
  if (!el) return
  const offset = navOffset()

  if (instance) {
    instance.scrollTo(el as HTMLElement, {
      offset,
      duration: 1.25,
      onComplete: nudgeObservers,
    })
    return
  }

  window.scrollTo({
    top: (el as HTMLElement).getBoundingClientRect().top + window.scrollY + offset,
    behavior: 'auto',
  })
  nudgeObservers()
}

export function SmoothScroll() {
  const reduce = useReducedMotion()

  /* ---------- Lenis ---------- */
  React.useEffect(() => {
    if (reduce) return

    const lenis = new Lenis({
      duration: 1.05,
      /* exponential: starts immediately and brakes long — the same
         feel as the `cs` curve used across the site */
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })
    instance = lenis

    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      instance = null
    }
  }, [reduce])

  /* ---------- anchor navigation ---------- */
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return
      const target = e.target as HTMLElement | null
      const a = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const hash = a.getAttribute('href')
      if (!hash || hash === '#' || !document.querySelector(hash)) return
      e.preventDefault()
      scrollToHash(hash)
      history.replaceState(null, '', hash)
    }
    document.addEventListener('click', onClick)

    /* deep link: you arrive with the hash already in the URL */
    if (window.location.hash) nudgeObservers()

    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
