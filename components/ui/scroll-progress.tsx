'use client'

import { motion, useScroll, useSpring } from 'motion/react'

/**
 * Reading progress bar. It sits pinned to the top edge, below
 * the announcement bar, and uses a spring so the advance feels
 * smooth rather than twitchy.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-primary via-primary to-cyan"
    />
  )
}
