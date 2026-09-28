import { cn } from '@/lib/utils'
import type { CSSProperties, ReactNode } from 'react'

/* ============================================================
   LA CINTA
   The logo's ribbon as a UI element: a band that ends in an
   arrow tip. It labels tracks, spans days on the week strip and
   carries the name across the page. Shape lives in globals.css
   (.ribbon / .ribbon-tail); this only sets type and colour.
   ============================================================ */

export function Ribbon({
  children,
  className,
  style,
  tail = false,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  /** Cut the start too, like the swallow-tail the logo's ribbon begins with. */
  tail?: boolean
}) {
  return (
    <span
      className={cn(
        'ribbon inline-flex items-center gap-2 whitespace-nowrap py-[0.42em] pl-[0.8em] font-display font-extrabold uppercase leading-none tracking-[0.06em]',
        tail && 'ribbon-tail',
        className
      )}
      style={style}
    >
      {children}
    </span>
  )
}
