import type { Metadata, Viewport } from 'next'
import { Montserrat, Open_Sans, IBM_Plex_Mono, Press_Start_2P } from 'next/font/google'
import './globals.css'
import { MotionProvider } from '@/components/ui/motion-provider'
import { SmoothScroll } from '@/components/ui/smooth-scroll'
import { TargetCursor } from '@/components/ui/target-cursor'
import { ClickSpark } from '@/components/ui/click-spark'

/* Montserrat and Open Sans are the families required by the IEEE
   Computer Society brand guide. IBM Plex Mono joins only for
   micro-data (coordinates, countdown, schedules).

   Press Start 2P is loaded for exactly one thing: the Minecraft
   tournament card, whose poster is set in a pixel face. It is a
   single weight over a latin subset, and nothing else on the site
   is allowed to use it. */

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-open-sans',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
  display: 'swap',
})

const pressStart = Press_Start_2P({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-pixel',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://cstechweek.ec'),
  title: 'CS Tech Week Ecuador 2026',
  description:
    'Una semana dedicada a la tecnología, innovación, talento y comunidad, organizada por los capítulos IEEE Computer Society del Ecuador en el 80.º aniversario de IEEE CS. Charlas, hackathon y torneo, en formato virtual.',
  keywords: [
    'IEEE Computer Society',
    'Ecuador',
    'CS Tech Week',
    'evento tech',
    'inteligencia artificial',
    'ciberseguridad',
  ],
  openGraph: {
    title: 'CS Tech Week Ecuador 2026',
    description: 'Latitud cero. Ochenta años. Una semana.',
    locale: 'es_EC',
    type: 'website',
  },
  icons: { icon: '/logo/ieee-cs-80th-color.svg' },
}

export const viewport: Viewport = {
  themeColor: '#05070B',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${montserrat.variable} ${openSans.variable} ${plexMono.variable} ${pressStart.variable} font-sans antialiased`}
      >
        {/* MotionProvider is what honours prefers-reduced-motion across
            the site: it disables transform and layout and lets
            opacity through. Components never branch on it. */}
        <MotionProvider>
          {/* Experience layer. All three pieces switch themselves off with
              the motion preference, and the cursor additionally
              requires a fine pointer: on mobile none of them mount. */}
          <SmoothScroll />
          <TargetCursor />
          <ClickSpark />
          {children}
        </MotionProvider>
      </body>
    </html>
  )
}
