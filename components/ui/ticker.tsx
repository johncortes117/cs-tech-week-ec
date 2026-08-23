'use client'

import { ScrollVelocity } from '@/components/ui/scroll-velocity'
import { ticker } from '@/lib/content'

/* ============================================================
   TELETIPO
   Banda de separación entre el hero y el cuerpo del sitio. No
   aporta información nueva a propósito: su trabajo es marcar el
   corte y demostrar, en el primer scroll, que la página
   responde al gesto y no solo a la posición.
   ============================================================ */

export function Ticker() {
  return (
    <div
      className="relative isolate overflow-hidden border-y border-line bg-ink-raise/40 py-5"
      /* El desvanecido va en el contenedor y es ancho: si el texto
         se corta a filo, la banda parece rota en vez de infinita. */
      style={{
        maskImage: 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(90deg, hsl(var(--abyss) / 0.5), transparent 30%, transparent 70%, hsl(var(--abyss) / 0.5))',
        }}
      />
      <ScrollVelocity baseVelocity={26} copies={3}>
        <span className="flex items-center">
          {ticker.map((t, i) => (
            <span key={`${t}-${i}`} className="flex items-center">
              <span className="whitespace-nowrap font-display text-[clamp(1.1rem,2.6vw,1.9rem)] font-extrabold uppercase tracking-head text-foreground/85">
                {t}
              </span>
              {/* el punto naranja es el mismo marcador del meridiano */}
              <span className="mx-6 h-1.5 w-1.5 flex-none rounded-full bg-primary md:mx-9" />
            </span>
          ))}
        </span>
      </ScrollVelocity>
    </div>
  )
}
