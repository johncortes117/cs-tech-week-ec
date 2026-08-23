'use client'

import * as React from 'react'
import { motion, useInView } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'
import { EASE } from '@/lib/motion'

/* ============================================================
   EFECTOS DE TEXTO
   Tres piezas tomadas de React Bits y reescritas para este
   sistema. Cada una tiene un trabajo distinto y un solo lugar
   donde se usa — el texto que se mueve todo el tiempo cansa.
   ============================================================ */

/* ------------------------------------------------------------
   SHINY TEXT — un reflejo cruza la palabra cada pocos segundos.
   Para etiquetas pequeñas (el sello del 80.º), nunca para copy.
   ------------------------------------------------------------ */

export function ShinyText({
  children,
  className,
  speed = 5,
  disabled = false,
}: {
  children: React.ReactNode
  className?: string
  speed?: number
  disabled?: boolean
}) {
  const reduce = useReducedMotion()
  if (reduce || disabled) return <span className={className}>{children}</span>

  return (
    <span
      className={cn('shiny-text', className)}
      style={{ ['--shine-duration' as string]: `${speed}s` }}
    >
      {children}
    </span>
  )
}

/* ------------------------------------------------------------
   SCRAMBLE / DECRYPTED TEXT — el texto se "desencripta" letra a
   letra desde glifos aleatorios. Es la cita más directa al
   atributo "Binary" del prisma de marca de IEEE CS, así que va
   en los datos técnicos: coordenadas, códigos de sección.
   ------------------------------------------------------------ */

const GLYPHS = '01<>/\[]{}=+*#%&$@ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function Scramble({
  text,
  className,
  /** ms entre pasos. Más bajo = se resuelve más rápido. */
  step = 38,
  /** cuántos pasos tarda cada letra en fijarse */
  settle = 3,
  /** 'view' resuelve al entrar en pantalla; 'hover' al pasar el cursor */
  trigger = 'view',
  as: Tag = 'span',
}: {
  text: string
  className?: string
  step?: number
  settle?: number
  trigger?: 'view' | 'hover'
  as?: 'span' | 'div'
}) {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [out, setOut] = React.useState(reduce ? text : ' '.repeat(text.length))
  const timer = React.useRef<number>(0)

  const run = React.useCallback(() => {
    if (reduce) return setOut(text)
    let frame = 0
    const total = text.length * settle + settle * 2

    window.clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      frame += 1
      const revealed = Math.floor(frame / settle)
      setOut(
        text
          .split('')
          .map((ch, i) => {
            if (ch === ' ') return ' '
            if (i < revealed) return ch
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join('')
      )
      if (frame > total) {
        window.clearInterval(timer.current)
        setOut(text)
      }
    }, step)
  }, [text, step, settle, reduce])

  React.useEffect(() => {
    if (trigger === 'view' && inView) run()
    return () => window.clearInterval(timer.current)
  }, [inView, trigger, run])

  return (
    <Tag
      ref={ref as never}
      className={cn('tabular', className)}
      onMouseEnter={trigger === 'hover' ? run : undefined}
      aria-label={text}
    >
      <span aria-hidden="true">{out}</span>
    </Tag>
  )
}

/* ------------------------------------------------------------
   SPLIT TEXT — cada palabra sube desde debajo de su máscara al
   entrar en pantalla. Es la versión "de sección" del titular
   enmascarado del hero: mismo lenguaje, menos peso.
   ------------------------------------------------------------ */

export function SplitText({
  text,
  className,
  delay = 0,
  step = 0.045,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  delay?: number
  step?: number
  as?: 'span' | 'h2' | 'h3'
}) {
  const reduce = useReducedMotion()
  const words = text.split(' ')

  if (reduce) return <Tag className={className}>{text}</Tag>

  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        /* El espacio va FUERA de la máscara, como nodo de texto
           real. Un margen en em nunca coincide del todo con el
           ancho del espacio de la fuente, y a tamaño de titular
           esa diferencia se lee como palabras sueltas. */
        <React.Fragment key={`${w}-${i}`}>
          <span
            aria-hidden="true"
            className="inline-block overflow-hidden pb-[0.08em] align-bottom"
          >
            <motion.span
              className="inline-block"
              initial={{ y: '105%' }}
              whileInView={{ y: '0%' }}
              data-reveal
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.75, ease: EASE, delay: delay + i * step }}
            >
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </Tag>
  )
}
