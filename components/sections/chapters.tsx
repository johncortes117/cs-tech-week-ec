'use client'

import { chapters } from '@/lib/content'
import { SectionHead } from '@/components/ui/primitives'
import { ThreeDMarquee } from '@/components/ui/3d-marquee'

/* ============================================================
   ORGANISING CHAPTERS & STUDENT BRANCH
   ============================================================ */

export function Chapters() {
  return (
    <section id="capitulos" className="relative scroll-mt-24 overflow-hidden py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Capítulos IEEE CS y Rama Estudiantil"
          title="Once organizaciones construyen comunidad."
          align="center"
        />

        <div className="mt-10 md:mt-14">
          <ThreeDMarquee items={chapters} />
        </div>
      </div>
    </section>
  )
}
