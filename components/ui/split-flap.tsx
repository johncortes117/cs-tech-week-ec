'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'
import { EASE } from '@/lib/motion'

/* ============================================================
   SPLIT-FLAP  ·  adaptado de React Bits ("Split Flap Text")
   El contador no cambia de número: lo voltea, como el tablero
   de un aeropuerto. Es la pieza que convierte "faltan N días"
   en algo que se mira.

   Cada dígito es una tarjeta partida por la mitad. Al cambiar,
   la mitad superior cae sobre la inferior. Solo se re-monta el
   dígito que cambió — los segundos no obligan a voltear los
   días.
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
      {/* fondo estático: sostiene el hueco mientras la hoja gira */}
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

      {/* línea de bisagra: sin esto no se lee como tablero */}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-ink/80" />
    </span>
  )
}

/**
 * Renderiza una cadena de dígitos como tablero split-flap.
 * `label` va al lector de pantalla; las hojas son decorativas.
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
