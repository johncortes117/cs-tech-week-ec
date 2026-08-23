'use client'

import * as React from 'react'
import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   SCROLL VELOCITY  ·  adapted from React Bits
   A band of text that scrolls on its own and changes speed —
   even direction — depending on how fast you scroll. It is the
   detail that makes the page feel "connected" to the gesture
   rather than merely reacting to it.

   Here it also does an editorial job: it separates the hero from
   the rest and repeats the tagline like a ticker tape.
   ============================================================ */

function wrap(min: number, max: number, v: number) {
  const range = max - min
  const mod = (((v - min) % range) + range) % range
  return mod + min
}

export function ScrollVelocity({
  children,
  baseVelocity = 34,
  copies = 4,
  className,
  itemClassName,
}: {
  children: React.ReactNode
  /** px/s at rest. Negative reverses the direction. */
  baseVelocity?: number
  copies?: number
  className?: string
  itemClassName?: string
}) {
  const reduce = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, [0, 1200], [0, 4], { clamp: false })

  const copyRef = React.useRef<HTMLSpanElement>(null)
  const [copyWidth, setCopyWidth] = React.useState(0)

  React.useLayoutEffect(() => {
    const measure = () => setCopyWidth(copyRef.current?.offsetWidth ?? 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [children])

  const x = useTransform(baseX, (v) => (copyWidth === 0 ? '0px' : `${wrap(-copyWidth, 0, v)}px`))

  /* Offscreen the band does not move: it is an every-frame loop
     that, if not switched off, keeps moving a layer nobody is
     looking at for the whole visit. */
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const visible = React.useRef(true)

  React.useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const direction = React.useRef(1)
  useAnimationFrame((_t, delta) => {
    if (reduce || !visible.current) return
    let moveBy = direction.current * baseVelocity * (delta / 1000)
    const f = factor.get()
    if (f < 0) direction.current = -1
    else if (f > 0) direction.current = 1
    moveBy += direction.current * moveBy * f
    baseX.set(baseX.get() + moveBy)
  })

  return (
    <div ref={wrapRef} className={cn('relative w-full overflow-hidden', className)} aria-hidden="true">
      <motion.div className="flex w-max flex-nowrap" style={reduce ? undefined : { x }}>
        {Array.from({ length: copies }).map((_, i) => (
          <span key={i} ref={i === 0 ? copyRef : undefined} className={cn('flex-none', itemClassName)}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
