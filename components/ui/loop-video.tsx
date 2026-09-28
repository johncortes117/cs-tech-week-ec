'use client'

import * as React from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/* ============================================================
   LOOP VIDEO
   Silent loop that loads and plays only while it is on screen.
   Sound is the visitor's decision, never the page's: it stays off
   until the button is pressed. With reduced motion the poster is
   all there is.
   ============================================================ */

export function LoopVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string
  poster?: string
  /** What the clip shows, for the sound button's label. */
  label: string
  className?: string
}) {
  const ref = React.useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()
  const [muted, setMuted] = React.useState(true)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!el.src) el.src = src
          el.play().catch(() => {})
        } else if (!el.paused) {
          el.pause()
        }
      },
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [src, reduce])

  const toggle = () => {
    const el = ref.current
    if (!el) return
    el.muted = !muted
    setMuted(!muted)
    if (el.paused) el.play().catch(() => {})
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
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
          'absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-cs',
          ready ? 'opacity-100' : 'opacity-0'
        )}
      />
      {reduce ? null : (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={!muted}
          aria-label={muted ? `Activar sonido: ${label}` : `Silenciar: ${label}`}
          className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-night/70 text-paper backdrop-blur-md transition-colors hover:bg-night"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-orange" />}
        </button>
      )}
    </div>
  )
}
