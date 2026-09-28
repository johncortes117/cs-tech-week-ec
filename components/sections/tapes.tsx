'use client'

import { ScrollVelocity } from '@/components/ui/scroll-velocity'
import { Wordmark } from '@/components/brand/logo'

/* ============================================================
   THE RIBBON, FULL WIDTH

   The logo's ribbon taken off the bulb and stretched across the
   page, where the night of the hero turns into day. Built like
   the original: a cyan front carrying the name, and a plain
   slate back crossing behind it — in the logo the back of the
   ribbon has no lettering either.

   It adds no information, on purpose. Its job is the seam.
   ============================================================ */

export function Tapes() {
  return (
    <div aria-hidden="true" className="relative isolate h-[132px] overflow-hidden md:h-[188px]">
      {/* night above, day below: the tapes cover the join */}
      <div className="tone-night absolute inset-x-0 top-0 h-1/2 bg-bg" />
      <div className="tone-day absolute inset-x-0 bottom-0 h-1/2 bg-bg" />

      {/* back of the ribbon */}
      <div className="absolute left-[-6%] right-[-6%] top-1/2 h-[46px] -translate-y-1/2 rotate-[2.6deg] bg-slate shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] md:h-[64px]" />

      {/* front of the ribbon */}
      <div className="absolute left-[-6%] right-[-6%] top-1/2 -translate-y-1/2 -rotate-[2.2deg] bg-[#00AEEF] py-3.5 text-night shadow-[0_22px_50px_-26px_rgba(0,40,85,0.7)] md:py-5">
        <ScrollVelocity baseVelocity={34} copies={4}>
          <span className="flex items-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="flex items-center">
                <Wordmark className="h-[18px] w-auto md:h-[26px]" />
                <span className="mx-6 font-display text-[18px] font-black uppercase tracking-[0.08em] md:mx-10 md:text-[26px]">
                  Ecuador
                </span>
                <span className="mr-6 h-2 w-2 rotate-45 bg-night md:mr-10 md:h-2.5 md:w-2.5" />
              </span>
            ))}
          </span>
        </ScrollVelocity>
      </div>
    </div>
  )
}
