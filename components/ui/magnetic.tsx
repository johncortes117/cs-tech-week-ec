'use client'

import * as React from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   MAGNET  ·  adapted from React Bits
   The element lets itself be pulled by the cursor within a
   radius and springs back on exit. Used ONLY on calls to action:
   if everything is magnetic, nothing is.

   Active only with a fine pointer (mouse/trackpad). On touch the
   effect does not exist and the button behaves like a button.
   ============================================================ */

export function Magnetic({
  children,
  radius = 40,
  strength = 0.18,
  maxOffset = 7,
  className,
}: {
  children: React.ReactNode
  /** Distance in px from the edge at which it starts pulling. */
  radius?: number
  /** How far it moves relative to the cursor distance (0–1). */
  strength?: number
  /** Maximum displacement allowed in pixels. */
  maxOffset?: number
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: 350, damping: 25, mass: 0.4 }
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)

  React.useEffect(() => {
    if (reduce) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let frame = 0

    /* Measurement is batched into one rAF: there are several
       magnets on the page and a getBoundingClientRect per pointer
       move forces as many reflows as there are buttons. */
    const onMove = (e: PointerEvent) => {
      if (frame) return
      const { clientX, clientY } = e
      frame = requestAnimationFrame(() => {
        frame = 0
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        const dx = clientX - (r.left + r.width / 2)
        const dy = clientY - (r.top + r.height / 2)

        /* the radius is measured from the edge, not from the centre:
           that way a wide button and a narrow one pull from equally far */
        const inside =
          Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius

        if (inside) {
          const targetX = Math.max(-maxOffset, Math.min(maxOffset, dx * strength))
          const targetY = Math.max(-maxOffset, Math.min(maxOffset, dy * strength))
          x.set(targetX)
          y.set(targetY)
        } else {
          x.set(0)
          y.set(0)
        }
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [radius, strength, maxOffset, reduce, x, y])

  if (reduce) return <span className={cn('inline-flex', className)}>{children}</span>

  return (
    <motion.span ref={ref} style={{ x: sx, y: sy }} className={cn('inline-flex', className)}>
      {children}
    </motion.span>
  )
}
