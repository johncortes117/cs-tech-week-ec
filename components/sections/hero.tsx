'use client'

import * as React from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { EASE, drawLine, lineMask } from '@/lib/motion'
import { event, chapterSlots, chapters } from '@/lib/content'
import { Btn, Val } from '@/components/ui/primitives'
import { HeroScene } from '@/components/ui/hero-scene'
import { Magnetic } from '@/components/ui/magnetic'
import { ShinyText, Scramble } from '@/components/ui/text-fx'

/* ============================================================
   HERO

   La escena manda: detrás del texto hay un planeta de siete mil
   puntos que gira solo, se inclina hacia el cursor y se hunde al
   hacer scroll, con el ecuador encendido en naranja. No es un
   fondo decorativo — es la tesis de la marca dibujada en 3D.
   Ver components/ui/hero-scene.tsx.

   Sobre esa base, el texto se reparte en tres planos de
   profundidad. El sello se mueve más que el titular y el titular
   más que el cuerpo: esa diferencia de recorrido es lo que hace
   que el conjunto se lea como espacio y no como capas pegadas.

   Lo que había antes aquí —conos de Spotlight, degradados
   desenfocados, rejilla y campo binario— se retiró por medida,
   no por gusto: entre las capas con `filter: blur` y los conos
   se iba más de la mitad de los fotogramas del sitio.
   ============================================================ */

/** Recorrido en píxeles de cada plano al mover el cursor. */
const PLANES = { badge: 16, title: 10, body: 6 }

export function Hero() {
  const reduce = useReducedMotion()
  const ref = React.useRef<HTMLElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  /* Un solo listener para todo el paralaje del hero, agrupado en
     un rAF: tres planos leyendo el puntero por su cuenta sería
     tres veces el mismo trabajo de layout. */
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 90, damping: 22, mass: 0.7 })
  const py = useSpring(my, { stiffness: 90, damping: 22, mass: 0.7 })

  React.useEffect(() => {
    if (reduce) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      if (frame) return
      const { clientX, clientY } = e
      frame = requestAnimationFrame(() => {
        frame = 0
        mx.set((clientX / window.innerWidth) * 2 - 1)
        my.set((clientY / window.innerHeight) * 2 - 1)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [reduce, mx, my])

  const badgeX = useTransform(px, [-1, 1], [PLANES.badge, -PLANES.badge])
  const badgeY = useTransform(py, [-1, 1], [PLANES.badge * 0.55, -PLANES.badge * 0.55])
  const titleX = useTransform(px, [-1, 1], [PLANES.title, -PLANES.title])
  const titleY = useTransform(py, [-1, 1], [PLANES.title * 0.55, -PLANES.title * 0.55])
  const bodyX = useTransform(px, [-1, 1], [PLANES.body, -PLANES.body])
  const bodyY = useTransform(py, [-1, 1], [PLANES.body * 0.55, -PLANES.body * 0.55])

  const meta = [
    { label: 'Fechas', value: event.dates },
    { label: 'Sede', value: event.venue },
    { label: 'Formato', value: event.format },
  ]

  return (
    <section
      ref={ref}
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden pb-28 pt-[calc(var(--nav-h)+92px)]"
    >
      <HeroScene className="-z-10" />

      {/* El texto necesita su propio suelo o compite con el brillo
          del ecuador. Un degradado plano, sin filtros. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(100deg, hsl(var(--ink) / 0.88) 0%, hsl(var(--ink) / 0.58) 40%, transparent 72%)',
        }}
      />

      <motion.div
        className="shell relative"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        {/* sello del 80.º */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={reduce ? undefined : { x: badgeX, y: badgeY }}
          className="inline-flex items-center gap-2.5 rounded-pill border border-primary/30 bg-primary/[0.07] py-1.5 pl-2.5 pr-4"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary animate-pulse-ring" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <ShinyText className="label">{event.anniversary}</ShinyText>
        </motion.div>

        {/* titular por líneas enmascaradas */}
        <motion.h1
          style={reduce ? undefined : { x: titleX, y: titleY }}
          className="mt-7 font-display text-[clamp(2.7rem,9vw,7rem)] font-black leading-[0.9] tracking-display"
        >
          {event.headline.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                custom={i}
                variants={lineMask}
                initial="hidden"
                animate="show"
              >
                {i === event.headline.length - 1 ? (
                  <span className="text-primary [text-shadow:0_0_42px_hsl(38_100%_50%_/_0.35)]">
                    {line}
                  </span>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.div style={reduce ? undefined : { x: bodyX, y: bodyY }}>
          {/* línea ecuatorial que se traza */}
          <motion.div
            aria-hidden="true"
            variants={drawLine}
            initial="hidden"
            animate="show"
            className="relative mt-9 h-px origin-left"
            style={{
              background:
                'linear-gradient(90deg, hsl(var(--orange)) 0%, hsl(var(--orange) / 0.45) 22%, hsl(var(--line)) 60%, transparent 100%)',
            }}
          >
            <span className="absolute -top-[3px] left-0 h-[7px] w-px bg-primary" />
          </motion.div>

          {/* Las coordenadas se desencriptan al entrar: es el único
              dato del hero que es literalmente un número, y merece
              leerse como lectura de instrumento. */}
          <Scramble
            text={event.coords}
            step={34}
            className="mt-3 block font-mono text-[10px] tracking-[0.16em] text-primary"
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.55 }}
            className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-muted-foreground"
          >
            {event.intro}
          </motion.p>

          {/* metadatos */}
          <motion.dl
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.66 }}
            className="mt-10 flex flex-wrap gap-x-8 gap-y-5"
          >
            {meta.map((m) => (
              <div key={m.label} className="border-l border-line-strong pl-4">
                <dt className="label">{m.label}</dt>
                <dd className="mt-1 font-display text-[0.9375rem] font-bold tracking-[-0.01em]">
                  <Val value={m.value} />
                </dd>
              </div>
            ))}
            <div className="border-l border-primary/40 pl-4">
              <dt className="label text-primary/70">Latitud</dt>
              <dd className="mt-1 inline-flex items-center gap-1.5 font-mono text-[0.9375rem] font-semibold tabular text-primary">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                0°00′00″
              </dd>
            </div>
          </motion.dl>

          {/* llamados a la acción */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.78 }}
            className="mt-11 flex flex-wrap gap-3"
          >
            <Magnetic radius={70} strength={0.26}>
              <Btn href={event.registerUrl} size="lg">
                Registro gratuito
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-cs group-hover:translate-x-1" />
              </Btn>
            </Magnetic>
            <Magnetic radius={70} strength={0.2}>
              <Btn href={event.sponsorUrl} size="lg" variant="ghost">
                Quiero ser sponsor
              </Btn>
            </Magnetic>
          </motion.div>

          {/* organizan */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.95 }}
            className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line/70 pt-6"
          >
            <span className="label">Organizan</span>
            {chapters.length > 0
              ? chapters.map((c) => (
                  <span
                    key={c.name}
                    className="font-display text-[12px] font-semibold text-muted-foreground"
                  >
                    {c.name}
                  </span>
                ))
              : Array.from({ length: Math.min(chapterSlots, 4) }).map((_, i) => (
                  <span
                    key={i}
                    className="h-3 w-24 rounded-[3px] border border-dashed border-primary/35 bg-primary/[0.05]"
                    aria-label="Capítulo por confirmar"
                  />
                ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* señal de scroll: un bit que cae por el riel */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="scroll-cue pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center md:flex"
      >
        <span className="block h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="mt-2 block h-10 w-px bg-gradient-to-b from-primary/45 to-transparent" />
      </motion.div>
    </section>
  )
}
