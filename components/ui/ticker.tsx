'use client'

import { ScrollVelocity } from '@/components/ui/scroll-velocity'
import { ticker } from '@/lib/content'

/* ============================================================
   TICKER
   Separator band between the hero and the body of the site. It
   deliberately adds no new information: its job is to mark the
   break and to prove, on the first scroll, that the page
   responds to the gesture and not only to the position.
   ============================================================ */

export function Ticker() {
  return (
    <div
      className="relative isolate overflow-hidden border-y border-line bg-ink-raise/40 py-5"
      /* The fade goes on the container and is wide: if the text is
         cut off sharply, the band looks broken rather than infinite. */
      style={{
        maskImage: 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(90deg, hsl(var(--abyss) / 0.5), transparent 30%, transparent 70%, hsl(var(--abyss) / 0.5))',
        }}
      />
      <ScrollVelocity baseVelocity={26} copies={3}>
        <span className="flex items-center">
          {ticker.map((t, i) => (
            <span key={`${t}-${i}`} className="flex items-center">
              <span className="whitespace-nowrap font-display text-[clamp(1.1rem,2.6vw,1.9rem)] font-extrabold uppercase tracking-head text-foreground/85">
                {t}
              </span>
              {/* the orange dot is the same meridian marker */}
              <span className="mx-6 h-1.5 w-1.5 flex-none rounded-full bg-primary md:mx-9" />
            </span>
          ))}
        </span>
      </ScrollVelocity>
    </div>
  )
}
