import { cn } from '@/lib/utils'
import { MARK, WORDMARK } from './logo-paths'

/* ============================================================
   THE MARK
   Drawn from the event's own SVG, never a raster. The cyan and
   the warm orange are the logo's exact values; its dark blue
   comes from --logo-ink, which each tone sets (see globals.css)
   so the same mark works by day and by night.
   ============================================================ */

export const LOGO = {
  cyan: '#00AEEF',
  warm: '#FAA41A',
  ink: 'var(--logo-ink)',
  /** The mark without the wordmark. */
  viewBox: '0 0 776 856',
} as const

export function Mark({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox={LOGO.viewBox}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path d={MARK.ribbon} fill={LOGO.cyan} />
      <path d={MARK.arcOuter} fill={LOGO.cyan} />
      <path d={MARK.arcWarm} fill={LOGO.warm} />
      <path d={MARK.neckWarm} fill={LOGO.warm} />
      <path d={MARK.neckCool} fill={LOGO.cyan} />
      <path d={MARK.ribbonBackLeft} style={{ fill: LOGO.ink }} />
      <path d={MARK.ribbonBackRight} style={{ fill: LOGO.ink }} />
      <path d={MARK.ribbonBackRightLight} fill={LOGO.cyan} />
      {MARK.base.map((d) => (
        <path key={d.slice(0, 12)} d={d} style={{ fill: LOGO.ink }} />
      ))}
      <path d={MARK.arcInner} style={{ fill: LOGO.ink }} />
      <path d={MARK.cap} style={{ fill: LOGO.ink }} />
    </svg>
  )
}

/** "CS TECH WEEK" in the logo's lettering. Takes the current text colour. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox="3 901 766 90" className={className} aria-hidden="true" fill="currentColor">
      {WORDMARK.map((d) => (
        <path key={d.slice(0, 12)} d={d} />
      ))}
    </svg>
  )
}

/** Horizontal lockup for the header and footer. */
export function Lockup({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Mark className="h-9 w-auto flex-none" />
      <span className="flex flex-col gap-[5px]">
        <Wordmark className="h-[11px] w-auto" />
        <span className="font-mono text-[8.5px] font-medium uppercase leading-none tracking-[0.34em] text-subtle">
          Ecuador · 2026
        </span>
      </span>
    </span>
  )
}
