'use client'

import * as React from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { EASE, VIEWPORT } from '@/lib/motion'
import { orbitNodes } from '@/lib/content'
import { cn } from '@/lib/utils'

/* ============================================================
   CONSTELACIÓN TECNOLÓGICA
   Las órbitas no giran alrededor de un punto cualquiera: giran
   alrededor de la línea ecuatorial, que es la base del cuadro.
   El domo de puntos es el hemisferio visto desde el paralelo 0.
   Todo se calcula de forma determinista — sin Math.random —
   para que servidor y cliente rindan idéntico.
   ============================================================ */

const VB = { w: 1200, h: 560 }
const CX = VB.w / 2
const CY = VB.h
const RADII = [240, 370, 495]

/**
 * Posición del nodo en porcentaje del contenedor.
 * Se redondea a 3 decimales a propósito: sin eso, servidor y
 * cliente serializan el flotante distinto y React reporta un
 * desajuste de hidratación.
 */
function polarPct(ring: number, angleDeg: number) {
  const r = RADII[ring] ?? RADII[RADII.length - 1]
  const rad = (angleDeg * Math.PI) / 180
  const x = CX + r * Math.cos(rad)
  const y = CY + r * Math.sin(rad)
  return {
    left: `${((x / VB.w) * 100).toFixed(3)}%`,
    top: `${((y / VB.h) * 100).toFixed(3)}%`,
  }
}

/** Domo de puntos: filas horizontales dentro de un semicírculo. */
function DotDome({ radius = 200, rows = 18, gap = 12 }) {
  const dots: { x: number; y: number; o: number }[] = []
  for (let i = 0; i < rows; i++) {
    const y = -(i * (radius / rows))
    const halfWidth = Math.sqrt(Math.max(0, radius * radius - y * y))
    const count = Math.max(1, Math.floor((halfWidth * 2) / gap))
    for (let j = 0; j <= count; j++) {
      const x = -halfWidth + (j * (halfWidth * 2)) / count
      // los puntos se apagan hacia el borde del domo
      const edge = Math.hypot(x, y) / radius
      dots.push({ x, y, o: 0.5 * (1 - edge * 0.85) })
    }
  }
  return (
    <g transform={`translate(${CX} ${CY})`}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={1.35} fill="hsl(var(--cyan))" opacity={d.o} />
      ))}
    </g>
  )
}

export function Orbit() {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])

  return (
    <div ref={ref} className="relative isolate overflow-hidden" aria-hidden="true">
      {/* resplandor bajo el horizonte */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(48% 62% at 50% 100%, hsl(var(--deep) / 0.36), transparent 70%),
            radial-gradient(28% 40% at 50% 96%, hsl(var(--orange) / 0.14), transparent 72%)
          `,
        }}
      />

      <motion.div
        style={reduce ? undefined : { y }}
        className="relative mx-auto w-full max-w-[1400px]"
      >
        <div className="relative aspect-[1200/560] w-full">
          <svg
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMax meet"
          >
            <defs>
              <linearGradient id="ring-grad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="hsl(var(--orange))" stopOpacity="0.30" />
                <stop offset="45%" stopColor="hsl(var(--paper))" stopOpacity="0.10" />
                <stop offset="100%" stopColor="hsl(var(--paper))" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* anillos orbitales */}
            {RADII.map((r, i) => (
              <motion.circle
                key={r}
                cx={CX}
                cy={CY}
                r={r}
                fill="none"
                stroke="url(#ring-grad)"
                strokeWidth={1}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                data-reveal
                viewport={VIEWPORT}
                transition={{ duration: 1.5, ease: EASE, delay: 0.12 * i }}
              />
            ))}

            <DotDome />
          </svg>

          {/* nodos de tecnología */}
          {orbitNodes.map((n, i) => {
            const p = polarPct(n.ring, n.angle)
            return (
              <div
                key={n.label}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2',
                  'edge' in n && n.edge ? 'hidden md:block' : undefined
                )}
                style={{ left: p.left, top: p.top }}
              >
                <motion.span
                  className="inline-flex items-center rounded-pill border border-line bg-ink-raise/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground md:px-3 md:py-1.5 md:text-[11px]"
                  initial={{ opacity: 0, scale: 0.7 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  data-reveal
                  viewport={VIEWPORT}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.35 + i * 0.055 }}
                >
                  {n.label}
                </motion.span>
              </div>
            )
          })}
        </div>

        {/* la línea ecuatorial cierra el cuadro */}
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, hsl(var(--orange) / 0.7) 34%, hsl(var(--line-strong)) 70%, transparent)',
          }}
        />
      </motion.div>
    </div>
  )
}
