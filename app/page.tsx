import { SiteHeader } from '@/components/sections/site-header'
import { Hero } from '@/components/sections/hero'
import { Tapes } from '@/components/sections/tapes'
import { Week } from '@/components/sections/week'
import { Speakers } from '@/components/sections/speakers'
import { Contests } from '@/components/sections/contests'
import { Tickets } from '@/components/sections/tickets'
import { Organizers } from '@/components/sections/organizers'
import { Merch } from '@/components/sections/merch'
import { Sponsors } from '@/components/sections/sponsors'
import { Faq } from '@/components/sections/faq'
import { Closing } from '@/components/sections/closing'

/* Night and day alternate by content, not by habit: sections whose
   assets are white (chapter logos, the Minecraft screenshot) sit at
   night; sections with white-backed assets (sponsor logos, sticker
   sheets) and long reading (speakers, passes, FAQ) sit by day. */

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Tapes />
        <Week />
        <Speakers />
        <Contests />
        <Tickets />
        <Organizers />
        <Merch />
        <Sponsors />
        <Faq />
      </main>
      <Closing />
    </>
  )
}
