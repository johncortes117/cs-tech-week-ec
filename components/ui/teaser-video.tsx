'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   TEASER VIDEO

   A looping clip inside a card. It carries two optional tricks
   that only make sense together:

   `scale` lays the video element out small and lets the
   compositor blow it back up. Combined with a small `blur` that
   is multiplied by the same factor, it produces a heavy defocus
   for roughly the price of a transform — a real
   `filter: blur(40px)` over a video re-rasterises its layer on
   every single frame, which is the most expensive thing this
   page could do. At the default `scale = 1` the clip simply
   plays sharp.

   The file is only fetched once the card is near the viewport.
   Under prefers-reduced-motion it still loads and shows its
   first frame — a still is information, an empty box is not —
   but it never plays.
   ============================================================ */

export function TeaserVideo({
  src,
  /** Layout size divisor before the compositor scales it back up. */
  scale = 1,
  /** Blur applied at the small size; the upscale multiplies it. */
  blur = 0,
  /** Loop only this window of the clip, in seconds. */
  clipStart = 0,
  clipEnd,
  className,
}: {
  src: string
  scale?: number
  blur?: number
  clipStart?: number
  clipEnd?: number
  className?: string
}) {
  const ref = React.useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    /* Nothing is downloaded until the card is near the viewport:
       a clip below the fold is not worth the bytes on first paint. */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (!el.paused) el.pause()
          return
        }
        if (!el.src) el.src = src
        if (reduce) return
        el.play().catch(() => {
          /* autoplay refused (battery saver, data saver): the first
             frame stays on screen, which is still the poster */
        })
      },
      { rootMargin: '200px' }
    )
    io.observe(el)

    /* Optionally loop a window instead of the whole file. */
    const onTime = () => {
      const end = clipEnd ?? el.duration
      if (Number.isFinite(end) && el.currentTime >= end) el.currentTime = clipStart
    }
    const onLoaded = () => {
      if (clipStart > 0) el.currentTime = clipStart
    }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onLoaded)

    return () => {
      io.disconnect()
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [src, reduce, clipStart, clipEnd])

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onCanPlay={() => setReady(true)}
      className={cn(
        'pointer-events-none absolute left-0 top-0 origin-top-left object-cover',
        'transition-opacity duration-700 ease-cs',
        ready ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transform: scale === 1 ? undefined : `scale(${scale})`,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    />
  )
}
