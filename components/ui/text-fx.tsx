'use client'

import * as React from 'react'
import { motion, useInView } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'
import { EASE } from '@/lib/motion'

/* ============================================================
   TEXT EFFECTS
   Three pieces taken from React Bits and rewritten for this
   system. Each has a distinct job and exactly one place where it
   is used — text that moves all the time is tiring.
   ============================================================ */

/* ------------------------------------------------------------
   SHINY TEXT — a reflection crosses the word every few seconds.
   For small labels (the 80th anniversary badge), never for copy.
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
   SCRAMBLE / DECRYPTED TEXT — the text "decrypts" letter by
   letter out of random glyphs. It is the most direct quote of
   the "Binary" attribute in the IEEE CS brand prism, so it goes
   on technical data: coordinates, section codes.
   ------------------------------------------------------------ */

const GLYPHS = '01<>/\[]{}=+*#%&$@ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function Scramble({
  text,
  className,
  /** ms between steps. Lower = resolves faster. */
  step = 38,
  /** how many steps each letter takes to settle */
  settle = 3,
  /**
   * 'view' resolves on entering the viewport, 'hover' on cursor
   * over, 'mount' straight away — the last one is for text that is
   * already above the fold, where an observer that never fires
   * would leave the line blank.
   */
  trigger = 'view',
  as: Tag = 'span',
}: {
  text: string
  className?: string
  step?: number
  settle?: number
  trigger?: 'view' | 'hover' | 'mount'
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

  /* One boolean, so the effect re-runs when the trigger resolves
     and not every time `inView` settles afterwards — each extra
     call would restart the decrypt from zero. */
  const armed = trigger === 'mount' || (trigger === 'view' && inView)

  React.useEffect(() => {
    if (armed) run()
    return () => window.clearInterval(timer.current)
  }, [armed, run])

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
   SPLIT TEXT — each word rises from beneath its mask as it
   enters the viewport. It is the "section-level" version of the
   hero's masked headline: same language, less weight.
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
        /* The space goes OUTSIDE the mask, as a real text node. A
           margin in em never quite matches the width of the font's
           space, and at headline size that difference reads as
           loose words. */
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
