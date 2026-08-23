'use client'

import * as React from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from '@/lib/use-reduced-motion'

/* ============================================================
   SCROLL SUAVE — Lenis

   Es la capa que más se siente y menos se ve: cambia la inercia
   de TODO el sitio. Sin esto, cada parallax y cada haz de scroll
   se mueven a saltos de rueda; con esto, el documento entero se
   desplaza con la misma curva que el resto del movimiento.

   Lenis se apaga por completo con prefers-reduced-motion: ahí
   manda el scroll nativo del sistema. La navegación por anclas,
   en cambio, se gestiona SIEMPRE desde aquí — ver más abajo por
   qué no basta con el salto nativo.
   ============================================================ */

let instance: Lenis | null = null

/** Congela el scroll (menú móvil abierto, modales). */
export const lockScroll = () => {
  instance?.stop()
  document.body.style.overflow = 'hidden'
}

/** Devuelve el scroll. */
export const unlockScroll = () => {
  instance?.start()
  document.body.style.overflow = ''
}

/**
 * Empujón de un píxel, ida y vuelta, en dos fotogramas seguidos.
 *
 * No es superstición: los IntersectionObserver que disparan los
 * reveals (`whileInView`, `useInView`) se evalúan en el paso de
 * renderizado, y un salto de scroll instantáneo y largo —el que
 * produce un ancla— puede completarse sin que llegue a haber una
 * reevaluación. El resultado es una sección de destino que se
 * queda en su estado inicial, invisible, hasta que el usuario
 * mueve la rueda. Se reproduce sobre todo con reduced-motion,
 * donde el salto es realmente instantáneo.
 *
 * Un desplazamiento mínimo fuerza esa reevaluación y el usuario
 * no lo percibe.
 */
const nudgeObservers = () => {
  requestAnimationFrame(() => {
    window.scrollBy(0, 1)
    requestAnimationFrame(() => window.scrollBy(0, -1))
  })
}

const navOffset = () => {
  const nav = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
    10
  )
  return -((Number.isNaN(nav) ? 68 : nav) + 28)
}

/** Desplaza a un ancla respetando la altura de la barra fija. */
export const scrollToHash = (hash: string) => {
  const el = document.querySelector(hash)
  if (!el) return
  const offset = navOffset()

  if (instance) {
    instance.scrollTo(el as HTMLElement, {
      offset,
      duration: 1.25,
      onComplete: nudgeObservers,
    })
    return
  }

  window.scrollTo({
    top: (el as HTMLElement).getBoundingClientRect().top + window.scrollY + offset,
    behavior: 'auto',
  })
  nudgeObservers()
}

export function SmoothScroll() {
  const reduce = useReducedMotion()

  /* ---------- Lenis ---------- */
  React.useEffect(() => {
    if (reduce) return

    const lenis = new Lenis({
      duration: 1.05,
      /* exponencial: arranca inmediato y frena largo — la misma
         sensación que la curva `cs` del resto del sitio */
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })
    instance = lenis

    let raf = 0
    const loop = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      instance = null
    }
  }, [reduce])

  /* ---------- navegación por anclas ---------- */
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return
      const target = e.target as HTMLElement | null
      const a = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const hash = a.getAttribute('href')
      if (!hash || hash === '#' || !document.querySelector(hash)) return
      e.preventDefault()
      scrollToHash(hash)
      history.replaceState(null, '', hash)
    }
    document.addEventListener('click', onClick)

    /* enlace profundo: se llega con el hash ya puesto en la URL */
    if (window.location.hash) nudgeObservers()

    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
