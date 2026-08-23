'use client'

import * as React from 'react'

/* ============================================================
   PREFERENCIA DE MOVIMIENTO — versión segura para hidratación

   El `useReducedMotion` de Motion lee la media query de forma
   síncrona en el primer render del cliente, pero en el servidor
   siempre devuelve `false`. Para quien tiene el ajuste activado,
   eso significa que servidor y cliente producen marcado distinto
   en el primer render — y React 19 lo trata como error de
   hidratación, tira el HTML del servidor y vuelve a renderizar
   toda la página en el cliente.

   Este hook devuelve `false` en el primer render (igual que el
   servidor) y se corrige justo después de montar. El coste es un
   fotograma; a cambio, la hidratación nunca se rompe. El CSS ya
   neutraliza las animaciones puramente declarativas en ese
   fotograma vía @media (prefers-reduced-motion: reduce).
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
