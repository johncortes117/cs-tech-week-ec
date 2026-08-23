'use client'

import * as React from 'react'
import createGlobe, { type Arc, type Marker } from 'cobe'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   GLOBO  ·  la idea viene del "3D Globe" de Aceternity UI
   El componente de Aceternity monta three.js + three-globe
   (cientos de kB) para dibujar una esfera. Acá el mismo gesto se
   resuelve con `cobe`: ~5 kB, WebGL directo, y una esfera de
   puntos que ya habla el mismo idioma que el domo de la
   constelación orbital.

   No es adorno: arranca encuadrado en Ecuador, con el eje casi
   sin inclinar, de modo que la línea ecuatorial cruza la esfera
   horizontalmente por la mitad. Es el concepto de marca dibujado
   a escala planeta — y es lo único del sitio que se agarra con
   el cursor y se gira.
   ============================================================ */

/** [phi, theta] para centrar la cámara en una coordenada. */
function focus(lat: number, lon: number): [number, number] {
  return [Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180]
}

/** Quito: el punto que define el encuadre inicial. */
const [BASE_PHI] = focus(-0.1807, -78.4678)
const THETA = 0.06

export function Globe({
  markers = [],
  arcs = [],
  className,
  /** Amplitud del vaivén automático, en radianes. */
  sway = 0.26,
  speed = 0.0026,
}: {
  markers?: Marker[]
  arcs?: Arc[]
  className?: string
  sway?: number
  speed?: number
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const [ready, setReady] = React.useState(false)
  const [failed, setFailed] = React.useState(false)

  /* arrastre: objetivo y valor interpolado, para que soltar el
     puntero no corte el giro en seco */
  const dragTarget = React.useRef(0)
  const drag = React.useRef(0)
  const grabOrigin = React.useRef<number | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    let width = wrap.offsetWidth || 480
    let t = 0
    let raf = 0

    const onResize = () => {
      width = wrap.offsetWidth || width
    }
    window.addEventListener('resize', onResize)

    let globe: { update: (s: Record<string, unknown>) => void; destroy: () => void }
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: width * 2,
        height: width * 2,
        phi: BASE_PHI,
        theta: THETA,
        dark: 1,
        diffuse: 1.15,
        mapSamples: 15000,
        mapBrightness: 5.4,
        /* la tierra pertenece a la rampa de fondos, no es azul de stock */
        baseColor: [0.09, 0.14, 0.2],
        /* PMS 137 — el naranja solo lo llevan las ciudades */
        markerColor: [1, 0.64, 0],
        /* PMS 3015 difuminado en el limbo de la esfera */
        glowColor: [0.05, 0.28, 0.44],
        markers,
        arcs,
        arcColor: [1, 0.64, 0],
        arcWidth: 0.35,
        arcHeight: 0.28,
      })
    } catch {
      setFailed(true)
      window.removeEventListener('resize', onResize)
      return
    }

    /* cobe v2 ya no expone onRender: el estado se empuja desde
       nuestro propio bucle con update(). */
    const frame = () => {
      if (!reduce && grabOrigin.current === null) t += speed
      drag.current += (dragTarget.current - drag.current) * 0.09
      globe.update({
        phi: BASE_PHI + Math.sin(t) * sway + drag.current,
        theta: THETA,
        width: width * 2,
        height: width * 2,
      })
      raf = requestAnimationFrame(frame)
    }

    /* El globo es WebGL: fuera de pantalla seguiría consumiendo
       GPU en cada cuadro durante toda la visita. Solo dibuja
       mientras se le está viendo. */
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!raf) raf = requestAnimationFrame(frame)
        } else {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0 }
    )
    io.observe(wrap)

    /* el primer cuadro tarda un par de decenas de ms: sin esta
       espera el canvas aparece en negro y luego salta */
    const id = window.setTimeout(() => setReady(true), 140)

    return () => {
      window.clearTimeout(id)
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      globe.destroy()
    }
  }, [markers, arcs, reduce, sway, speed])

  if (failed) {
    return (
      <div
        className={cn(
          'grid aspect-square w-full place-items-center rounded-full border border-dashed border-line',
          className
        )}
        aria-hidden="true"
      />
    )
  }

  return (
    <div ref={wrapRef} className={cn('relative aspect-square w-full', className)}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-cursor
        className={cn(
          'h-full w-full',
          'cursor-grab touch-pan-y active:cursor-grabbing',
          'transition-opacity duration-1000 ease-cs',
          ready ? 'opacity-100' : 'opacity-0'
        )}
        onPointerDown={(e) => {
          grabOrigin.current = e.clientX - drag.current * 220
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        onPointerUp={() => {
          grabOrigin.current = null
        }}
        onPointerCancel={() => {
          grabOrigin.current = null
        }}
        onPointerMove={(e) => {
          if (grabOrigin.current === null) return
          dragTarget.current = (e.clientX - grabOrigin.current) / 220
        }}
      />

      {/* La línea ecuatorial atraviesa el globo por la mitad: el
          mismo divisor que separa las secciones del sitio. */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-x-[-6%] top-1/2 h-px -translate-y-1/2',
          'transition-opacity duration-1000 ease-cs',
          ready ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'linear-gradient(90deg, transparent, hsl(var(--orange) / 0.5) 20%, hsl(var(--orange) / 0.9) 50%, hsl(var(--orange) / 0.5) 80%, transparent)',
        }}
      />
      {/* La etiqueta va al extremo derecho de la línea: en el centro
          se monta justo encima de los marcadores de Ecuador. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-0 top-1/2 -translate-y-[190%]',
          'font-mono text-[10px] uppercase tracking-[0.18em] text-primary/85',
          'transition-opacity duration-1000 ease-cs',
          ready ? 'opacity-100' : 'opacity-0'
        )}
      >
        latitud 0°
      </span>
    </div>
  )
}
