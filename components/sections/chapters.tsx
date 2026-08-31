'use client'

import { chapters } from '@/lib/content'
import { SectionHead } from '@/components/ui/primitives'
import { ThreeDMarquee } from '@/components/ui/3d-marquee'

/* ============================================================
   ORGANISING CHAPTERS
   The brand guide requires the chapter's full name, with no
   acronyms and with "IEEE COMPUTER SOCIETY" in capitals.
   ============================================================ */

export function Chapters() {
  return (
    <section id="capitulos" className="relative scroll-mt-24 overflow-hidden py-24 md:py-32">
      <div className="shell">
        <SectionHead
          eyebrow="Capítulos IEEE CS"
          title="Diez universidades organizan."
          align="center"
        />

        <div className="mt-10 md:mt-14">
          <ThreeDMarquee items={chapters} />
        </div>
      </div>
    </section>
  )
}
