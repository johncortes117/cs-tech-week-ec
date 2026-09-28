'use client'

import * as React from 'react'

/* ============================================================
   3D LOGO — the React side
   A div for three.js to draw into. The scene module (and three
   itself) is imported only here, after mount, so it lands in its
   own chunk and never delays the first paint. Whatever goes
   wrong — no WebGL, a failed chunk — is reported as 'failed' and
   the hero keeps the flat SVG mark.
   ============================================================ */

export function Logo3D({
  className,
  onStatus,
}: {
  className?: string
  onStatus: (status: 'ready' | 'failed') => void
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const report = React.useRef(onStatus)
  report.current = onStatus

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    let dispose = () => {}
    let cancelled = false

    import('./logo-scene')
      .then(({ createLogoScene }) => {
        if (cancelled) return
        dispose = createLogoScene(el, { onReady: () => report.current('ready') })
      })
      .catch(() => report.current('failed'))

    return () => {
      cancelled = true
      dispose()
    }
  }, [])

  return <div ref={ref} className={className} aria-hidden="true" />
}
