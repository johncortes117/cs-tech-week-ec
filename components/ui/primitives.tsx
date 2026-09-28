'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE, VIEWPORT, fadeUp } from '@/lib/motion'

/* ============================================================
   REVEAL — fade up on entering the viewport, once.
   `data-reveal` is the hook for the reduced-motion safety net
   in globals.css: content never depends on an observer firing.
   ============================================================ */

export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li' | 'p' | 'span'
}) {
  const Tag = motion[as] as typeof motion.div
  return (
    <Tag
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      transition={{ delay }}
      data-reveal
    >
      {children}
    </Tag>
  )
}

/* ============================================================
   SECTION TITLE
   Heavy, tight, closed with an orange full stop — the only
   heading style below the hero. Words rise from their own masks.
   The full stop is added here so the copy in content.ts stays
   plain text.
   ============================================================ */

export function SectionTitle({
  children,
  className,
  as: Tag = 'h2',
}: {
  children: string
  className?: string
  as?: 'h2' | 'h3'
}) {
  const words = children.split(' ')

  return (
    <Tag className={cn('h-section', className)} aria-label={`${children}.`}>
      {words.map((w, i) => (
        <React.Fragment key={`${w}-${i}`}>
          <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.1em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: '105%' }}
              whileInView={{ y: '0%' }}
              viewport={{ once: true, margin: '-60px 0px' }}
              transition={{ duration: 0.85, ease: EASE, delay: i * 0.06 }}
              data-reveal
            >
              {w}
              {i === words.length - 1 ? <span className="text-orange">.</span> : null}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </Tag>
  )
}

/* ============================================================
   BUTTON — a pill. Orange means "sign up" and nothing else.
   ============================================================ */

type BtnProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: 'primary' | 'ghost'
  size?: 'md' | 'lg'
  /** 'next' for in-page, 'out' for another site. */
  arrow?: 'next' | 'out'
}

export function Btn({
  variant = 'primary',
  size = 'md',
  arrow,
  className,
  children,
  ...props
}: BtnProps) {
  const Arrow = arrow === 'out' ? ArrowUpRight : ArrowRight
  return (
    <a
      {...props}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-display font-bold tracking-[-0.01em]',
        'transition-[background-color,border-color,color,transform] duration-300 ease-cs active:scale-[0.97]',
        size === 'lg' ? 'h-14 px-7 text-[15px]' : 'h-11 px-5 text-[13px]',
        variant === 'primary' && 'bg-orange text-night hover:bg-[#FFB733]',
        variant === 'ghost' && 'border border-line-strong text-fg hover:border-fg/50',
        className
      )}
    >
      {children}
      {arrow ? (
        <Arrow
          aria-hidden="true"
          className={cn(
            'h-4 w-4 transition-transform duration-300 ease-cs',
            arrow === 'out'
              ? 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
              : 'group-hover:translate-x-1'
          )}
        />
      ) : null}
    </a>
  )
}

/* ============================================================
   LIVE DOT — the one pulsing thing on the page, and only when
   something is actually on air.
   ============================================================ */

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex h-2 w-2 flex-none', className)} aria-hidden="true">
      <span className="absolute inset-0 rounded-full bg-orange animate-live-pulse" />
      <span className="relative h-2 w-2 rounded-full bg-orange" />
    </span>
  )
}

/* ============================================================
   JOIN — the way into a talk's Zoom room. Orange while the talk
   is on or about to start; quiet otherwise. Always a new tab, so
   the programme stays open behind it.
   ============================================================ */

export function JoinLink({
  href,
  live = false,
  hot = false,
  label = 'Unirse',
  className,
  onClick,
}: {
  href: string
  /** The talk has started: shows the pulsing dot. */
  live?: boolean
  /** Its room is open (live or about to start): orange. */
  hot?: boolean
  label?: string
  className?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={cn(
        'group inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-display font-bold transition-[background-color,border-color,color,transform] duration-300 ease-cs active:scale-[0.97]',
        hot
          ? 'bg-orange text-night hover:bg-[#FFB733]'
          : 'border border-line-strong bg-transparent text-fg hover:border-orange hover:text-orange',
        className
      )}
    >
      {live ? <LiveDot className="[&>span]:bg-night" /> : null}
      {label}
      <ArrowUpRight
        aria-hidden="true"
        className="h-3.5 w-3.5 transition-transform duration-300 ease-cs group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </a>
  )
}
