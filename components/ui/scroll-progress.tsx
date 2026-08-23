'use client'

import { motion, useScroll, useSpring } from 'motion/react'

/**
 * Barra de progreso de lectura. Vive pegada al borde superior,
 * debajo de la barra de anuncio, y usa un spring para que el
 * avance se sienta suave en lugar de nervioso.
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
