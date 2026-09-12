'use client'

import * as React from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   TEASER VIDEO WITH SMART AUDIO & SCROLL ACTIVATION
   
   - Streams web-optimized MP4 with audio on scroll into view
   - Automatically activates sound when in viewport (unmutes when user has interacted)
   - Pauses/mutes automatically when scrolled out of view
   - Includes interactive floating audio toggle button
   - Smooth volume ramp and fallback handling for strict browser autoplay policies
   ============================================================ */

export function TeaserVideo({
  src,
  scale = 1,
  blur = 0,
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
  const [isMuted, setIsMuted] = React.useState(false)
  const [isInView, setIsInView] = React.useState(false)
  const [hasUserGesture, setHasUserGesture] = React.useState(false)
  const fadeIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  // Track global user interaction to unlock browser autoplay audio restrictions
  React.useEffect(() => {
    const handleGesture = () => {
      setHasUserGesture(true)
    }

    window.addEventListener('click', handleGesture, { once: true, passive: true })
    window.addEventListener('touchstart', handleGesture, { once: true, passive: true })
    window.addEventListener('keydown', handleGesture, { once: true, passive: true })
    window.addEventListener('wheel', handleGesture, { once: true, passive: true })
    window.addEventListener('pointerdown', handleGesture, { once: true, passive: true })

    return () => {
      window.removeEventListener('click', handleGesture)
      window.removeEventListener('touchstart', handleGesture)
      window.removeEventListener('keydown', handleGesture)
      window.removeEventListener('wheel', handleGesture)
      window.removeEventListener('pointerdown', handleGesture)
    }
  }, [])

  // Smooth volume fade helper
  const fadeAudio = (targetVolume: number, durationMs = 350) => {
    const el = ref.current
    if (!el) return

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }

    const startVolume = el.volume
    const steps = 15
    const stepDuration = durationMs / steps
    const delta = (targetVolume - startVolume) / steps
    let currentStep = 0

    fadeIntervalRef.current = setInterval(() => {
      currentStep++
      if (!el) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
        return
      }

      const nextVol = Math.max(0, Math.min(1, startVolume + delta * currentStep))
      el.volume = nextVol

      if (currentStep >= steps) {
        el.volume = targetVolume
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
          fadeIntervalRef.current = null
        }
      }
    }, stepDuration)
  }

  // Intersection Observer to control playback & audio when scrolling into/out of view
  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const io = new IntersectionObserver(
      ([entry]) => {
        const inView = entry.isIntersecting && entry.intersectionRatio >= 0.25
        setIsInView(inView)

        if (!entry.isIntersecting) {
          // Out of viewport: pause and silence
          if (!el.paused) el.pause()
          el.muted = true
          return
        }

        // Near or in viewport: ensure src is loaded
        if (!el.src) {
          el.src = src
        }

        if (reduce) return

        if (inView) {
          // In view: start playing
          if (!isMuted && hasUserGesture) {
            el.muted = false
            el.volume = 0
            el.play()
              .then(() => {
                fadeAudio(1, 400)
              })
              .catch(() => {
                // If unmuted playback is rejected by browser, fallback to muted play
                el.muted = true
                el.play().catch(() => {})
              })
          } else {
            el.muted = true
            el.play().catch(() => {})
          }
        } else {
          // Exiting focus
          fadeAudio(0, 200)
          if (!el.paused) el.pause()
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '0px 0px -50px 0px' }
    )

    io.observe(el)

    return () => {
      io.disconnect()
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    }
  }, [src, reduce, isMuted, hasUserGesture])

  // If user interacts while already in view, enable audio automatically
  React.useEffect(() => {
    const el = ref.current
    if (!el || !isInView || isMuted || !hasUserGesture) return

    if (el.muted) {
      el.muted = false
      el.volume = 0
      el.play()
        .then(() => {
          fadeAudio(1, 400)
        })
        .catch(() => {})
    }
  }, [hasUserGesture, isInView, isMuted])

  // Loop window management
  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const onTime = () => {
      const end = clipEnd ?? el.duration
      if (Number.isFinite(end) && el.currentTime >= end) {
        el.currentTime = clipStart
      }
    }

    const onLoaded = () => {
      if (clipStart > 0) el.currentTime = clipStart
    }

    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onLoaded)

    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [clipStart, clipEnd])

  // Manual Sound Toggle
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    const el = ref.current
    if (!el) return

    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    setHasUserGesture(true)

    if (nextMuted) {
      fadeAudio(0, 150)
      setTimeout(() => {
        if (el) el.muted = true
      }, 150)
    } else {
      el.muted = false
      el.volume = 0
      if (el.paused) {
        el.play().catch(() => {})
      }
      fadeAudio(1, 300)
    }
  }

  return (
    <div className="group/video relative h-full w-full overflow-hidden">
      <video
        ref={ref}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onCanPlay={() => setReady(true)}
        className={cn(
          'absolute left-0 top-0 h-full w-full origin-top-left object-cover',
          'transition-opacity duration-700 ease-cs',
          ready ? 'opacity-100' : 'opacity-0',
          className
        )}
        style={{
          transform: scale === 1 ? undefined : `scale(${scale})`,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      />

      {/* Floating Sound Control Button (Icon Only) */}
      <div className="pointer-events-auto absolute bottom-3 right-3 z-30">
        <button
          type="button"
          onClick={toggleSound}
          title={!isMuted && isInView ? 'Silenciar audio' : 'Activar audio'}
          aria-label={!isMuted && isInView ? 'Silenciar audio' : 'Activar audio'}
          className={cn(
            'relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
            'backdrop-blur-md shadow-lg border',
            !isMuted && isInView
              ? 'border-primary/50 bg-ink/85 text-primary hover:bg-ink hover:scale-110 hover:border-primary shadow-primary/20'
              : 'border-line-strong bg-ink/80 text-muted-foreground hover:text-foreground hover:bg-ink-raise hover:scale-110'
          )}
        >
          {!isMuted && isInView ? (
            <Volume2 className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <VolumeX className="h-4 w-4 shrink-0" />
          )}
        </button>
      </div>
    </div>
  )
}
