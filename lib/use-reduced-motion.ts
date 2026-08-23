'use client'

import * as React from 'react'

/* ============================================================
   MOTION PREFERENCE — hydration-safe version

   Motion's `useReducedMotion` reads the media query synchronously
   on the first client render, but on the server it always returns
   `false`. For anyone with the setting enabled that means server
   and client produce different markup on the first render — and
   React 19 treats that as a hydration error, throws away the
   server HTML and re-renders the whole page on the client.

   This hook returns `false` on the first render (same as the
   server) and corrects itself right after mounting. The cost is
   one frame; in exchange, hydration never breaks. CSS already
   neutralises the purely declarative animations during that
   frame via @media (prefers-reduced-motion: reduce).
   ============================================================ */

const QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  const [reduce, setReduce] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia(QUERY)
    setReduce(mq.matches)

    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduce
}
