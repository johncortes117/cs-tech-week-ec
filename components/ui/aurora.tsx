'use client'

import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   AURORA  ·  adapted from Aceternity UI ("Aurora Background")

   A veil of light drifting very slowly behind the content. The
   original is multicoloured, northern-lights style; here it is
   limited to three official tones —PMS 3015, Process Cyan and
   PMS 137— so the background can breathe without taking the site
   out of its palette.

   Rewritten for performance. Aceternity's version stacks a
   repeating gradient, `filter: blur(64px)` and an animation of
   `background-position`. That combination is one of the most
   expensive things in CSS: the blur forces a huge layer to be
   rasterised, and animating the background position invalidates
   it entirely on every frame. Measured, it cost more frames than
   any other layer on the site.

   Here the softness is baked into the radial gradients
   themselves —which are born diffuse, with no filter— and the
   movement uses `transform`, which the GPU composites without
   repainting anything.
   ============================================================ */

export function Aurora({
  className,
  intensity = 0.5,
}: {
  className?: string
  intensity?: number
}) {
  const reduce = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={{ opacity: intensity }}
    >
      <div
        className={cn('absolute -inset-[30%]', !reduce && 'animate-aurora')}
        style={{
          background: `
            radial-gradient(38% 30% at 22% 38%, hsl(var(--deep) / 0.55), transparent 68%),
            radial-gradient(30% 26% at 72% 30%, hsl(var(--cyan) / 0.22), transparent 70%),
            radial-gradient(46% 32% at 52% 74%, hsl(var(--orange) / 0.20), transparent 72%),
            radial-gradient(64% 50% at 50% 60%, hsl(var(--abyss) / 0.75), transparent 76%)`,
          willChange: 'transform',
        }}
      />
    </div>
  )
}
