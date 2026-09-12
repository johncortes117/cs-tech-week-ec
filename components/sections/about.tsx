'use client'

import { motion } from 'motion/react'
import {
  Calendar,
  Clock,
  Sparkles,
  Trophy,
  Microscope,
  Cpu,
  Code2,
  BrainCircuit,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react'
import { EASE, VIEWPORT } from '@/lib/motion'
import { isTbd, stats, tracks, phases } from '@/lib/content'
import { Card, Equator, RevealGroup, RevealItem, SectionHead } from '@/components/ui/primitives'
import { GlowingEffect } from '@/components/ui/glowing-effect'
import { CountUp } from '@/components/ui/count-up'
import { Orbit } from './orbit'

/* ============================================================
   ABOUT THE EVENT — Figures + 2 Phases + 5 Thematic Areas
   ============================================================ */

const topicIcons: Record<string, LucideIcon> = {
  investigacion: Microscope,
  iot: Cpu,
  software: Code2,
  ia: BrainCircuit,
  seguridad: ShieldCheck,
}

function TopicCard({
  topic,
  index,
  total,
}: {
  topic: (typeof tracks)[number]
  index: number
  total: number
}) {
  const Icon = topicIcons[topic.key] ?? Code2
  const num = String(index + 1).padStart(2, '0')
  const isBottomRow = index >= 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      data-reveal
      viewport={VIEWPORT}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
      className={`group relative h-full rounded-card ${
        isBottomRow ? 'lg:col-span-3' : 'lg:col-span-2'
      }`}
      data-cursor
    >
      <GlowingEffect
        color={topic.hex}
        accent="#FFA300"
        spread={42}
        proximity={64}
        className="rounded-card"
      />

      <Card className="relative flex h-full flex-col justify-between overflow-hidden p-6 sm:p-7 transition-all duration-500 ease-cs hover:-translate-y-1">
        {/* Ambient radial glow matching the topic color on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-cs group-hover:opacity-100"
          style={{
            background: `radial-gradient(130% 100% at 0% 0%, ${topic.hex}22, transparent 65%)`,
          }}
        />

        <div>
          {/* Header row: Icon + Topic Index + Spec */}
          <div className="flex items-center justify-between gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-500 ease-cs group-hover:scale-110"
              style={{
                backgroundColor: `${topic.hex}14`,
                borderColor: `${topic.hex}38`,
                color: topic.hex,
                boxShadow: `0 0 16px ${topic.hex}22`,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full transition-transform duration-500 ease-cs group-hover:scale-125"
                style={{ backgroundColor: topic.hex, boxShadow: `0 0 10px ${topic.hex}` }}
              />
              <span className="font-mono text-[11px] font-bold tabular tracking-wider text-subtle group-hover:text-foreground transition-colors">
                {num}
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="mt-5">
            <h3 className="font-display text-[1.125rem] font-bold leading-snug tracking-[-0.01em] text-foreground group-hover:text-primary transition-colors duration-300">
              {topic.name}
            </h3>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">
              {topic.blurb}
            </p>
          </div>
        </div>

        {/* Footer Pill */}
        <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {topic.pms}
          </span>
          <span
            className="text-[11px] font-mono font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ color: topic.hex }}
          >
            Temática oficial
          </span>
        </div>
      </Card>
    </motion.div>
  )
}

export function About() {
  return (
    <section id="evento" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Sobre el evento"
          title={
            <>
              Una semana dedicada a la <span className="grad-text">computación</span>.
            </>
          }
          lede="Siete días de conferencias magistrales, hackathons y torneos prácticos, organizados por 10 capítulos IEEE Computer Society del Ecuador."
        />

        {/* 4 Figures */}
        <RevealGroup
          className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
          step={0.08}
        >
          {stats.map((s, i) => {
            const n = Number(s.value)
            const countable = !isTbd(s.value) && Number.isFinite(n)

            return (
              <RevealItem key={s.label} className="group relative rounded-card">
                <Card className="relative h-full overflow-hidden p-6 transition-all duration-300 hover:border-primary/40 hover:-translate-y-0.5">
                  <div className="flex h-[clamp(2.2rem,4.5vw,3rem)] items-center font-display text-[clamp(2.2rem,4.5vw,3rem)] font-extrabold leading-none tracking-head tabular">
                    {isTbd(s.value) ? (
                      <span
                        className="h-[0.62em] w-[1.15em] rounded-[4px] border border-dashed border-primary/45 bg-primary/[0.06]"
                        title="Dato pendiente de confirmar"
                        aria-label="Por confirmar"
                      />
                    ) : countable ? (
                      <CountUp to={n} delay={i * 0.08} className="grad-text" />
                    ) : (
                      <span className="grad-text">{s.value}</span>
                    )}
                  </div>
                  <div className="mt-3 font-display text-[0.875rem] font-bold uppercase tracking-[0.08em] text-foreground">
                    {s.label}
                  </div>
                  <div className="mt-1 text-[0.8125rem] leading-snug text-subtle">{s.detail}</div>
                </Card>
              </RevealItem>
            )
          })}
        </RevealGroup>

        {/* 2 Event Phases */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {phases.map((p, idx) => {
            const isFirst = idx === 0
            const accentColor = isFirst ? '#FFA300' : '#00B5E2'
            const Icon = isFirst ? Sparkles : Trophy

            return (
              <motion.div
                key={p.phase}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                data-reveal
                viewport={VIEWPORT}
                transition={{ duration: 0.6, ease: EASE, delay: idx * 0.1 }}
                className="group relative rounded-card"
              >
                <GlowingEffect
                  color={accentColor}
                  accent="#FFA300"
                  spread={48}
                  proximity={70}
                  className="rounded-card"
                />

                <Card className="relative flex h-full flex-col justify-between overflow-hidden p-7 sm:p-8 transition-all duration-500 ease-cs hover:-translate-y-1">
                  {/* Subtle corner light */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-cs group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(120% 90% at 0% 0%, ${accentColor}18, transparent 65%)`,
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
                        style={{
                          borderColor: `${accentColor}44`,
                          backgroundColor: `${accentColor}12`,
                          color: accentColor,
                        }}
                      >
                        <Icon className="h-3 w-3" />
                        {p.badge}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-label text-subtle">
                        {p.tag}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-[1.4rem] font-extrabold tracking-[-0.01em] text-foreground">
                      {p.phase}
                    </h3>

                    <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted-foreground">
                      {p.desc}
                    </p>
                  </div>

                  <div className="relative mt-7 flex flex-col gap-2.5 border-t border-line pt-5 text-[0.875rem]">
                    <div className="flex items-center gap-2.5 text-foreground">
                      <Calendar className="h-4 w-4 shrink-0 text-primary" />
                      <span className="font-medium">{p.dates}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-subtle">
                      <Clock className="h-4 w-4 shrink-0 text-cyan" />
                      <span>{p.hours}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Constellation Orbit */}
      <div className="mt-24 md:mt-28">
        <Orbit />
      </div>

      {/* 5 Thematic Areas */}
      <div className="shell mt-24 md:mt-28">
        <SectionHead
          eyebrow="Ejes Temáticos"
          title="Cinco áreas de vanguardia."
          lede="Conferencias magistrales, paneles y retos prácticos diseñados para cada especialidad."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {tracks.map((t, i) => (
            <TopicCard key={t.key} topic={t} index={i} total={tracks.length} />
          ))}
        </div>
      </div>

      <div className="shell mt-24">
        <Equator label="EVENTO → ACTIVIDADES" />
      </div>
    </section>
  )
}
