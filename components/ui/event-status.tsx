'use client'

import { cn } from '@/lib/utils'
import { countdownLabel, useEventStatus } from '@/lib/use-event-status'
import { week } from '@/lib/content'
import { LiveDot } from '@/components/ui/primitives'

/* ============================================================
   STATUS LINE
   One sentence that always says where the week stands. Before
   the first tick on the client it renders an invisible spacer of
   the same size, so hydration matches and nothing jumps.
   ============================================================ */

export function StatusLine({ className, compact = false }: { className?: string; compact?: boolean }) {
  const status = useEventStatus()

  if (!status) {
    return (
      <span className={cn('invisible inline-flex items-center gap-2.5', className)} aria-hidden="true">
        <span className="h-2 w-2" />
        <span>Empieza en 0d 00:00:00</span>
      </span>
    )
  }

  if (status.phase === 'done') {
    if (compact) return null
    return <span className={cn('inline-flex items-center gap-2.5', className)}>Edición 2026 · Gracias por acompañarnos</span>
  }

  if (status.phase === 'soon') {
    return (
      <span className={cn('inline-flex items-center gap-2.5', className)} role="timer" aria-live="off">
        <span className="h-2 w-2 rounded-full border border-orange" aria-hidden="true" />
        <span>
          Empieza en <span className="tabular text-fg">{countdownLabel(status)}</span>
        </span>
      </span>
    )
  }

  const total = week.days.length
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {status.onAir ? <LiveDot /> : <span className="h-2 w-2 rounded-full bg-orange" aria-hidden="true" />}
      <span>
        {status.onAir ? (
          <>
            <span className="text-fg">En vivo</span>
            {compact ? null : <> · {status.onAir.label}</>}
          </>
        ) : (
          <>
            Día <span className="tabular text-fg">{status.day + 1}</span> de {total}
          </>
        )}
      </span>
    </span>
  )
}
