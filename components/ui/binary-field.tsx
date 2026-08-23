'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   CAMPO BINARIO INTERACTIVO

   Unos y ceros a la deriva, muy tenues. Cita directa al bug 1/0
   del logo de IEEE CS y al atributo "Binary" del Brand Identity
   Prism. Debe leerse como textura, nunca como fondo animado.

   La capa interactiva: el cursor tiene calor. Los bits dentro de
   su radio se encienden en naranja y empiezan a voltearse, como
   si el puntero estuviera leyendo memoria.

   Reescrito por coste. La primera versión llamaba a `fillText`
   una vez por celda y por cuadro: en pantalla grande son ~2000
   llamadas sesenta veces por segundo, y salía como la función de
   JavaScript más cara de todo el sitio en el perfilador.

   Ahora la retícula se dibuja UNA vez en un lienzo fuera de
   pantalla y cada cuadro solo hace un `drawImage` para
   desplazarla. Lo único que se repinta a mano son las ~130
   celdas que caen dentro del halo. Cuando un bit se voltea se
   corrige también en el lienzo base, para que el cambio persista
   cuando el puntero se aleje.
   ============================================================ */

export function BinaryField({
  className,
  cell = 26,
  alpha = 0.05,
  speed = 3.5,
  /** Radio de influencia del cursor, en px. 0 lo apaga. */
  reach = 130,
  interactive = true,
}: {
  className?: string
  cell?: number
  alpha?: number
  speed?: number
  reach?: number
  interactive?: boolean
}) {
  const ref = React.useRef<HTMLCanvasElement | null>(null)
  const reduce = useReducedMotion()

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const base = document.createElement('canvas')
    const bctx = base.getContext('2d')
    if (!bctx) return

    let raf = 0
    let visible = true
    let cols = 0
    let rows = 0
    let bits: string[] = []
    let w = 0
    let h = 0
    let rect = canvas.getBoundingClientRect()

    const pointer = { x: -9999, y: -9999 }
    const live = interactive && !reduce && reach > 0
    const FONT = '500 11px var(--font-plex-mono, monospace)'

    /** Repinta una celda del lienzo base (tras voltearse un bit). */
    const paintBase = (x: number, y: number) => {
      const bit = bits[y * cols + x]
      bctx.clearRect(x * cell, y * cell, cell, cell)
      bctx.fillStyle = `rgba(238,242,246,${bit === '1' ? alpha * 1.5 : alpha})`
      bctx.fillText(bit, x * cell, y * cell)
    }

    const seed = () => {
      rect = canvas.getBoundingClientRect()
      w = Math.max(1, Math.round(rect.width))
      h = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = FONT
      ctx.textBaseline = 'top'

      cols = Math.ceil(w / cell) + 1
      rows = Math.ceil(h / cell) + 2
      bits = Array.from({ length: cols * rows }, () => (Math.random() > 0.5 ? '1' : '0'))

      base.width = Math.round(cols * cell * dpr)
      base.height = Math.round(rows * cell * dpr)
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      bctx.font = FONT
      bctx.textBaseline = 'top'
      bctx.clearRect(0, 0, cols * cell, rows * cell)
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) paintBase(x, y)
    }

    const draw = (offset: number) => {
      ctx.clearRect(0, 0, w, h)

      /* la retícula entera, de una sola pieza */
      const shift = (offset % cell) - cell
      ctx.drawImage(base, 0, shift, cols * cell, rows * cell)

      if (!live) return

      /* solo las celdas del halo se repintan a mano */
      const r2 = reach * reach
      const x0 = Math.max(0, Math.floor((pointer.x - reach) / cell))
      const x1 = Math.min(cols - 1, Math.ceil((pointer.x + reach) / cell))
      const y0 = Math.max(0, Math.floor((pointer.y - shift - reach) / cell))
      const y1 = Math.min(rows - 1, Math.ceil((pointer.y - shift + reach) / cell))

      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const px = x * cell
          const py = y * cell + shift
          const dx = px - pointer.x
          const dy = py - pointer.y
          const d2 = dx * dx + dy * dy
          if (d2 >= r2) continue

          // caída cuadrática: el halo tiene borde suave, no aro
          let warm = 1 - d2 / r2
          warm *= warm

          const i = y * cols + x
          if (Math.random() < warm * 0.045) {
            bits[i] = bits[i] === '1' ? '0' : '1'
            paintBase(x, y)
          }

          const bit = bits[i]
          const a = Math.min((bit === '1' ? alpha * 1.5 : alpha) + warm * 0.72, 0.9)
          ctx.clearRect(px, py, cell, cell)
          ctx.fillStyle = `rgba(${Math.round(238 - warm * 83)},${Math.round(
            242 - warm * 79
          )},${Math.round(246 - warm * 246)},${a})`
          ctx.fillText(bit, px, py)
        }
      }
    }

    let start: number | null = null
    const frame = (ts: number) => {
      if (start === null) start = ts
      draw(((ts - start) / 1000) * speed)
      raf = requestAnimationFrame(frame)
    }
    const startLoop = () => {
      if (raf || reduce || !visible) return
      raf = requestAnimationFrame(frame)
    }
    const stopLoop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    seed()
    if (reduce) draw(0)
    else startLoop()

    /* fuera de pantalla no se dibuja */
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible) startLoop()
        else stopLoop()
      },
      { threshold: 0 }
    )
    io.observe(canvas)

    const onPointer = (e: PointerEvent) => {
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
    }
    if (live) window.addEventListener('pointermove', onPointer, { passive: true })

    let timer = 0
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        seed()
        if (reduce) draw(0)
      }, 180)
    }
    window.addEventListener('resize', onResize)

    /* el lienzo se mueve con el scroll: sin refrescar el rect,
       el halo queda desfasado respecto al cursor */
    const onScroll = () => {
      rect = canvas.getBoundingClientRect()
    }
    if (live) window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      io.disconnect()
      stopLoop()
      window.clearTimeout(timer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [cell, alpha, speed, reduce, reach, interactive])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  )
}
