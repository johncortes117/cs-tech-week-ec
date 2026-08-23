'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Instagram, Linkedin, Mail, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EASE, VIEWPORT, collapse } from '@/lib/motion'
import { event, faq, footerNote, navLinks, isTbd, tbdText } from '@/lib/content'
import { useCountdown } from '@/lib/use-countdown'
import { Btn, Equator, SectionHead, Tbd, Val } from '@/components/ui/primitives'
import { BinaryField } from '@/components/ui/binary-field'
import { SplitFlap } from '@/components/ui/split-flap'
import { Aurora } from '@/components/ui/aurora'
import { Magnetic } from '@/components/ui/magnetic'

/* ============================================================
   FAQ — acordeón
   ============================================================ */

function FaqRow({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = React.useState(false)
  const id = `faq-${index}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      data-reveal
      viewport={VIEWPORT}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.05 }}
      className="border-b border-line"
    >
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors duration-300 hover:text-primary"
        >
          <span className="font-display text-[1rem] font-bold leading-snug tracking-[-0.01em]">
            {q}
          </span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="grid h-7 w-7 flex-none place-items-center rounded-full border border-line"
          >
            <Plus className="h-3.5 w-3.5" />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            key="body"
            variants={collapse}
            initial="hidden"
            animate="show"
            exit="exit"
            className="overflow-hidden"
          >
            <p className="max-w-[64ch] pb-6 pr-10 text-[0.9375rem] leading-relaxed text-muted-foreground">
              {isTbd(a) ? <Tbd>{tbdText(a)}</Tbd> : a}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

export function Faq() {
  return (
    <section id="faq" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="shell grid gap-14 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
        <SectionHead
          eyebrow="Preguntas"
          title="Lo que todo el mundo pregunta."
          lede="Si algo no está acá, escríbenos y lo respondemos — y probablemente lo agreguemos."
        />
        <div>
          {faq.map((f, i) => (
            <FaqRow key={f.q} q={f.q} a={f.a} index={i} />
          ))}
        </div>
      </div>

      <div className="shell mt-24">
        <Equator label="FAQ → REGISTRO" />
      </div>
    </section>
  )
}

/* ============================================================
   CTA FINAL — pantalla dedicada, sin distracción
   ============================================================ */

/* El contador no cambia de número: lo voltea. Split-flap tomado
   de React Bits — ver components/ui/split-flap.tsx. Cada dígito
   es su propia hoja, así los segundos no arrastran a los días. */
function CountBox({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <SplitFlap
        value={value}
        label={`${value} ${unit}`}
        cellClassName="h-[clamp(3.1rem,7.4vw,4.8rem)] w-[clamp(2.3rem,5.2vw,3.5rem)] font-display text-[clamp(1.7rem,4.4vw,2.9rem)] font-black leading-none tracking-head text-foreground"
      />
      <span className="label">{unit}</span>
    </div>
  )
}

export function FinalCta() {
  const c = useCountdown(event.startsAt)

  return (
    <section id="registro" className="relative isolate scroll-mt-24 overflow-hidden py-28 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          /* El halo azul arranca dentro del bloque, no en su canto:
             con el centro en 0% el degradado nace a máxima
             intensidad justo en la frontera con la sección
             anterior y se ve la costura. */
          background: `
            radial-gradient(46% 60% at 50% 108%, hsl(var(--orange) / 0.20), transparent 68%),
            radial-gradient(78% 72% at 50% 26%, hsl(var(--abyss) / 0.5), transparent 74%)
          `,
        }}
      />
      {/* velo de aurora en los tres tonos oficiales: le da fondo al
          bloque de cierre sin sacar al sitio de su paleta */}
      <Aurora className="-z-10" intensity={0.4} />
      <BinaryField className="-z-10 opacity-50" reach={170} />

      <div className="shell flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          data-reveal
          viewport={VIEWPORT}
          transition={{ duration: 0.6, ease: EASE }}
          className="label text-primary"
        >
          {event.anniversary}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          data-reveal
          viewport={VIEWPORT}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          className="mt-6 max-w-[16ch] font-display text-[clamp(2.2rem,6.4vw,4.5rem)] font-black leading-[0.96] tracking-display"
        >
          Nos vemos en el <span className="text-primary">paralelo cero</span>.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          data-reveal
          viewport={VIEWPORT}
          transition={{ duration: 0.6, ease: EASE, delay: 0.16 }}
          className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-muted-foreground"
        >
          Registro gratuito. Cupo limitado en los workshops presenciales, así que mientras antes
          reserves, mejor.
        </motion.p>

        {/* contador grande */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          data-reveal
          viewport={VIEWPORT}
          transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
          className="mt-12 flex items-start gap-8 sm:gap-12"
        >
          <CountBox value={c.days} unit="Días" />
          <CountBox value={c.hours} unit="Horas" />
          <CountBox value={c.minutes} unit="Min" />
          <CountBox value={c.seconds} unit="Seg" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          data-reveal
          viewport={VIEWPORT}
          transition={{ duration: 0.6, ease: EASE, delay: 0.32 }}
          className="mt-12 flex flex-wrap justify-center gap-3"
        >
          <Magnetic radius={76} strength={0.28}>
            <Btn href={event.registerUrl} size="lg">
              Registrarme gratis
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-cs group-hover:translate-x-1" />
            </Btn>
          </Magnetic>
          <Magnetic radius={76} strength={0.2}>
            <Btn href={event.agendaUrl} size="lg" variant="ghost">
              Ver la agenda
            </Btn>
          </Magnetic>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          data-reveal
          viewport={VIEWPORT}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle"
        >
          <Val value={event.dates} /> · <Val value={event.venue} />
        </motion.p>
      </div>
    </section>
  )
}

/* ============================================================
   PIE
   ============================================================ */

export function Footer() {
  return (
    <footer className="border-t border-line py-16">
      <div className="shell">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div className="flex max-w-sm flex-col gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/ieee-cs-80th-white.svg"
              alt="IEEE Computer Society 80.º aniversario"
              className="h-auto w-[210px]"
            />
            <p className="text-[0.8125rem] leading-relaxed text-subtle">{footerNote}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span className="label">Evento</span>
              {navLinks.slice(0, 4).map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="font-display text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <span className="label">Participar</span>
              <a href="#registro" className="font-display text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
                Registro
              </a>
              <a href="#sponsors" className="font-display text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
                Ser sponsor
              </a>
              <a href="#speakers" className="font-display text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
                Postular charla
              </a>
              <a href="#faq" className="font-display text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
                Preguntas
              </a>
            </div>

            <div className="flex flex-col gap-3">
              <span className="label">Contacto</span>
              <a
                href={event.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-display text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <Instagram className="h-3.5 w-3.5" /> Instagram
              </a>
              <a
                href={event.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-display text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
              <a
                href={`mailto:${event.social.email}`}
                className="inline-flex items-center gap-2 font-display text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" /> Correo
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            © {event.year} CS Tech Week Ecuador
          </span>
          <span className={cn('font-mono text-[10px] uppercase tracking-[0.14em] text-primary/70')}>
            {event.coords}
          </span>
        </div>
      </div>
    </footer>
  )
}
