'use client'

import * as React from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   COMET CARD  ·  adaptado de Aceternity UI
   Tarjeta con perspectiva 3D: rota siguiendo al cursor y un
   brillo especular se desplaza por encima como si hubiera una
   fuente de luz real sobre la pantalla.

   Dos cambios respecto al original:
   1. El original usa clases de Tailwind v4 (`perspective-distant`,
      `transform-3d`) que este proyecto (Tailwind 3.4) no compila
      — acá van como estilo en línea.
   2. El destello es blanco puro al 60 % en el original; sobre un
      fondo #05070B eso quema la tarjeta. Acá baja a 0.22 y se
      tiñe de naranja, que es como se comporta un reflejo real
      sobre una superficie oscura.
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
