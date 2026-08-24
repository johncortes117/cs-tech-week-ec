'use client'

import * as React from 'react'
import { motion, useMotionValue, useAnimationFrame } from 'motion/react'
import { Instagram } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MarqueeItem = {
  logo: string
  name: string
  instagram: string
  university?: string
}

/*
 * Infinite 3D Marquee — 2 columns × 5 logos, truly seamless.
 *
 * Architecture:
 *   • Each column renders 5 logos × 5 copies = 25 items.
 *   • Two marker refs on items [0] and [5] measure the EXACT pixel height
 *     of one set (including all flex gaps). No division, no rounding error.
 *   • useAnimationFrame advances a motion value every frame.
 *   • Wrap uses `while` so even frame-skip can't break it.
 *   • Content starts hidden and fades in only after measurement,
 *     so there's never a flash of the non-offset (top-of-list) position.
 *   • Column 0 scrolls UP, Column 1 scrolls DOWN, both start mid-stream.
 */

const NUM_COPIES = 5
const SPEED = 38 // px per second

export const ThreeDMarquee = ({
  items,
  className,
}: {
  items: MarqueeItem[]
  className?: string
}) => {
  const col0 = React.useMemo(() => items.slice(0, 5), [items])
  const col1 = React.useMemo(() => items.slice(5, 10), [items])

  return (
    <div
      data-no-cursor="true"
      className={cn(
        'relative mx-auto flex h-[400px] sm:h-[460px] md:h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl mask-fade-y select-none',
        className
      )}
    >
      {/* Central atmosphere glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, hsl(var(--deep) / 0.32), hsl(var(--orange) / 0.08) 45%, transparent 75%)',
        }}
      />

      {/* 3D Isometric Viewport */}
      <div className="relative flex items-center justify-center">
        <div
          style={{
            transform: 'rotateX(50deg) rotateZ(-30deg)',
            transformStyle: 'preserve-3d',
          }}
          className="grid grid-cols-2 gap-6 sm:gap-8 md:gap-10 origin-center transform-3d scale-[0.65] sm:scale-[0.8] md:scale-[0.9] lg:scale-[0.96]"
        >
          <MarqueeColumn items={col0} direction="up" keyPrefix="c0" />
          <MarqueeColumn items={col1} direction="down" keyPrefix="c1" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function MarqueeColumn({
  items,
  direction,
  keyPrefix,
}: {
  items: MarqueeItem[]
  direction: 'up' | 'down'
  keyPrefix: string
}) {
  const y = useMotionValue(0)
  const setH = React.useRef(0)
  const [ready, setReady] = React.useState(false)

  // Marker refs — placed on the FIRST item of copy 0 and copy 1
  const markerA = React.useRef<HTMLDivElement>(null)
  const markerB = React.useRef<HTMLDivElement>(null)

  // 5 original items × NUM_COPIES
  const allItems = React.useMemo(
    () => Array.from({ length: NUM_COPIES }, () => items).flat(),
    [items]
  )

  const ITEMS_PER_SET = items.length // 5

  // Measure the exact pixel height of one set using marker refs
  React.useEffect(() => {
    const measure = () => {
      if (!markerA.current || !markerB.current) return

      // offsetTop gives position relative to the offsetParent
      const h = markerB.current.offsetTop - markerA.current.offsetTop
      if (h <= 0) return

      setH.current = h

      // Start mid-stream so the content is never seen from the top
      y.set(direction === 'up' ? -h : -h * 2)
      setReady(true)
    }

    // Wait two frames so the layout is fully settled
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(measure)
      return () => cancelAnimationFrame(raf2)
    })
    return () => cancelAnimationFrame(raf1)
  }, [allItems, direction, y])

  // Drive the scroll every single frame
  useAnimationFrame((_, delta) => {
    const h = setH.current
    if (h <= 0) return

    const px = SPEED * (delta / 1000)
    let next = y.get()

    if (direction === 'up') {
      next -= px
      // When we've scrolled past 2 full sets, wrap back by 1 set
      while (next <= -h * 2) next += h
    } else {
      next += px
      // When we've scrolled back past 1 full set, wrap forward by 1 set
      while (next >= -h) next -= h
    }

    y.set(next)
  })

  return (
    <div className="relative overflow-visible">
      <GridLineVertical className="-left-3" offset="80px" />
      <motion.div
        style={{ y }}
        className={cn(
          'flex flex-col gap-5 sm:gap-6 will-change-transform',
          ready ? 'opacity-100' : 'opacity-0'
        )}
      >
        {allItems.map((item, idx) => (
          <div
            key={`${keyPrefix}-${idx}`}
            ref={
              idx === 0
                ? markerA
                : idx === ITEMS_PER_SET
                  ? markerB
                  : undefined
            }
            className="relative w-full shrink-0"
          >
            <GridLineHorizontal className="-top-3" offset="24px" />
            <a
              href={item.instagram}
              target="_blank"
              rel="noopener noreferrer"
              title={`Visitar Instagram de ${item.name}`}
              className="group relative flex h-[130px] sm:h-[150px] md:h-[165px] w-[310px] sm:w-[360px] md:w-[400px] items-center justify-center overflow-hidden rounded-2xl border border-line-strong/90 bg-ink-raise/95 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.08] backdrop-blur-md transition-all duration-300 hover:-translate-y-2.5 hover:scale-105 hover:border-primary/80 hover:bg-ink-plate hover:ring-primary/50 hover:shadow-[0_24px_60px_rgba(255,163,0,0.25)]"
            >
              {/* Hover glow */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(85% 85% at 50% 50%, hsl(var(--orange) / 0.16), transparent 75%)',
                }}
              />

              {/* Logo */}
              <img
                src={item.logo}
                alt={`Logo ${item.name}`}
                className="max-h-[85px] sm:max-h-[100px] md:max-h-[110px] w-auto max-w-[88%] object-contain filter drop-shadow-[0_6px_20px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-cs group-hover:scale-110"
                loading="lazy"
              />

              {/* IG indicator */}
              <span className="absolute bottom-2.5 right-3 inline-flex items-center gap-1 rounded-full border border-primary/35 bg-ink/90 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                <Instagram className="h-3 w-3" />
                <span>IG</span>
              </span>
            </a>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string
  offset?: string
}) => (
  <div
    style={
      {
        '--color': 'rgba(255, 163, 0, 0.12)',
        '--height': '1px',
        '--width': '6px',
        '--offset': offset || '200px',
      } as React.CSSProperties
    }
    className={cn(
      'absolute left-[calc(var(--offset)/2*-1)] h-[var(--height)] w-[calc(100%+var(--offset))]',
      'bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)]',
      '[background-size:var(--width)_var(--height)]',
      'z-20 pointer-events-none',
      className
    )}
  />
)

const GridLineVertical = ({
  className,
  offset,
}: {
  className?: string
  offset?: string
}) => (
  <div
    style={
      {
        '--color': 'rgba(255, 163, 0, 0.12)',
        '--height': '6px',
        '--width': '1px',
        '--offset': offset || '150px',
      } as React.CSSProperties
    }
    className={cn(
      'absolute top-[calc(var(--offset)/2*-1)] h-[calc(100%+var(--offset))] w-[var(--width)]',
      'bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)]',
      '[background-size:var(--width)_var(--height)]',
      'z-20 pointer-events-none',
      className
    )}
  />
)
