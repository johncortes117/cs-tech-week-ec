import type { Transition, Variants } from 'motion/react'

/* ============================================================
   VOCABULARIO DE MOVIMIENTO
   Un solo set de curvas y variantes para todo el sitio. Si una
   animación no sale de aquí, no debería existir: la coherencia
   es lo que separa "moderno" de "ruidoso".
   ============================================================ */

/** Curva firma: sale rápido, se asienta largo. */
export const EASE = [0.22, 1, 0.36, 1] as const

/** Resorte estándar — el mismo que usamos en DevIAthon. */
export const SPRING: Transition = {
  type: 'spring',
  stiffness: 120,
  damping: 18,
  mass: 0.9,
}

/** Resorte corto para micro-interacción (hover, tap, chips). */
export const SPRING_SNAP: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.6,
}

/** Viewport por defecto: una sola vez, disparando un poco antes. */
export const VIEWPORT = { once: true, margin: '-80px' } as const

/* ---------- variantes reutilizables ---------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: SPRING },
}

/** Contenedor que escalona a sus hijos. */
export const stagger = (staggerChildren = 0.07, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

/**
 * Titular por líneas: cada línea sube desde debajo de su propia
 * máscara. Es el momento orquestado de la página — se usa UNA vez.
 */
export const lineMask: Variants = {
  hidden: { y: '110%' },
  show: (i: number = 0) => ({
    y: '0%',
    transition: { duration: 0.9, ease: EASE, delay: 0.12 + i * 0.09 },
  }),
}

/** Trazo de la línea ecuatorial en la carga del hero. */
export const drawLine: Variants = {
  hidden: { scaleX: 0, opacity: 0 },
  show: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 1.1, ease: EASE, delay: 0.35 },
  },
}

/** Colapso/expansión de alto para acordeones. */
export const collapse: Variants = {
  hidden: { height: 0, opacity: 0 },
  show: {
    height: 'auto',
    opacity: 1,
    transition: { height: { duration: 0.36, ease: EASE }, opacity: { duration: 0.25, delay: 0.06 } },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { height: { duration: 0.3, ease: EASE }, opacity: { duration: 0.15 } },
  },
}

/**
 * Devuelve variantes neutralizadas cuando el usuario pide menos
 * movimiento: todo se resuelve a opacidad, sin desplazamiento.
 */
export const still: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
}
