'use client'

import * as React from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/* ============================================================
   TARGET CURSOR  ·  adapted from React Bits
   A dot that follows the pointer and a frame that snaps onto
   anything actionable. When the frame locks onto a button, the
   site stops "having hover" and starts having aim.

   Hard rules so it never gets in the way:
   · fine pointer only (mouse/trackpad); on touch it does not exist
   · switched off by prefers-reduced-motion
   · the native cursor comes back over text fields — nobody types
     comfortably without a caret
   ============================================================ */

const SPRING_DOT = { stiffness: 900, damping: 44, mass: 0.35 }
const SPRING_FRAME = { stiffness: 320, damping: 30, mass: 0.6 }

export function TargetCursor() {
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = React.useState(false)
  const [locked, setLocked] = React.useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const fx = useMotionValue(-100)
  const fy = useMotionValue(-100)
  const fw = useMotionValue(26)
  const fh = useMotionValue(26)
  const fr = useMotionValue(99)

  const dotX = useSpring(x, SPRING_DOT)
  const dotY = useSpring(y, SPRING_DOT)
  const frameX = useSpring(fx, SPRING_FRAME)
  const frameY = useSpring(fy, SPRING_FRAME)
  const frameW = useSpring(fw, SPRING_FRAME)
  const frameH = useSpring(fh, SPRING_FRAME)

  React.useEffect(() => {
    if (reduce) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
    document.documentElement.classList.add('has-target-cursor')

    const SELECTOR =
      'a[href], button, [role="button"], [data-cursor], summary, input[type="submit"]'

    /* `getComputedStyle` forces a style recalculation. Calling it
       on every mouse move, sixty times a second, is about the most
       expensive thing a custom cursor can do — and a button's
       radius does not change. It is measured once per element. */
    const radii = new WeakMap<HTMLElement, number>()
    const radiusOf = (el: HTMLElement) => {
      let r = radii.get(el)
      if (r === undefined) {
        r = parseFloat(getComputedStyle(el).borderRadius) || 6
        radii.set(el, r)
      }
      return r
    }

    let frame = 0
    let pending: PointerEvent | null = null

    const apply = () => {
      frame = 0
      const e = pending
      if (!e) return
      x.set(e.clientX)
      y.set(e.clientY)

      const el = (e.target as HTMLElement)?.closest?.(SELECTOR) as HTMLElement | null

      if (el) {
        const r = el.getBoundingClientRect()
        const pad = 7
        fx.set(r.left + r.width / 2)
        fy.set(r.top + r.height / 2)
        fw.set(r.width + pad * 2)
        fh.set(r.height + pad * 2)
        fr.set(Math.min(radiusOf(el) + pad, 999))
        setLocked(true)
      } else {
        fx.set(e.clientX)
        fy.set(e.clientY)
        fw.set(26)
        fh.set(26)
        fr.set(99)
        setLocked(false)
      }
    }

    /* one geometry read per frame, not per event */
    const onMove = (e: PointerEvent) => {
      pending = e
      if (!frame) frame = requestAnimationFrame(apply)
    }

    const onLeave = () => {
      x.set(-100)
      y.set(-100)
      fx.set(-100)
      fy.set(-100)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      cancelAnimationFrame(frame)
      document.documentElement.classList.remove('has-target-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [reduce, x, y, fx, fy, fw, fh, fr])

  if (!enabled) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      {/* the frame that snaps on */}
      <motion.div
        style={{
          x: frameX,
          y: frameY,
          width: frameW,
          height: frameH,
          borderRadius: fr,
          translateX: '-50%',
          translateY: '-50%',
          /* explicit starting value: Motion cannot interpolate from the
             `transparent` keyword that the computed style would
             hand it */
          backgroundColor: 'hsl(38 100% 50% / 0)',
          borderColor: 'hsl(210 30% 95% / 0.32)',
        }}
        animate={{
          borderColor: locked ? 'hsl(38 100% 50% / 0.9)' : 'hsl(210 30% 95% / 0.32)',
          /* the destination has to be a colour with alpha 0, not the
             `transparent` keyword: Motion cannot interpolate
             towards a keyword */
          backgroundColor: locked ? 'hsl(38 100% 50% / 0.06)' : 'hsl(38 100% 50% / 0)',
        }}
        transition={{ duration: 0.22 }}
        className="absolute left-0 top-0 border"
      />
      {/* dot */}
      <motion.div
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: locked ? 0 : 1 }}
        transition={{ duration: 0.18 }}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_hsl(38_100%_50%_/_0.7)]"
      />
    </div>
  )
}
