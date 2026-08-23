'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/* ============================================================
   CLICK SPARK  ·  adaptado de React Bits
   Cada clic suelta un destello radial corto. Suena a capricho,
   pero es lo que hace que la interfaz responda al gesto incluso
   cuando el clic no navega a ningún lado.

   Un solo canvas para todo el documento, tamaño de ventana,
   sin listeners por elemento.
   ============================================================ */

type Spark = { x: number; y: number; born: number }

export function ClickSpark({
  color = 'hsl(38 100% 50%)',
  count = 8,
  radius = 15,
  length = 10,
  duration = 420,
}: {
  color?: string
  count?: number
  radius?: number
  length?: number
  duration?: number
}) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const sparks = React.useRef<Spark[]>([])
  const reduce = useReducedMotion()

  React.useEffect(() => {
    if (reduce) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    /* salida rápida y frenado largo: la misma curva que el resto */
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)

    const onClick = (e: MouseEvent) => {
      sparks.current.push({ x: e.clientX, y: e.clientY, born: performance.now() })
      /* el bucle solo existe mientras haya algo que dibujar: un
         rAF permanente que limpia un lienzo a pantalla completa
         cuesta compositor todo el rato, sin pintar nada */
      if (!raf) raf = requestAnimationFrame(frame)
    }
    window.addEventListener('click', onClick)

    const frame = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      sparks.current = sparks.current.filter((s) => now - s.born < duration)

      if (sparks.current.length === 0) {
        raf = 0
        return
      }

      for (const s of sparks.current) {
        const p = ease((now - s.born) / duration)
        ctx.globalAlpha = 1 - p
        ctx.strokeStyle = color
        ctx.lineWidth = 1.6
        ctx.lineCap = 'round'
        for (let i = 0; i < count; i++) {
          const a = (2 * Math.PI * i) / count
          const r0 = radius + length * p
          const r1 = r0 + length * (1 - p)
          ctx.beginPath()
          ctx.moveTo(s.x + Math.cos(a) * r0, s.y + Math.sin(a) * r0)
          ctx.lineTo(s.x + Math.cos(a) * r1, s.y + Math.sin(a) * r1)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', onClick)
    }
  }, [color, count, radius, length, duration, reduce])

  if (reduce) return null

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[95] h-full w-full"
    />
  )
}
