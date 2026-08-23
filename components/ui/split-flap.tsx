'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'
import { EASE } from '@/lib/motion'

/* ============================================================
   SPLIT-FLAP  ·  adapted from React Bits ("Split Flap Text")
   The countdown does not change numbers: it flips them, like an
   airport board. It is the piece that turns "N days to go" into
   something you actually look at.

   Each digit is a card split down the middle. On change, the top
   half falls onto the bottom one. Only the digit that changed is
   remounted — the seconds never force the days to flip.
   ============================================================ */

function Flap({ char, className }: { char: string; className?: string }) {
  const reduce = useReducedMotion()

  if (reduce) {
    return (
      <span className={cn('flap-cell tabular', className)}>
        <span className="relative z-10">{char}</span>
      </span>
    )
  }

  return (
    <span
      className={cn('flap-cell tabular', className)}
      style={{ perspective: '260px' }}
      aria-hidden="true"
    >
      {/* static backing: it holds the gap while the flap turns */}
      <span className="absolute inset-0 grid place-items-center opacity-25">{char}</span>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          initial={{ rotateX: -88, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 78, opacity: 0 }}
          transition={{ duration: 0.42, ease: EASE }}
          style={{ transformOrigin: 'center top', backfaceVisibility: 'hidden' }}
          className="absolute inset-0 grid place-items-center"
        >
          {char}
        </motion.span>
      </AnimatePresence>

      {/* hinge line: without it this does not read as a board */}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-ink/80" />
    </span>
  )
}

/**
 * Renders a string of digits as a split-flap board.
 * `label` goes to the screen reader; the flaps are decorative.
 */
export function SplitFlap({
  value,
  label,
  className,
  cellClassName,
}: {
  value: string
  label?: string
  className?: string
  cellClassName?: string
}) {
  return (
    <span className={cn('inline-flex gap-1.5', className)} aria-label={label ?? value}>
      {value.split('').map((ch, i) => (
        <Flap key={i} char={ch} className={cellClassName} />
      ))}
    </span>
  )
}
