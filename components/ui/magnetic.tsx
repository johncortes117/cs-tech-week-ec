'use client'

import * as React from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   MAGNET  ·  adaptado de React Bits
   El elemento se deja atraer por el cursor dentro de un radio y
   vuelve a su sitio con resorte al salir. Se usa SOLO en los
   llamados a la acción: si todo es magnético, nada lo es.

   Solo actúa con puntero fino (mouse/trackpad). En táctil el
   efecto no existe y el botón se comporta como un botón.
   ============================================================ */

export function Magnetic({
  children,
  radius = 90,
  strength = 0.32,
  className,
}: {
  children: React.ReactNode
  /** Distancia en px desde el borde a la que empieza a atraer. */
  radius?: number
  /** Cuánto se desplaza respecto a la distancia al cursor (0–1). */
  strength?: number
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: 260, damping: 20, mass: 0.55 }
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)

  React.useEffect(() => {
    if (reduce) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let frame = 0

    /* La medición se agrupa en un rAF: hay varios imanes en la
       página y un getBoundingClientRect por cada movimiento del
       puntero fuerza tantos reflows como botones haya. */
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

        /* el radio se mide desde el borde, no desde el centro:
           así un botón ancho y uno angosto atraen igual de lejos */
        const inside =
          Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius

        x.set(inside ? dx * strength : 0)
        y.set(inside ? dy * strength : 0)
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [radius, strength, reduce, x, y])

  if (reduce) return <span className={cn('inline-flex', className)}>{children}</span>

  return (
    <motion.span ref={ref} style={{ x: sx, y: sy }} className={cn('inline-flex', className)}>
      {children}
    </motion.span>
  )
}
