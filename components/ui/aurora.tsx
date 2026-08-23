'use client'

import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   AURORA  ·  adaptado de Aceternity UI ("Aurora Background")

   Un velo de luz que se desplaza muy lento por detrás del
   contenido. El original es multicolor tipo aurora boreal; acá
   se limita a tres tonos oficiales —PMS 3015, Process Cyan y
   PMS 137— para que el fondo respire sin sacar al sitio de su
   paleta.

   Reescrito por rendimiento. La versión de Aceternity apila un
   degradado repetido, `filter: blur(64px)` y una animación de
   `background-position`. Esa combinación es de las más caras que
   existen en CSS: el desenfoque obliga a rasterizar una capa
   enorme y animar la posición del fondo la invalida entera en
   cada cuadro. Medido, costaba más fotogramas que ninguna otra
   capa del sitio.

   Acá la suavidad está horneada en los propios degradados
   radiales —que ya nacen difusos, sin filtro— y el movimiento se
   hace con `transform`, que la GPU compone sin repintar nada.
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
