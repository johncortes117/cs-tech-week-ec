'use client'

import * as React from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   TRACING BEAM  ·  adapted from Aceternity UI
   A vertical line drawn at the pace of the scroll, carrying a
   glowing head. In the agenda it does a concrete job: it tells
   you how much of the programme you have read without taking up
   any space.

   The original uses an SVG with a curved path; here the line is
   straight because the timeline is already a column — a
   decorative curve would fight the grid.
   ============================================================ */

export function TracingBeam({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 65%', 'end 60%'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 })
  const height = useTransform(progress, [0, 1], ['0%', '100%'])
  const opacity = useTransform(progress, [0, 0.06], [0, 1])

  return (
    <div ref={ref} className={cn('relative', className)}>
      {!reduce ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-px md:block"
          style={{
            background:
              'linear-gradient(to bottom, transparent, hsl(var(--line)) 6%, hsl(var(--line)) 94%, transparent)',
          }}
        >
          <motion.div
            style={{ height, opacity }}
            className="absolute inset-x-0 top-0 w-px"
          >
            <div
              className="h-full w-px"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, hsl(var(--deep)) 8%, hsl(var(--orange)) 100%)',
              }}
            />
            {/* head of the beam */}
            <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_16px_4px_hsl(38_100%_50%_/_0.45)]" />
          </motion.div>
        </div>
      ) : null}

      {children}
    </div>
  )
}
