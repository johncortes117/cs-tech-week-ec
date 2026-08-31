'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   TEASER VIDEO

   A looping clip used as the ground of a card, blurred past the
   point of being readable: it should suggest that something is
   there without giving it away.

   The blur is NOT a `filter: blur(40px)` over a full-size video.
   That is the most expensive thing on this page's budget — a
   filter re-rasterises its layer, and a video layer changes on
   every single frame, so the cost never amortises.

   Instead the video element is laid out tiny (a few per cent of
   the card), given a 2px blur at that size, and scaled back up
   by the compositor. Blurring 60×34 pixels costs nothing, and
   the upscale multiplies the blur along with everything else:
   the result reads as a heavy, soft defocus for roughly the
   price of a transform.

   The file is only fetched once the card is actually on screen,
   and never at all under prefers-reduced-motion.
   ============================================================ */

export function TeaserVideo({
  src,
  /** Layout size of the video before it is scaled up. Lower = blurrier and cheaper. */
  scale = 20,
  /** Blur applied at the small size; the upscale multiplies it. */
  blur = 2,
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
    if (reduce) return
    const el = ref.current
    if (!el) return

    /* Nothing is downloaded until the card is near the viewport:
       a teaser is not worth a megabyte on first paint. */
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          el.pause()
          return
        }
        if (!el.src) el.src = src
        el.play().catch(() => {
          /* autoplay refused (battery saver, data saver): the card
             keeps its gradient ground and loses nothing essential */
        })
      },
      { rootMargin: '200px' }
    )
    io.observe(el)

    /* Loop a window instead of the whole file. This clip runs 79
       seconds from near-black to pure white, and the white half
       would blow out the card and make the copy on top of it
       unreadable. Only the atmospheric opening earns its place —
       and stopping early means the browser never has to fetch the
       rest of the file either. */
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

  if (reduce) return null

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
        'transition-opacity duration-1000 ease-cs',
        ready ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
      }}
    />
  )
}
