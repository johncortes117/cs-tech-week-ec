'use client'

import * as React from 'react'
import { motion, type Variants } from 'motion/react'
import { cn } from '@/lib/utils'
import { EASE, VIEWPORT, fadeUp, stagger } from '@/lib/motion'
import { TBD, isTbd, tbdText } from '@/lib/content'
import { SplitText } from '@/components/ui/text-fx'

/* ============================================================
   REVEAL — aparición al entrar en viewport.
   Respeta prefers-reduced-motion: cae a pura opacidad.
   ============================================================ */

export function Reveal({
  children,
  className,
  delay = 0,
  variants,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  variants?: Variants
  as?: 'div' | 'section' | 'li' | 'span'
}) {
  const MotionTag = motion[as] as typeof motion.div

  return (
    <MotionTag
      className={className}
      variants={variants ?? fadeUp}
      initial="hidden"
      whileInView="show"
      data-reveal
      viewport={VIEWPORT}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  )
}

/** Contenedor que escalona a sus hijos `<Reveal>` o `motion.*`. */
export function RevealGroup({
  children,
  className,
  step = 0.07,
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  step?: number
  delay?: number
  as?: 'div' | 'ul' | 'section'
}) {
  const MotionTag = motion[as] as typeof motion.div

  return (
    <MotionTag
      className={className}
      variants={stagger(step, delay)}
      initial="hidden"
      whileInView="show"
      data-reveal
      viewport={VIEWPORT}
    >
      {children}
    </MotionTag>
  )
}

/** Hijo de RevealGroup: hereda el escalonado del padre. */
export function RevealItem({
  children,
  className,
  variants,
}: {
  children: React.ReactNode
  className?: string
  variants?: Variants
}) {
  return (
    /* `data-reveal` no lo lee JavaScript: es el gancho de la red de
       seguridad de globals.css. Este hijo no tiene whileInView
       propio —hereda del grupo— así que hay que marcarlo a mano. */
    <motion.div data-reveal className={className} variants={variants ?? fadeUp}>
      {children}
    </motion.div>
  )
}

/* ============================================================
   REGLA ECUATORIAL — el divisor es el concepto
   ============================================================ */

export function Equator({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn('relative', className)} aria-hidden="true">
      <motion.div
        className="equator origin-left"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        data-reveal
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1, ease: EASE }}
      />
      {label ? (
        <span className="absolute left-[calc(34%+12px)] -top-2 font-mono text-[10px] tracking-[0.14em] text-subtle">
          {label}
        </span>
      ) : null}
    </div>
  )
}

/* ============================================================
   ENCABEZADO DE SECCIÓN
   ============================================================ */

export function SectionHead({
  eyebrow,
  title,
  lede,
  align = 'left',
  className,
}: {
  eyebrow: string
  title: React.ReactNode
  lede?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <RevealGroup
      className={cn(
        'flex flex-col gap-5',
        align === 'center' && 'items-center text-center',
        className
      )}
      step={0.08}
    >
      <RevealItem>
        <span className="inline-flex items-center gap-2.5">
          <span className="h-px w-6 bg-primary" />
          <span className="label text-primary">{eyebrow}</span>
        </span>
      </RevealItem>
      {/* Cuando el título es texto plano sube palabra por palabra
          desde su propia máscara (SplitText, React Bits): es la
          versión de sección del titular del hero. Si trae marcado
          —un <span> con degradado, por ejemplo— no se puede
          partir sin romperlo, y cae al reveal de bloque. */}
      {typeof title === 'string' ? (
        <SplitText
          as="h2"
          text={title}
          className={cn(
            'font-display text-[clamp(1.9rem,4.4vw,3.1rem)] font-extrabold leading-[1.05] tracking-head',
            align === 'center' && 'mx-auto max-w-[20ch]'
          )}
        />
      ) : (
        <RevealItem>
          <h2
            className={cn(
              'font-display text-[clamp(1.9rem,4.4vw,3.1rem)] font-extrabold leading-[1.05] tracking-head',
              align === 'center' && 'mx-auto max-w-[20ch]'
            )}
          >
            {title}
          </h2>
        </RevealItem>
      )}
      {lede ? (
        <RevealItem>
          <p
            className={cn(
              'max-w-[62ch] text-[1.0625rem] leading-relaxed text-muted-foreground',
              align === 'center' && 'mx-auto'
            )}
          >
            {lede}
          </p>
        </RevealItem>
      ) : null}
    </RevealGroup>
  )
}

/* ============================================================
   MARCADOR DE DATO PENDIENTE
   Naranja punteado: imposible confundirlo con contenido real.
   ============================================================ */

export function Tbd({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        'font-mono text-[0.82em] uppercase tracking-[0.06em] text-primary',
        'border-b border-dashed border-primary/50 pb-px',
        className
      )}
      title="Dato pendiente de confirmar"
    >
      {children}
    </span>
  )
}

/** Pinta un string que puede o no ser un marcador TBD. */
export function Val({ value, className }: { value: string; className?: string }) {
  if (isTbd(value)) return <Tbd className={className}>{tbdText(value)}</Tbd>
  return <span className={className}>{value}</span>
}

export { TBD }

/* ============================================================
   BOTONES
   ============================================================ */

type BtnProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'ghost' | 'quiet'
  size?: 'md' | 'lg'
}

export function Btn({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: BtnProps) {
  return (
    <a
      {...props}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-[6px]',
        'font-display font-bold tracking-[0.01em] transition-colors duration-300',
        size === 'lg' ? 'px-7 py-4 text-[0.9375rem]' : 'px-5 py-3 text-[0.8125rem]',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-[#FFB733]',
        variant === 'ghost' &&
          'border border-line-strong text-foreground hover:border-primary/60 hover:text-primary',
        variant === 'quiet' && 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {/* Barrido de brillo al pasar el cursor */}
      {variant === 'primary' ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-cs group-hover:translate-x-full motion-reduce:hidden"
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </a>
  )
}

/* ============================================================
   TARJETA BASE — borde hairline + shine superior en hover
   ============================================================ */

export function Card({
  children,
  className,
  interactive = true,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      {...rest}
      className={cn(
        'relative overflow-hidden rounded-card border border-line bg-ink-raise',
        interactive &&
          'shine-top transition-colors duration-500 ease-cs hover:border-line-strong',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ============================================================
   PÍLDORA DE ETIQUETA (tracks, modalidad, tipo)
   ============================================================ */

export function Pill({
  children,
  hex,
  className,
}: {
  children: React.ReactNode
  hex?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1',
        'font-display text-[11px] font-semibold leading-none',
        className
      )}
      style={
        hex
          ? {
              color: hex,
              borderColor: `${hex}44`,
              backgroundColor: `${hex}14`,
            }
          : undefined
      }
    >
      {hex ? (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: hex }}
        />
      ) : null}
      {children}
    </span>
  )
}
