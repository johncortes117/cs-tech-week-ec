'use client'

import * as React from 'react'
import createGlobe, { type Arc, type Marker } from 'cobe'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   GLOBE  ·  the idea comes from Aceternity UI's "3D Globe"
   Aceternity's component pulls in three.js + three-globe
   (hundreds of kB) to draw a sphere. Here the same gesture is
   solved with `cobe`: ~5 kB, plain WebGL, and a sphere of dots
   that already speaks the same language as the dome of the
   orbital constellation.

   It is not an ornament: it starts framed on Ecuador, with the
   axis almost untilted, so the equatorial line crosses the
   sphere horizontally through the middle. It is the brand
   concept drawn at planet scale — and it is the only thing on
   the site you grab with the cursor and spin.
   ============================================================ */

/** [phi, theta] to centre the camera on a coordinate. */
function focus(lat: number, lon: number): [number, number] {
  return [Math.PI - ((lon * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180]
}

/** Quito: the point that defines the initial framing. */
const [BASE_PHI] = focus(-0.1807, -78.4678)
const THETA = 0.06

export function Globe({
  markers = [],
  arcs = [],
  className,
  /** Amplitude of the automatic sway, in radians. */
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

  /* drag: target and interpolated value, so releasing the
     pointer does not cut the spin dead */
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
        /* the earth belongs to the background ramp, it is not stock blue */
        baseColor: [0.09, 0.14, 0.2],
        /* PMS 137 — only the cities carry the orange */
        markerColor: [1, 0.64, 0],
        /* PMS 3015 diffused across the limb of the sphere */
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

    /* cobe v2 no longer exposes onRender: state is pushed from our
       own loop with update(). */
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

    /* The globe is WebGL: offscreen it would keep burning GPU on
       every frame for the whole visit. It only draws while it is
       being looked at. */
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

    /* the first frame takes a couple of tens of ms: without this
       wait the canvas shows up black and then jumps */
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

      {/* The equatorial line crosses the globe through the middle:
          the same divider that separates the site's sections. */}
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
      {/* The label goes to the right end of the line: in the centre
          it lands right on top of Ecuador's markers. */}
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
