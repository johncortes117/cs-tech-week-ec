import type { Metadata, Viewport } from 'next'
import { Montserrat, Open_Sans, IBM_Plex_Mono, Press_Start_2P } from 'next/font/google'
import './globals.css'
import { MotionProvider } from '@/components/ui/motion-provider'
import { SmoothScroll } from '@/components/ui/smooth-scroll'

/* Montserrat and Open Sans are the families required by the IEEE
   Computer Society brand guide. IBM Plex Mono joins only for
   micro-data (coordinates, countdown, times).

   Press Start 2P is loaded for exactly one thing: the Minecraft
   card title. One weight, latin subset, nothing else may use it. */

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600'],
  variable: '--font-open-sans',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
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
    'Una semana de charlas gratuitas, un hackathon de CSS y un torneo de Minecraft, organizada por los capítulos IEEE Computer Society del Ecuador. Del 28 de septiembre al 4 de octubre de 2026, virtual.',
  keywords: ['IEEE Computer Society', 'Ecuador', 'CS Tech Week', 'evento tech', 'CSS Battle', 'Minecraft'],
  openGraph: {
    title: 'CS Tech Week Ecuador 2026',
    description: 'Charlas, un hackathon de CSS y un torneo de Minecraft. Del 28 de septiembre al 4 de octubre, virtual.',
    locale: 'es_EC',
    type: 'website',
  },
  icons: { icon: '/logo/cs-tech-week-ec.svg' },
}

export const viewport: Viewport = {
  themeColor: '#050F1C',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${montserrat.variable} ${openSans.variable} ${plexMono.variable} ${pressStart.variable} font-sans antialiased`}
      >
        {/* MotionProvider honours prefers-reduced-motion across the site;
            SmoothScroll switches itself off with it. */}
        <MotionProvider>
          <SmoothScroll />
          {children}
        </MotionProvider>
      </body>
    </html>
  )
}
