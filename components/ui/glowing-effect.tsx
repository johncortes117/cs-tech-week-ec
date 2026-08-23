'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   GLOWING EFFECT  ·  adapted from Aceternity UI

   An arc of light travels around the card's border, always
   pointing at the cursor. The original uses a fixed rainbow
   palette; here the arc is built from the track's colour plus a
   brand accent, so each card lights up in ITS colour and the
   system still reads as one.

   Two deep differences from the original, both about cost:

   · A SINGLE EAR. Aceternity's component registers one
     `pointermove` listener and one `scroll` listener per
     instance. With eight cards on screen that is eight geometry
     reads —eight reflows— for every mouse move. Here there is a
     single module-level listener that distributes the position
     to every instance within one rAF.

   · NO `animate()` PER MOVE. The original launches a fresh
     Motion animation on every event, discarded on the next one.
     Here the angle is chased with an interpolation inside the
     same loop: same visual result, zero garbage.

   The blurred halo ring is gone too: `filter: blur()` over eight
   elements forces eight extra surfaces to be rasterised per
   frame, and measured it cost more than everything else put
   together. The crisp arc already reads as light.
   ============================================================ */

type Sub = (x: number, y: number) => void

const subs = new Set<Sub>()
let listening = false
let lastX = -9999
let lastY = -9999
let frame = 0

function flush() {
  frame = 0
  for (const s of subs) s(lastX, lastY)
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(flush)
}

function subscribe(fn: Sub): () => void {
  subs.add(fn)
  if (!listening) {
    listening = true
    document.addEventListener(
      'pointermove',
      (e) => {
        lastX = e.clientX
        lastY = e.clientY
        schedule()
      },
      { passive: true }
    )
    /* on scroll the card moves under a still cursor: it has to be
       recomputed with the last known position */
    window.addEventListener('scroll', schedule, { passive: true })
  }
  return () => {
    subs.delete(fn)
  }
}

type Props = {
  /** 6-digit hex. Defaults to PMS 137 orange. */
  color?: string
  /** Second tone of the arc. Defaults to Process cyan. */
  accent?: string
  /** Dead radius in the centre: stops the arc jittering as it crosses the middle. */
  inactiveZone?: number
  /** Margin around the card that already counts as "near". */
  proximity?: number
  /** Arc aperture, in degrees. */
  spread?: number
  borderWidth?: number
  className?: string
  disabled?: boolean
}

export const GlowingEffect = React.memo(function GlowingEffect({
  color = '#FFA300',
  accent = '#00B5E2',
  inactiveZone = 0.55,
  proximity = 52,
  spread = 36,
  borderWidth = 1,
  className,
  disabled = false,
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null)
  const angle = React.useRef({ current: 0, target: 0 })
  const reduce = useReducedMotion()
  const off = disabled || reduce

  React.useEffect(() => {
    if (off) return

    const update = (mx: number, my: number) => {
      const el = ref.current
      if (!el) return
      const { left, top, width, height } = el.getBoundingClientRect()

      /* outside the window there is nothing to light */
      if (top > window.innerHeight || top + height < 0) {
        el.style.setProperty('--active', '0')
        return
      }

      const cx = left + width * 0.5
      const cy = top + height * 0.5
      const dead = 0.5 * Math.min(width, height) * inactiveZone

      if (Math.hypot(mx - cx, my - cy) < dead) {
        el.style.setProperty('--active', '0')
        return
      }

      const near =
        mx > left - proximity &&
        mx < left + width + proximity &&
        my > top - proximity &&
        my < top + height + proximity

      el.style.setProperty('--active', near ? '1' : '0')
      if (!near) return

      /* short way round the circle: without this the arc does a full
         lap every time the angle crosses 360° */
      const target = (180 * Math.atan2(my - cy, mx - cx)) / Math.PI + 90
      const a = angle.current
      a.target = a.current + ((((target - a.current) % 360) + 540) % 360) - 180
      a.current += (a.target - a.current) * 0.12
      el.style.setProperty('--start', String(a.current))

      /* while the arc is still chasing the cursor, ask for another
         frame even if the mouse has stopped */
      if (Math.abs(a.target - a.current) > 0.4) schedule()
    }

    return subscribe(update)
  }, [off, inactiveZone, proximity])

  if (off) return null

  /* The arc: a single conic gradient starting at --start (the
     angle towards the cursor) and fading out --spread degrees to
     either side. The track colour takes the centre and the
     accent the edges, which is how light behaves as it grazes a
     metallic rim. */
  const gradient = `conic-gradient(
      from calc((var(--start) - var(--spread)) * 1deg),
      transparent 0deg,
      ${accent}00 calc(var(--spread) * 0.15deg),
      ${accent} calc(var(--spread) * 0.6deg),
      ${color} calc(var(--spread) * 1deg),
      ${accent} calc(var(--spread) * 1.4deg),
      ${accent}00 calc(var(--spread) * 1.85deg),
      transparent calc(var(--spread) * 2deg),
      transparent 360deg
    )`

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={
        {
          '--spread': spread,
          '--start': '0',
          '--active': '0',
          '--glow-border-width': `${borderWidth}px`,
          '--glow-gradient': gradient,
        } as React.CSSProperties
      }
      className={cn('pointer-events-none absolute inset-0 rounded-[inherit]', className)}
    >
      <div className="glow-ring rounded-[inherit]" />
    </div>
  )
})
