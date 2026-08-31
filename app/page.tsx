import { SiteHeader } from '@/components/sections/site-header'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { Hero } from '@/components/sections/hero'
import { About } from '@/components/sections/about'
import { Activities } from '@/components/sections/activities'
import { Agenda } from '@/components/sections/agenda'
import { Speakers } from '@/components/sections/speakers'
import { Venues, Chapters } from '@/components/sections/network'
import { Sponsors } from '@/components/sections/sponsors'
import { Faq, FinalCta, Footer } from '@/components/sections/faq-cta'
import { Ticker } from '@/components/ui/ticker'

export default function Page() {
  return (
    <>
      <SiteHeader />
      <ScrollProgress />
      <main>
        <Hero />
        {/* Break between the hero and the body: the band scrolls on its
            own and speeds up with the page (ScrollVelocity, React Bits). */}
        <Ticker />
        <About />
        <Activities />
        <Agenda />
        <Speakers />
        <Venues />
        <Sponsors />
        <Chapters />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
