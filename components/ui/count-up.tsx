'use client'

import * as React from 'react'
import { animate, useInView } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/* ============================================================
   COUNT UP  ·  adapted from React Bits
   The figure counts up from 0 when the block enters the
   viewport. With the `cs` curve (fast at the start, long settle)
   the number seems to brake on its own rather than being cut.
   ============================================================ */

export function CountUp({
  to,
  from = 0,
  duration = 1.6,
  delay = 0,
  className,
  suffix = '',
  prefix = '',
}: {
  to: number
  from?: number
  duration?: number
  delay?: number
  className?: string
  suffix?: string
  prefix?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()
  const [value, setValue] = React.useState(from)

  React.useEffect(() => {
    /* The motion preference is checked BEFORE the viewport: if we
       waited to come into view, an anchor jump that never fires
       the observer would leave the figure at zero, which is not
       "no animation" — it is wrong data. */
    if (reduce) {
      setValue(to)
      return
    }
    if (!inView) return
    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, from, to, duration, delay, reduce])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  )
}
