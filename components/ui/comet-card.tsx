'use client'

import * as React from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   COMET CARD  ·  adapted from Aceternity UI
   A card with 3D perspective: it rotates following the cursor
   and a specular highlight travels over it as if there were a
   real light source above the screen.

   Two changes from the original:
   1. The original uses Tailwind v4 classes (`perspective-distant`,
      `transform-3d`) that this project (Tailwind 3.4) does not
      compile — here they are inline styles.
   2. The highlight is pure white at 60 % in the original; over a
      #05070B background that blows the card out. Here it drops
      to 0.22 and is tinted orange, which is how a real
      reflection behaves on a dark surface.
   ============================================================ */

export function CometCard({
  rotateDepth = 12,
  translateDepth = 14,
  glare = true,
  className,
  innerClassName,
  children,
}: {
  rotateDepth?: number
  translateDepth?: number
  glare?: boolean
  className?: string
  innerClassName?: string
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const config = { stiffness: 260, damping: 26, mass: 0.7 }
  const sx = useSpring(x, config)
  const sy = useSpring(y, config)

  const rotateX = useTransform(sy, [-0.5, 0.5], [`-${rotateDepth}deg`, `${rotateDepth}deg`])
  const rotateY = useTransform(sx, [-0.5, 0.5], [`${rotateDepth}deg`, `-${rotateDepth}deg`])
  const translateX = useTransform(sx, [-0.5, 0.5], [`-${translateDepth}px`, `${translateDepth}px`])
  const translateY = useTransform(sy, [-0.5, 0.5], [`${translateDepth}px`, `-${translateDepth}px`])

  const glareX = useTransform(sx, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(sy, [-0.5, 0.5], [0, 100])
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,205,140,0.55) 0%, rgba(255,255,255,0.28) 22%, rgba(255,255,255,0) 62%)`

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  if (reduce) {
    return <div className={cn('relative', className)}>{children}</div>
  }

  return (
    <div
      className={cn('group relative', className)}
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{
          rotateX,
          rotateY,
          translateX,
          translateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ scale: 1, z: 0 }}
        whileHover={{ scale: 1.035, z: 40, transition: { duration: 0.25 } }}
        className={cn(
          'relative rounded-card',
          'shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9),0_2px_10px_-4px_rgba(0,0,0,0.7)]',
          innerClassName
        )}
      >
        {children}

        {glare ? (
          <motion.div
            aria-hidden="true"
            style={{ background: glareBg }}
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-60"
          />
        ) : null}
      </motion.div>
    </div>
  )
}
