import type { Metadata, Viewport } from 'next'
import { Montserrat, Open_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { MotionProvider } from '@/components/ui/motion-provider'
import { SmoothScroll } from '@/components/ui/smooth-scroll'
import { TargetCursor } from '@/components/ui/target-cursor'
import { ClickSpark } from '@/components/ui/click-spark'

/* Montserrat y Open Sans son las familias que exige el brand guide
   de IEEE Computer Society. IBM Plex Mono se suma solo para
   micro-datos (coordenadas, contador, horarios). */

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

export const metadata: Metadata = {
  metadataBase: new URL('https://cstechweek.ec'),
  title: 'CS Tech Week Ecuador 2026',
  description:
    'Una semana de charlas, talleres y retos organizada por los capítulos IEEE Computer Society del Ecuador, en el año del 80.º aniversario de IEEE CS.',
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
        className={`${montserrat.variable} ${openSans.variable} ${plexMono.variable} font-sans antialiased`}
      >
        {/* MotionProvider es quien respeta prefers-reduced-motion en
            todo el sitio: desactiva transform y layout, deja pasar
            opacidad. Los componentes no tienen que ramificar nada. */}
        <MotionProvider>
          {/* Capa de experiencia. Las tres piezas se apagan solas con
              la preferencia de movimiento, y el cursor además exige
              puntero fino: en móvil ninguna llega a montarse. */}
          <SmoothScroll />
          <TargetCursor />
          <ClickSpark />
          {children}
        </MotionProvider>
      </body>
    </html>
  )
}
