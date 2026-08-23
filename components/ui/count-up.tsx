'use client'

import * as React from 'react'
import { animate, useInView } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/* ============================================================
   COUNT UP  ·  adaptado de React Bits
   La cifra sube desde 0 cuando el bloque entra en pantalla.
   Con la curva `cs` (rápida al inicio, asentamiento largo) el
   número parece frenar solo, no cortarse.
   ============================================================ */

export function CountUp({
  to,
  from = 0,
  duration = 1.6,
  delay = 0,
  className,
  suffix = '',
  prefix = '',
}: {
  to: number
  from?: number
  duration?: number
  delay?: number
  className?: string
  suffix?: string
  prefix?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const reduce = useReducedMotion()
  const [value, setValue] = React.useState(from)

  React.useEffect(() => {
    /* La preferencia de movimiento se comprueba ANTES que el
       viewport: si esperáramos a entrar en pantalla, un salto de
       ancla que no dispare el observador dejaría la cifra en cero,
       que no es "sin animación" — es un dato equivocado. */
    if (reduce) {
      setValue(to)
      return
    }
    if (!inView) return
    const controls = animate(from, to, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, from, to, duration, delay, reduce])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  )
}
