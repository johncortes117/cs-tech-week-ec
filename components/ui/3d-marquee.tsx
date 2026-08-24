'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { Instagram } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MarqueeItem = {
  logo: string
  name: string
  instagram: string
  university?: string
}

export const ThreeDMarquee = ({
  items,
  className,
}: {
  items: MarqueeItem[]
  className?: string
}) => {
  // Ensure enough items to fill 4 columns by repeating if necessary
  const displayItems = React.useMemo(() => {
    if (items.length === 0) return []
    let result = [...items]
    while (result.length < 24) {
      result = [...result, ...items]
    }
    return result.slice(0, 24)
  }, [items])

  // Split the items array into 4 equal columns
  const chunkSize = Math.ceil(displayItems.length / 4)
  const chunks = Array.from({ length: 4 }, (_, colIndex) => {
    const start = colIndex * chunkSize
    return displayItems.slice(start, start + chunkSize)
  })

  return (
    <div
      className={cn(
        'relative mx-auto block h-[540px] md:h-[620px] w-full overflow-hidden rounded-2xl mask-fade-y',
        className
      )}
    >
      {/* Ambient background glow behind the 3D plane */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, hsl(var(--deep) / 0.22), hsl(var(--orange) / 0.06) 40%, transparent 75%)',
        }}
      />

      <div className="flex size-full items-center justify-center">
        <div className="size-[1500px] md:size-[1720px] shrink-0 scale-[0.62] sm:scale-75 lg:scale-95 transition-transform duration-500">
          <div
            style={{
              transform: 'rotateX(52deg) rotateY(0deg) rotateZ(-45deg)',
              transformStyle: 'preserve-3d',
            }}
            className="relative top-72 md:top-88 right-[46%] grid size-full origin-top-left grid-cols-4 gap-6 md:gap-8 transform-3d"
          >
            {chunks.map((subarray, colIndex) => (
              <motion.div
                animate={{ y: colIndex % 2 === 0 ? 80 : -80 }}
                transition={{
                  duration: colIndex % 2 === 0 ? 12 : 16,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
                key={colIndex + 'marquee'}
                className="flex flex-col items-start gap-6 md:gap-8"
              >
                <GridLineVertical className="-left-4" offset="80px" />
                {subarray.map((item, itemIndex) => (
                  <div className="relative w-full" key={itemIndex + item.name}>
                    <GridLineHorizontal className="-top-4" offset="20px" />
                    <motion.a
                      href={item.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Visitar Instagram de ${item.name}`}
                      whileHover={{
                        y: -12,
                        scale: 1.05,
                      }}
                      transition={{
                        duration: 0.25,
                        ease: 'easeInOut',
                      }}
                      data-cursor
                      className="group relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-line bg-ink-raise/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors duration-300 hover:border-primary/70 hover:bg-ink-plate hover:shadow-[0_16px_45px_rgba(255,163,0,0.25)]"
                    >
                      {/* Subtle hover gradient */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background:
                            'radial-gradient(80% 80% at 50% 50%, hsl(var(--orange) / 0.12), transparent 70%)',
                        }}
                      />

                      {/* Clean Logo Display */}
                      <img
                        src={item.logo}
                        alt={`Logo ${item.name}`}
                        className="max-h-14 sm:max-h-16 max-w-[85%] object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-cs group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Micro Instagram Badge on Hover */}
                      <span className="absolute bottom-2 right-2.5 inline-flex items-center gap-1 rounded-full border border-primary/30 bg-ink/90 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <Instagram className="h-2.5 w-2.5" />
                        <span>IG</span>
                      </span>
                    </motion.a>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const GridLineHorizontal = ({
  className,
  offset,
}: {
  className?: string
  offset?: string
}) => {
  return (
    <div
      style={
        {
          '--background': '#05070B',
          '--color': 'rgba(255, 163, 0, 0.15)',
          '--height': '1px',
          '--width': '6px',
          '--fade-stop': '90%',
          '--offset': offset || '200px',
          '--color-dark': 'rgba(255, 255, 255, 0.12)',
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
}

const GridLineVertical = ({
  className,
  offset,
}: {
  className?: string
  offset?: string
}) => {
  return (
    <div
      style={
        {
          '--background': '#05070B',
          '--color': 'rgba(255, 163, 0, 0.15)',
          '--height': '6px',
          '--width': '1px',
          '--fade-stop': '90%',
          '--offset': offset || '150px',
          '--color-dark': 'rgba(255, 255, 255, 0.12)',
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
}
