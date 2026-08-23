'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   GLOWING EFFECT  ·  adaptado de Aceternity UI

   Un arco de luz recorre el borde de la tarjeta apuntando
   siempre al cursor. El original usa una paleta arcoíris fija;
   acá el arco se construye con el color del track más un acento
   de marca, así cada tarjeta se enciende con SU color y el
   sistema sigue leyéndose como uno solo.

   Dos diferencias de fondo con el original, ambas por coste:

   · UN SOLO OÍDO. El componente de Aceternity registra un
     listener de `pointermove` y otro de `scroll` por instancia.
     Con ocho tarjetas en pantalla eso son ocho lecturas de
     geometría —ocho reflows— por cada movimiento del ratón. Acá
     hay un único listener de módulo que reparte la posición a
     todas las instancias dentro de un mismo rAF.

   · SIN `animate()` POR MOVIMIENTO. El original lanza una
     animación nueva de Motion en cada evento, que se descarta al
     siguiente. Acá el ángulo se persigue con una interpolación
     en el mismo bucle: mismo resultado visual, cero basura.

   El anillo desenfocado del halo también desapareció: `filter:
   blur()` sobre ocho elementos obliga a rasterizar ocho
   superficies extra por cuadro, y medido costaba más que todo lo
   demás junto. El arco nítido ya lee como luz.
   ============================================================ */

type Sub = (x: number, y: number) => void

const subs = new Set<Sub>()
let listening = false
let lastX = -9999
let lastY = -9999
let frame = 0

function flush() {
  frame = 0
  for (const s of subs) s(lastX, lastY)
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(flush)
}

function subscribe(fn: Sub): () => void {
  subs.add(fn)
  if (!listening) {
    listening = true
    document.addEventListener(
      'pointermove',
      (e) => {
        lastX = e.clientX
        lastY = e.clientY
        schedule()
      },
      { passive: true }
    )
    /* al hacer scroll la tarjeta se mueve bajo un cursor quieto:
       hay que recalcular con la última posición conocida */
    window.addEventListener('scroll', schedule, { passive: true })
  }
  return () => {
    subs.delete(fn)
  }
}

type Props = {
  /** Hex de 6 dígitos. Por defecto, naranja PMS 137. */
  color?: string
  /** Segundo tono del arco. Por defecto, cian Process. */
  accent?: string
  /** Radio muerto en el centro: evita que el arco tiemble al pasar por el medio. */
  inactiveZone?: number
  /** Margen alrededor de la tarjeta que ya cuenta como "cerca". */
  proximity?: number
  /** Apertura del arco, en grados. */
  spread?: number
  borderWidth?: number
  className?: string
  disabled?: boolean
}

export const GlowingEffect = React.memo(function GlowingEffect({
  color = '#FFA300',
  accent = '#00B5E2',
  inactiveZone = 0.55,
  proximity = 52,
  spread = 36,
  borderWidth = 1,
  className,
  disabled = false,
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null)
  const angle = React.useRef({ current: 0, target: 0 })
  const reduce = useReducedMotion()
  const off = disabled || reduce

  React.useEffect(() => {
    if (off) return

    const update = (mx: number, my: number) => {
      const el = ref.current
      if (!el) return
      const { left, top, width, height } = el.getBoundingClientRect()

      /* fuera de la ventana no hay nada que iluminar */
      if (top > window.innerHeight || top + height < 0) {
        el.style.setProperty('--active', '0')
        return
      }

      const cx = left + width * 0.5
      const cy = top + height * 0.5
      const dead = 0.5 * Math.min(width, height) * inactiveZone

      if (Math.hypot(mx - cx, my - cy) < dead) {
        el.style.setProperty('--active', '0')
        return
      }

      const near =
        mx > left - proximity &&
        mx < left + width + proximity &&
        my > top - proximity &&
        my < top + height + proximity

      el.style.setProperty('--active', near ? '1' : '0')
      if (!near) return

      /* camino corto del círculo: sin esto el arco da una vuelta
         entera cada vez que el ángulo cruza los 360° */
      const target = (180 * Math.atan2(my - cy, mx - cx)) / Math.PI + 90
      const a = angle.current
      a.target = a.current + ((((target - a.current) % 360) + 540) % 360) - 180
      a.current += (a.target - a.current) * 0.12
      el.style.setProperty('--start', String(a.current))

      /* mientras el arco siga persiguiendo al cursor, pide otro
         cuadro aunque el ratón se haya detenido */
      if (Math.abs(a.target - a.current) > 0.4) schedule()
    }

    return subscribe(update)
  }, [off, inactiveZone, proximity])

  if (off) return null

  /* El arco: un solo cónico que arranca en --start (el ángulo
     hacia el cursor) y se apaga a --spread grados de cada lado.
     El color del track ocupa el centro y el acento los filos,
     que es como se comporta la luz al rozar un canto metálico. */
  const gradient = `conic-gradient(
      from calc((var(--start) - var(--spread)) * 1deg),
      transparent 0deg,
      ${accent}00 calc(var(--spread) * 0.15deg),
      ${accent} calc(var(--spread) * 0.6deg),
      ${color} calc(var(--spread) * 1deg),
      ${accent} calc(var(--spread) * 1.4deg),
      ${accent}00 calc(var(--spread) * 1.85deg),
      transparent calc(var(--spread) * 2deg),
      transparent 360deg
    )`

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={
        {
          '--spread': spread,
          '--start': '0',
          '--active': '0',
          '--glow-border-width': `${borderWidth}px`,
          '--glow-gradient': gradient,
        } as React.CSSProperties
      }
      className={cn('pointer-events-none absolute inset-0 rounded-[inherit]', className)}
    >
      <div className="glow-ring rounded-[inherit]" />
    </div>
  )
})
