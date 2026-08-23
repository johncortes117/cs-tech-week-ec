'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* ============================================================
   GLARE HOVER  ·  adapted from React Bits
   A band of light crosses the card diagonally on hover, like the
   reflection on a shop window. It is the cheapest effect of them
   all —a single transform transition— and the one that adds the
   most "finished product" per line of code.

   The angle, width and duration come through CSS variables so
   the :hover state can rewrite the transform without fighting
   the inline style.
   ============================================================ */

export function GlareHover({
  children,
  className,
  /** Band width, as a % of the container. */
  width = 26,
  /** Tilt, in degrees. */
  angle = -22,
  intensity = 0.1,
  duration = 850,
}: {
  children: React.ReactNode
  className?: string
  width?: number
  angle?: number
  intensity?: number
  duration?: number
}) {
  return (
    <div
      className={cn('glare relative overflow-hidden', className)}
      style={
        {
          '--glare-angle': `${angle}deg`,
          '--glare-duration': `${duration}ms`,
        } as React.CSSProperties
      }
    >
      {children}
      <span
        aria-hidden="true"
        className="glare-sheen pointer-events-none absolute inset-y-[-45%] left-0 z-10 motion-reduce:hidden"
        style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, transparent, hsl(var(--paper) / ${intensity}) 42%, hsl(var(--orange) / ${
            intensity * 0.85
          }) 58%, transparent)`,
        }}
      />
    </div>
  )
}
