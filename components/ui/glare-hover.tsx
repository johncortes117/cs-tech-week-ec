'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* ============================================================
   GLARE HOVER  ·  adaptado de React Bits
   Una banda de luz cruza la tarjeta en diagonal al pasar el
   cursor, como el reflejo de una vitrina. Es el efecto más
   barato de todos —una sola transición de transform— y el que
   más "producto terminado" aporta por línea de código.

   El ángulo, el ancho y la duración salen por variables CSS
   para que el estado :hover pueda reescribir el transform sin
   pelearse con el estilo en línea.
   ============================================================ */

export function GlareHover({
  children,
  className,
  /** Ancho de la banda, en % del contenedor. */
  width = 26,
  /** Inclinación, en grados. */
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
