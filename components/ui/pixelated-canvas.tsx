'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/* ============================================================
   PIXELATED CANVAS  ·  adapted from Aceternity UI

   Rasterises an image into a grid of dots and lets the pointer
   push them around. Low-contrast areas lose dots on purpose, so
   flat fills dissolve while edges stay legible — the logo reads
   as if it were assembled out of pixels rather than drawn.

   Changes from the original, all of them things a hero needs:

   · TRANSPARENT BACKGROUND. The original always paints a solid
     colour. Here `backgroundColor` may be omitted, and the
     canvas is cleared instead, so whatever is behind it shows
     through.

   · THE POINTER IS TRACKED ON THE WINDOW, not on the canvas.
     In a hero the canvas sits behind the headline and buttons,
     so listening on the element itself would kill the effect
     exactly where the cursor spends its time — and it lets the
     canvas stay `pointer-events: none`.

   · SAMPLES ARE PRE-FILTERED. The original walks every cell on
     every frame and skips the transparent ones inside the loop.
     A logo is mostly empty space, so most of that work is
     thrown away: dropped and transparent cells are removed once,
     at build time, and the animation loop only ever iterates
     what is actually drawn.

   · IT STOPS WHEN NOTHING IS MOVING. At rest the dots do not
     drift, so there is nothing to redraw: once the reveal is done
     and the pointer is away, the loop parks itself and the last
     frame simply stays on screen. It wakes on pointer movement
     near the canvas. An IntersectionObserver also pauses it
     offscreen, and `prefers-reduced-motion` renders a single
     static frame and never starts a loop at all.

   · FLUID SIZING. With `fill`, the canvas measures its parent
     and follows it, instead of taking hard-coded pixel values.
   ============================================================ */

type Sample = {
  x: number
  y: number
  /** Pre-built `rgba()` string, alpha included. */
  color: string
  /** Kept separately, only needed while the reveal is running. */
  alpha: number
  seed: number
}

export type PixelatedCanvasProps = {
  src: string
  /** Fixed size in CSS pixels. Ignored when `fill` is set. */
  width?: number
  height?: number
  /** Measure the parent element and follow its size. */
  fill?: boolean
  /** Size of each sampling cell, in CSS pixels. */
  cellSize?: number
  /** Dot size as a fraction of the cell (0..1). */
  dotScale?: number
  shape?: 'circle' | 'square'
  /** Omit for a transparent canvas. */
  backgroundColor?: string
  grayscale?: boolean
  className?: string
  /** 0..1. Higher values remove more dots from low-contrast areas. */
  dropoutStrength?: number
  interactive?: boolean
  /** Maximum per-dot offset, in px. */
  distortionStrength?: number
  /** Radius of pointer influence, in px. */
  distortionRadius?: number
  distortionMode?: 'repel' | 'attract' | 'swirl'
  /** 0..1 smoothing for the pointer follow. */
  followSpeed?: number
  /** Average a 3×3 neighbourhood per cell instead of a single sample. */
  sampleAverage?: boolean
  tintColor?: string
  /** 0..1 blend amount of the tint. */
  tintStrength?: number
  /** Multiplies every sampled channel. Affects highlights too. */
  brightness?: number
  /**
   * Lifts the shadows without touching the highlights
   * (`out = 255 · (in/255)^(1/gamma)`). This is what a logo drawn
   * for white backgrounds needs on a near-black page: its darkest
   * navy comes up, its bright cyan stays the brand colour.
   */
  gamma?: number
  maxFps?: number
  /**
   * Caps the backing-store resolution. A dot grid is a deliberately
   * coarse image, so drawing it at 2x device pixels doubles the
   * fill cost for detail nobody can see.
   */
  maxDpr?: number
  objectFit?: 'cover' | 'contain' | 'fill' | 'none'
  /** Random motion amplitude near the pointer. */
  jitterStrength?: number
  jitterSpeed?: number
  /** Fade the distortion out when the pointer goes away. */
  fadeOnLeave?: boolean
  /** 0..1. Higher fades faster. */
  fadeSpeed?: number
  /** Dots fade in one by one on first paint. Seconds; 0 disables. */
  revealDuration?: number
}

const parseColor = (c: string): [number, number, number] | null => {
  if (c.startsWith('#')) {
    const hex = c.slice(1)
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ]
    }
    if (hex.length >= 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ]
    }
    return null
  }
  const m = c.match(/rgba?\((\d+)[\s,]+(\d+)[\s,]+(\d+)/i)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

export function PixelatedCanvas({
  src,
  width = 400,
  height = 500,
  fill = false,
  cellSize = 4,
  dotScale = 0.9,
  shape = 'square',
  backgroundColor,
  grayscale = false,
  className,
  dropoutStrength = 0.35,
  interactive = true,
  distortionStrength = 4,
  distortionRadius = 110,
  distortionMode = 'swirl',
  followSpeed = 0.18,
  sampleAverage = true,
  tintColor,
  tintStrength = 0,
  brightness = 1,
  gamma = 1,
  maxFps = 48,
  maxDpr = 1.5,
  objectFit = 'contain',
  jitterStrength = 3,
  jitterSpeed = 3,
  fadeOnLeave = true,
  fadeSpeed = 0.08,
  revealDuration = 1.4,
}: PixelatedCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const reduce = useReducedMotion()

  /* Size is state because the whole sample grid has to be rebuilt
     when it changes; everything else lives in refs so the render
     loop never triggers React work. */
  const [size, setSize] = React.useState<{ w: number; h: number }>({
    w: width,
    h: height,
  })

  React.useEffect(() => {
    if (!fill) {
      setSize({ w: width, h: height })
      return
    }
    const parent = canvasRef.current?.parentElement
    if (!parent) return

    let timer = 0
    const measure = () => {
      const r = parent.getBoundingClientRect()
      const w = Math.max(1, Math.round(r.width))
      const h = Math.max(1, Math.round(r.height))
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    }
    measure()

    /* Debounced: a drag-resize would otherwise rebuild tens of
       thousands of samples on every intermediate pixel. */
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(measure, 150)
    })
    ro.observe(parent)
    return () => {
      window.clearTimeout(timer)
      ro.disconnect()
    }
  }, [fill, width, height])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { w: displayW, h: displayH } = size
    if (displayW < 2 || displayH < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let cancelled = false
    let raf = 0
    let visible = true
    let samples: Sample[] = []
    let dot = Math.max(1, Math.floor(cellSize * dotScale))
    let startedAt = 0

    const dpr = Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, maxDpr)
    canvas.width = Math.max(1, Math.floor(displayW * dpr))
    canvas.height = Math.max(1, Math.floor(displayH * dpr))
    canvas.style.width = `${displayW}px`
    canvas.style.height = `${displayH}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const pointer = { tx: -9999, ty: -9999, x: -9999, y: -9999 }
    let activity = 0
    let activityTarget = 0

    const build = (img: HTMLImageElement) => {
      const off = document.createElement('canvas')
      off.width = displayW
      off.height = displayH
      const octx = off.getContext('2d', { willReadFrequently: true })
      if (!octx) return false

      const iw = img.naturalWidth || displayW
      const ih = img.naturalHeight || displayH
      let dw = displayW
      let dh = displayH
      let dx = 0
      let dy = 0

      if (objectFit === 'cover' || objectFit === 'contain') {
        const scale =
          objectFit === 'cover'
            ? Math.max(displayW / iw, displayH / ih)
            : Math.min(displayW / iw, displayH / ih)
        dw = Math.ceil(iw * scale)
        dh = Math.ceil(ih * scale)
        dx = Math.floor((displayW - dw) / 2)
        dy = Math.floor((displayH - dh) / 2)
      } else if (objectFit === 'none') {
        dw = iw
        dh = ih
        dx = Math.floor((displayW - dw) / 2)
        dy = Math.floor((displayH - dh) / 2)
      }
      octx.drawImage(img, dx, dy, dw, dh)

      let image: ImageData
      try {
        image = octx.getImageData(0, 0, off.width, off.height)
      } catch {
        /* A cross-origin image would taint the canvas. Same-origin
           assets never hit this, but bailing out beats throwing. */
        return false
      }

      const data = image.data
      const stride = off.width * 4
      const tint = tintColor && tintStrength > 0 ? parseColor(tintColor) : null

      const lumaAt = (px: number, py: number) => {
        const ix = px < 0 ? 0 : px > off.width - 1 ? off.width - 1 : px
        const iy = py < 0 ? 0 : py > off.height - 1 ? off.height - 1 : py
        const i = iy * stride + ix * 4
        return 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
      }

      /* Deterministic hash: the same cell always makes the same
         decision, so the pattern does not shimmer between renders. */
      const hash = (ix: number, iy: number) => {
        const s = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453123
        return s - Math.floor(s)
      }

      const built: Sample[] = []
      const half = Math.floor(cellSize / 2)

      for (let y = 0; y < off.height; y += cellSize) {
        const cy = Math.min(off.height - 1, y + half)
        for (let x = 0; x < off.width; x += cellSize) {
          const cx = Math.min(off.width - 1, x + half)

          let r = 0
          let g = 0
          let b = 0
          let a = 0

          if (sampleAverage) {
            let n = 0
            for (let oy = -1; oy <= 1; oy++) {
              for (let ox = -1; ox <= 1; ox++) {
                const sx = Math.max(0, Math.min(off.width - 1, cx + ox))
                const sy = Math.max(0, Math.min(off.height - 1, cy + oy))
                const i = sy * stride + sx * 4
                r += data[i]
                g += data[i + 1]
                b += data[i + 2]
                a += data[i + 3] / 255
                n++
              }
            }
            r /= n
            g /= n
            b /= n
            a /= n
          } else {
            const i = cy * stride + cx * 4
            r = data[i]
            g = data[i + 1]
            b = data[i + 2]
            a = data[i + 3] / 255
          }

          /* Fully transparent cells never become dots. On a logo
             that is most of the frame. */
          if (a <= 0.02) continue

          if (grayscale) {
            const L = 0.2126 * r + 0.7152 * g + 0.0722 * b
            r = L
            g = L
            b = L
          } else if (tint) {
            const k = Math.max(0, Math.min(1, tintStrength))
            r = r * (1 - k) + tint[0] * k
            g = g * (1 - k) + tint[1] * k
            b = b * (1 - k) + tint[2] * k
          }

          if (brightness !== 1) {
            r *= brightness
            g *= brightness
            b *= brightness
          }

          if (gamma !== 1) {
            const e = 1 / gamma
            r = 255 * Math.pow(Math.min(1, r / 255), e)
            g = 255 * Math.pow(Math.min(1, g / 255), e)
            b = 255 * Math.pow(Math.min(1, b / 255), e)
          }

          /* Dots are dropped where the image is flat and kept where
             it has an edge, which is what makes the shape survive
             while the fills dissolve. */
          const Lc = lumaAt(cx, cy)
          const gradient =
            Math.abs(lumaAt(cx + 1, cy) - lumaAt(cx - 1, cy)) +
            Math.abs(lumaAt(cx, cy + 1) - lumaAt(cx, cy - 1)) +
            Math.abs(
              Lc -
                (lumaAt(cx - 1, cy) +
                  lumaAt(cx + 1, cy) +
                  lumaAt(cx, cy - 1) +
                  lumaAt(cx, cy + 1)) /
                  4
            )
          const seed = hash(cx, cy)
          const dropChance = Math.max(0, Math.min(1, (1 - Math.min(1, gradient / 255)) * dropoutStrength))
          if (seed < dropChance) continue

          /* Colours are quantised to 8 levels per channel and the
             alpha to 16 steps. Averaging a 3×3 neighbourhood would
             otherwise give almost every dot its own unique colour,
             and `fillStyle` is a state change: with the palette
             collapsed, thousands of dots share a handful of values. */
          const q = (v: number) => Math.min(248, Math.round(v / 8) * 8)
          const qa = Math.max(0.06, Math.round(a * 16) / 16)

          built.push({
            x: x + half,
            y: y + half,
            color: `rgba(${q(r)},${q(g)},${q(b)},${qa})`,
            alpha: a,
            seed,
          })
        }
      }

      /* Sorting by colour turns those shared values into runs, so
         `fillStyle` is assigned a few dozen times per frame instead
         of once per dot. This is the single biggest win in the
         draw loop. */
      built.sort((p, q2) => (p.color < q2.color ? -1 : p.color > q2.color ? 1 : 0))
      samples = built
      dot = Math.max(1, Math.floor(cellSize * dotScale))
      return true
    }

    /* Last colour written to the context. Assigning `fillStyle` is
       a state change, so it is only done when the value actually
       differs from the previous dot. */
    let lastColor = ''

    const clear = () => {
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, displayW, displayH)
      } else {
        ctx.clearRect(0, 0, displayW, displayH)
      }
      lastColor = ''
    }

    const paint = (x: number, y: number, color: string) => {
      if (color !== lastColor) {
        ctx.fillStyle = color
        lastColor = color
      }
      if (shape === 'circle') {
        ctx.beginPath()
        ctx.arc(x, y, dot / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(x - dot / 2, y - dot / 2, dot, dot)
      }
    }

    const paintStatic = () => {
      clear()
      for (const s of samples) paint(s.x, s.y, s.color)
    }

    /* The undistorted logo, rendered once into its own bitmap.
       Only the dots near the pointer ever move, so every frame can
       blit this and then repaint just the affected box — instead of
       clearing the whole canvas and redrawing every dot. */
    let still: HTMLCanvasElement | null = null

    const buildStill = () => {
      const c = document.createElement('canvas')
      c.width = canvas.width
      c.height = canvas.height
      const sctx = c.getContext('2d')
      if (!sctx) return
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      let prev = ''
      for (const s of samples) {
        if (s.color !== prev) {
          sctx.fillStyle = s.color
          prev = s.color
        }
        if (shape === 'circle') {
          sctx.beginPath()
          sctx.arc(s.x, s.y, dot / 2, 0, Math.PI * 2)
          sctx.fill()
        } else {
          sctx.fillRect(s.x - dot / 2, s.y - dot / 2, dot, dot)
        }
      }
      still = c
    }

    /* Distance at which a dot still moves by ~a third of a pixel.
       influence = exp(-d^2 / 2σ²); solve for the movement budget. */
    const sigmaBase = Math.max(1, distortionRadius * 0.5)
    const budget = 0.33 / Math.max(1, distortionStrength + jitterStrength)
    const reach =
      sigmaBase * Math.sqrt(Math.max(0, -2 * Math.log(Math.min(0.9, budget)))) +
      distortionStrength +
      jitterStrength +
      dot

    let baseDrawn = false
    let prevBox = { l: 0, t: 0, r: 0, b: 0 }

    /** Clears a rectangle, honouring an opaque background. */
    const wipe = (x: number, y: number, w: number, h: number) => {
      if (backgroundColor) {
        ctx.fillStyle = backgroundColor
        ctx.fillRect(x, y, w, h)
        lastColor = ''
      } else {
        ctx.clearRect(x, y, w, h)
      }
    }

    /** Repaints one rectangle from the undistorted bitmap. */
    const restore = (x: number, y: number, w: number, h: number) => {
      if (!still) return
      wipe(x, y, w, h)
      ctx.drawImage(still, x * dpr, y * dpr, w * dpr, h * dpr, x, y, w, h)
    }

    let lastFrame = 0
    const frame = (now: number) => {
      const minDelta = 1000 / Math.max(1, maxFps)
      if (now - lastFrame < minDelta) {
        raf = requestAnimationFrame(frame)
        return
      }
      lastFrame = now
      if (!startedAt) startedAt = now

      pointer.x += (pointer.tx - pointer.x) * followSpeed
      pointer.y += (pointer.ty - pointer.y) * followSpeed
      activity += (activityTarget - activity) * (fadeOnLeave ? fadeSpeed : 1)

      /* Reveal: each dot fades in at its own moment, ordered by its
         seed, so the logo assembles instead of switching on. */
      const reveal =
        revealDuration > 0 ? Math.min(1, (now - startedAt) / (revealDuration * 1000)) : 1

      /* `globalAlpha` is only touched while the reveal is running.
         Once the logo is assembled the alpha already lives inside
         each dot's rgba() string, so the loop makes no state
         changes at all beyond the occasional fillStyle. */
      const revealing = reveal < 1

      const sigma = Math.max(1, distortionRadius * 0.5)
      const twoSigmaSq = 2 * sigma * sigma
      const t = now * 0.001 * jitterSpeed
      const act = Math.max(0, Math.min(1, activity))

      /* How far the influence still moves a dot by at least a third
         of a pixel. Derived from the gaussian rather than guessed:
         beyond this the dot is exactly where the still bitmap
         already has it. */
      const boxL = pointer.x - reach
      const boxR = pointer.x + reach
      const boxT = pointer.y - reach
      const boxB = pointer.y + reach

      if (still && !revealing) {
        /* The canvas already holds the previous frame. Only two
           regions can be wrong: where the distortion was, and where
           it is now. Restoring their union from the still bitmap
           and repainting the current box keeps every raster
           operation proportional to the pointer's reach instead of
           to the whole logo. */
        if (!baseDrawn) {
          clear()
          ctx.drawImage(still, 0, 0, displayW, displayH)
          baseDrawn = true
          prevBox = { l: boxL, t: boxT, r: boxR, b: boxB }
        }

        const rl = Math.max(0, Math.min(prevBox.l, boxL))
        const rt = Math.max(0, Math.min(prevBox.t, boxT))
        const rr = Math.min(displayW, Math.max(prevBox.r, boxR))
        const rb = Math.min(displayH, Math.max(prevBox.b, boxB))

        if (rr > rl && rb > rt) {
          restore(rl, rt, rr - rl, rb - rt)
        }
        /* wipe the current box so the distorted dots are not drawn
           on top of their undistorted copies */
        wipe(boxL, boxT, boxR - boxL, boxB - boxT)

        prevBox = { l: boxL, t: boxT, r: boxR, b: boxB }
        lastColor = ''
      } else {
        clear()
        baseDrawn = false
      }

      for (const s of samples) {
        if (revealing) {
          const local = (reveal - s.seed * 0.55) / 0.45
          if (local <= 0) continue
          ctx.globalAlpha = Math.min(1, local)
        }

        /* Outside the box this dot has not moved, and the still
           bitmap already shows it in the right place. */
        if (
          still &&
          !revealing &&
          (s.x < boxL || s.x > boxR || s.y < boxT || s.y > boxB)
        ) {
          continue
        }

        let px = s.x
        let py = s.y

        if (act > 0.002) {
          const dx = px - pointer.x
          const dy = py - pointer.y
          const influence = Math.exp(-(dx * dx + dy * dy) / twoSigmaSq) * act

          if (influence > 0.0005) {
            if (distortionMode === 'swirl') {
              const angle = distortionStrength * 0.05 * influence
              const cos = Math.cos(angle)
              const sin = Math.sin(angle)
              px = pointer.x + cos * dx - sin * dy
              py = pointer.y + sin * dx + cos * dy
            } else {
              const dist = Math.sqrt(dx * dx + dy * dy) + 0.0001
              const sign = distortionMode === 'repel' ? 1 : -1
              px += (dx / dist) * distortionStrength * influence * sign
              py += (dy / dist) * distortionStrength * influence * sign
            }

            if (jitterStrength > 0) {
              const k = s.seed * 43758.5453
              px += Math.sin(t + k) * jitterStrength * influence
              py += Math.cos(t + k * 1.13) * jitterStrength * influence
            }
          }
        }

        paint(px, py, s.color)
      }
      if (revealing) ctx.globalAlpha = 1

      /* Nothing is moving any more: the reveal has finished, the
         distortion has faded and the pointer is elsewhere. Park the
         loop — the frame just painted stays on screen until a
         pointer move wakes it. */
      if (!revealing && act < 0.002 && activityTarget === 0) {
        raf = 0
        return
      }

      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (raf || !visible || reduce || !interactive) return
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const img = new Image()
    img.decoding = 'async'
    img.src = src

    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.tx = e.clientX - r.left
      pointer.ty = e.clientY - r.top
      /* Only wake the distortion when the pointer is near the
         canvas; a cursor on the far side of the page should not
         drag the logo around. */
      const near =
        e.clientX > r.left - distortionRadius &&
        e.clientX < r.right + distortionRadius &&
        e.clientY > r.top - distortionRadius &&
        e.clientY < r.bottom + distortionRadius
      const wasAway = activityTarget === 0
      activityTarget = near ? 1 : 0
      /* the loop parks itself at rest, so entering the area has to
         wake it back up */
      if (near && wasAway) start()
    }

    img.onload = () => {
      if (cancelled) return
      if (!build(img)) return
      buildStill()

      if (reduce || !interactive) {
        paintStatic()
        return
      }

      /* The pointer lives on the window: the canvas sits behind the
         hero copy, so listening on the element would only work in
         the gaps between text. */
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      start()
    }

    img.onerror = () => {
      if (!cancelled) console.error('PixelatedCanvas: failed to load', src)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) start()
        else stop()
      },
      { threshold: 0 }
    )
    io.observe(canvas)

    return () => {
      cancelled = true
      io.disconnect()
      stop()
      window.removeEventListener('pointermove', onPointerMove)
      img.onload = null
      img.onerror = null
    }
  }, [
    src,
    size,
    cellSize,
    dotScale,
    shape,
    backgroundColor,
    grayscale,
    dropoutStrength,
    interactive,
    distortionStrength,
    distortionRadius,
    distortionMode,
    followSpeed,
    sampleAverage,
    tintColor,
    tintStrength,
    brightness,
    gamma,
    maxFps,
    maxDpr,
    objectFit,
    jitterStrength,
    jitterSpeed,
    fadeOnLeave,
    fadeSpeed,
    revealDuration,
    reduce,
  ])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
