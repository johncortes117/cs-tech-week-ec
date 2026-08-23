'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   INTERACTIVE BINARY FIELD

   Ones and zeros adrift, very faint. A direct quote of the 1/0
   bug in the IEEE CS logo and of the "Binary" attribute of the
   Brand Identity Prism. It must read as texture, never as an
   animated background.

   The interactive layer: the cursor carries heat. The bits
   within its radius light up orange and start flipping, as if
   the pointer were reading memory.

   Rewritten for cost. The first version called `fillText` once
   per cell per frame: on a large screen that is ~2000 calls
   sixty times a second, and it showed up as the most expensive
   JavaScript function on the whole site in the profiler.

   Now the grid is drawn ONCE onto an offscreen canvas and each
   frame only does one `drawImage` to shift it. The only thing
   repainted by hand are the ~130 cells that fall inside the
   halo. When a bit flips it is corrected on the base canvas too,
   so the change persists once the pointer moves away.
   ============================================================ */

export function BinaryField({
  className,
  cell = 26,
  alpha = 0.05,
  speed = 3.5,
  /** Cursor influence radius, in px. 0 disables it. */
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

    /** Repaints one cell of the base canvas (after a bit flips). */
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

      /* the whole grid, in a single piece */
      const shift = (offset % cell) - cell
      ctx.drawImage(base, 0, shift, cols * cell, rows * cell)

      if (!live) return

      /* only the halo cells are repainted by hand */
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

          // quadratic falloff: the halo has a soft edge, not a ring
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

    /* offscreen means nothing is drawn */
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

    /* the canvas moves with the scroll: without refreshing the
       rect, the halo drifts out of sync with the cursor */
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
