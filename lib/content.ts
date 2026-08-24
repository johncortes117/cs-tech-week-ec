/* ============================================================
   SINGLE SOURCE OF CONTENT
   Everything editable on the site lives here. Components carry
   no hard-coded copy: changing the event = changing this file.

   Anything marked  TBD:  is data still to be confirmed. It is
   rendered on screen as a dotted orange placeholder so nobody
   mistakes it for real information.
   ============================================================ */

export const TBD = '__TBD__' as const

/** Wraps a pending value so the UI renders it as a placeholder. */
export const tbd = (hint: string) => `${TBD}${hint}`
export const isTbd = (v: string) => v.startsWith(TBD)
export const tbdText = (v: string) => v.slice(TBD.length)

/* ---------------------------------------------------------- */
/* EVENT                                                        */
/* ---------------------------------------------------------- */

export const event = {
  name: 'CS Tech Week',
  region: 'Ecuador',
  year: 2026,
  /** Hero headline. The <em> is painted orange. */
  headline: ['CS Tech', 'Week', 'Ecuador'],
  tagline: 'Latitud cero. Ochenta años. Una semana.',
  taglineEn: 'Latitude zero. Eighty years. One week.',
  intro:
    'Una semana de charlas, talleres y retos organizada por los capítulos Computer Society del Ecuador, en el año en que IEEE Computer Society cumple ochenta.',

  /** Confirmed start date. */
  dates: '14 de septiembre, 2026',
  datesShort: '14 SEP 2026',

  // TBD — to confirm with the committee
  venue: tbd('Sede por confirmar'),
  format: tbd('Presencial + virtual'),

  /** Countdown target date (ISO, Ecuador time UTC−5). */
  startsAt: '2026-09-14T09:00:00-05:00',

  coords: '0°00′00″ · −78°27′',
  anniversary: 'IEEE CS · 80 años construyendo comunidad',

  registerUrl: '#registro',
  sponsorUrl: '#sponsors',
  agendaUrl: '#agenda',

  social: {
    instagram: 'https://www.instagram.com/ecu.cs.week.2026',
    linkedin: 'https://www.linkedin.com/company/ieee-computer-society',
    email: 'cstechweek@ieee.ec',
  },
} as const

/* ---------------------------------------------------------- */
/* NAVIGATION                                                   */
/* ---------------------------------------------------------- */

export const navLinks = [
  { label: 'El evento', href: '#evento' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'Speakers', href: '#speakers' },
  { label: 'Sedes', href: '#sedes' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'Capítulos', href: '#capitulos' },
] as const

/* ---------------------------------------------------------- */
/* TRACKS — every hex comes from the official IEEE CS bright palette */
/* ---------------------------------------------------------- */

export type TrackKey = 'ia' | 'cloud' | 'sec' | 'data' | 'dev' | 'quantum'

export const tracks: {
  key: TrackKey
  name: string
  pms: string
  hex: string
  blurb: string
}[] = [
  {
    key: 'ia',
    name: 'Inteligencia Artificial',
    pms: 'PMS 254 C',
    hex: '#981D97',
    blurb: 'Modelos, agentes y el oficio de construir con IA sin perder el criterio.',
  },
  {
    key: 'cloud',
    name: 'Cloud & DevOps',
    pms: 'PMS Process Cyan',
    hex: '#00B5E2',
    blurb: 'Infraestructura, contenedores y cómo se sostiene un sistema en producción.',
  },
  {
    key: 'sec',
    name: 'Ciberseguridad',
    pms: 'PMS 200 C',
    hex: '#BA0C2F',
    blurb: 'Ofensiva y defensa, con laboratorios prácticos y casos reales.',
  },
  {
    key: 'data',
    name: 'Ciencia de Datos',
    pms: 'PMS 320 C',
    hex: '#009CA6',
    blurb: 'Del dato crudo a la decisión: pipelines, análisis y visualización.',
  },
  {
    key: 'dev',
    name: 'Desarrollo',
    pms: 'PMS 368 C',
    hex: '#78BE20',
    blurb: 'Ingeniería de software, arquitectura y herramientas del día a día.',
  },
  {
    key: 'quantum',
    name: 'Computación Cuántica',
    pms: 'PMS 109 C',
    hex: '#FFD100',
    blurb: 'Qué es real hoy, qué es promesa, y por dónde se empieza.',
  },
]

export const trackByKey = Object.fromEntries(tracks.map((t) => [t.key, t])) as Record<
  TrackKey,
  (typeof tracks)[number]
>

/* ---------------------------------------------------------- */
/* FIGURES                                                      */
/* ---------------------------------------------------------- */

export const stats = [
  { value: '6', label: 'Días', detail: 'Lunes a sábado, sin pausa' },
  { value: '6', label: 'Tracks', detail: 'De IA a computación cuántica' },
  { value: '10', label: 'Capítulos', detail: 'Organizando en conjunto' },
  { value: tbd('—'), label: 'Sedes', detail: 'Presenciales y virtuales' },
] as const

/* ---------------------------------------------------------- */
/* TECHNOLOGY CONSTELLATION (§ orbit)                           */
/* Technology labels, not sponsor logos.                        */
/* edge: true = falls outside the usable width on mobile, hidden. */
/* ---------------------------------------------------------- */

export const orbitNodes = [
  // ring 0 (r=240)
  { label: 'Python', ring: 0, angle: 210 },
  { label: 'React', ring: 0, angle: 270 },
  { label: 'Docker', ring: 0, angle: 330 },
  // ring 1 (r=370)
  { label: 'Kubernetes', ring: 1, angle: 198 },
  { label: 'PyTorch', ring: 1, angle: 235 },
  { label: 'Rust', ring: 1, angle: 305 },
  { label: 'Go', ring: 1, angle: 342 },
  // ring 2 (r=495)
  { label: 'Linux', ring: 2, angle: 192, edge: true },
  { label: 'Postgres', ring: 2, angle: 216 },
  { label: 'LLMs', ring: 2, angle: 270 },
  { label: 'Qiskit', ring: 2, angle: 324 },
  { label: 'Wireshark', ring: 2, angle: 348, edge: true },
] as const

/* ---------------------------------------------------------- */
/* AGENDA                                                       */
/* Rendered exactly as it stands: if days is empty, the section  */
/* switches to "under construction" mode with email capture.    */
/* ---------------------------------------------------------- */

export type Modality = 'presencial' | 'virtual' | 'hibrido'
export type SessionType = 'ponencia' | 'panel' | 'workshop' | 'reto'

export type Session = {
  start: string
  end: string
  title: string
  speaker?: string
  track: TrackKey
  modality: Modality
  type: SessionType
  venue?: string
}

export type Day = {
  key: string
  label: string
  date: string
  sessions: Session[]
}

/** Empty on purpose: the programme is not defined yet. */
export const days: Day[] = []

export const modalityLabels: Record<Modality, string> = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrido: 'Híbrido',
}

export const typeLabels: Record<SessionType, string> = {
  ponencia: 'Ponencia',
  panel: 'Panel',
  workshop: 'Workshop',
  reto: 'Reto',
}

/* ---------------------------------------------------------- */
/* SPEAKERS                                                     */
/* ---------------------------------------------------------- */

export type Speaker = {
  name: string
  role: string
  org: string
  photo?: string
  track?: TrackKey
}

/** Empty on purpose: nobody is publicly confirmed yet. */
export const speakers: Speaker[] = []

/** How many slots to show while no speakers are confirmed. */
export const speakerSlots = 4

/* ---------------------------------------------------------- */
/* VENUES                                                       */
/* ---------------------------------------------------------- */

export type Venue = {
  city: string
  name: string
  chapter: string
  modality: Modality
  capacity?: string
  schedule?: string
}

export const venues: Venue[] = []

/* ---------------------------------------------------------- */
/* ORGANISING CHAPTERS                                          */
/* The brand guide requires the full name, no acronyms.         */
/* ---------------------------------------------------------- */

export type Chapter = {
  name: string
  fullName: string
  university: string
  city: string
  logo: string
  instagram: string
  handle?: string
}

export const chapters: Chapter[] = [
  {
    name: 'IEEE CS ESPOL',
    fullName: 'IEEE Computer Society ESPOL',
    university: 'Escuela Superior Politécnica del Litoral',
    city: 'Guayaquil',
    logo: '/chapters/CS_ESPOL.png',
    instagram: 'https://www.instagram.com/ieee.espol.computer',
    handle: '@ieee.espol.computer',
  },
  {
    name: 'IEEE CS UTN',
    fullName: 'IEEE Computer Society UTN',
    university: 'Universidad Técnica del Norte',
    city: 'Ibarra',
    logo: '/chapters/CS_UTN.png',
    instagram: 'https://www.instagram.com/ieee_utncs',
    handle: '@ieee_utncs',
  },
  {
    name: 'IEEE CS USFQ',
    fullName: 'IEEE Computer Society USFQ',
    university: 'Universidad San Francisco de Quito',
    city: 'Quito',
    logo: '/chapters/CS_USFQ.png',
    instagram: 'https://www.instagram.com/ieee_usfq_cs',
    handle: '@ieee_usfq_cs',
  },
  {
    name: 'IEEE CS UPS Cuenca',
    fullName: 'IEEE Computer Society UPS Cuenca',
    university: 'Universidad Politécnica Salesiana',
    city: 'Cuenca',
    logo: '/chapters/CS_UPS_CUENCA.png',
    instagram: 'https://www.instagram.com/cs.ieee.ups.cuenca',
    handle: '@cs.ieee.ups.cuenca',
  },
  {
    name: 'IEEE CS UIDE',
    fullName: 'IEEE Computer Society UIDE',
    university: 'Universidad Internacional del Ecuador',
    city: 'Quito',
    logo: '/chapters/CS_UIDE.png',
    instagram: 'https://www.instagram.com/ieee_uide',
    handle: '@ieee_uide',
  },
  {
    name: 'IEEE CS UCACUE',
    fullName: 'IEEE Computer Society UCACUE',
    university: 'Universidad Católica de Cuenca',
    city: 'Cuenca',
    logo: '/chapters/CS_UCACUE.png',
    instagram: 'https://www.instagram.com/ieee.uc',
    handle: '@ieee.uc',
  },
  {
    name: 'IEEE CS EPN',
    fullName: 'IEEE Computer Society EPN',
    university: 'Escuela Politécnica Nacional',
    city: 'Quito',
    logo: '/chapters/CS_EPN.png',
    instagram: 'https://www.instagram.com/computer_society.epn',
    handle: '@computer_society.epn',
  },
  {
    name: 'IEEE CS UPEC',
    fullName: 'IEEE Computer Society UPEC',
    university: 'Universidad Politécnica Estatal del Carchi',
    city: 'Tulcán',
    logo: '/chapters/CS_UPEC.png',
    instagram: 'https://www.instagram.com/ieee.upec',
    handle: '@ieee.upec',
  },
  {
    name: 'IEEE CS Yachay Tech',
    fullName: 'IEEE Computer Society Yachay Tech',
    university: 'Universidad Yachay Tech',
    city: 'Urcuquí',
    logo: '/chapters/CS_YACHAY.png',
    instagram: 'https://www.instagram.com/ramaieeeyt',
    handle: '@ramaieeeyt',
  },
  {
    name: 'IEEE CS ESPOCH',
    fullName: 'IEEE Computer Society ESPOCH',
    university: 'Escuela Superior Politécnica de Chimborazo',
    city: 'Riobamba',
    logo: '/chapters/CS_ESPOCH.png',
    instagram: 'https://www.instagram.com/ieee_espoch_cs',
    handle: '@ieee_espoch_cs',
  },
]

/* Slots to show while the list is being confirmed. */
export const chapterSlots = 10

/* ---------------------------------------------------------- */
/* SPONSORS                                                     */
/* ---------------------------------------------------------- */

export type SponsorTier = {
  key: string
  name: string
  blurb: string
  slots: number
  featured?: boolean
}

export const sponsorTiers: SponsorTier[] = [
  {
    key: 'diamante',
    name: 'Diamante',
    blurb: 'Marca en el escenario principal, keynote propia y presencia en toda la campaña.',
    slots: 1,
    featured: true,
  },
  {
    key: 'oro',
    name: 'Oro',
    blurb: 'Workshop propio, stand en sede principal y logo en agenda y certificados.',
    slots: 3,
  },
  {
    key: 'plata',
    name: 'Plata',
    blurb: 'Presencia en sitio web y redes, y espacio en la feria de empleabilidad.',
    slots: 6,
  },
  {
    key: 'comunidad',
    name: 'Comunidad',
    blurb: 'Comunidades técnicas y aliados académicos que difunden y aportan contenido.',
    slots: 10,
  },
]

export const sponsorPitch = {
  title: 'Tu marca frente a quienes van a construir la próxima década de software en Ecuador',
  points: [
    'Audiencia técnica real: estudiantes de últimos semestres y profesionales en ejercicio.',
    'Una semana completa de exposición, no una charla suelta.',
    'Respaldo institucional de IEEE Computer Society en su 80.º aniversario.',
    'Contenido co-creado: tu equipo puede dictar workshop o participar en panel.',
  ],
}

/* ---------------------------------------------------------- */
/* FAQ                                                          */
/* ---------------------------------------------------------- */

export const faq = [
  {
    q: '¿Tiene costo asistir?',
    a: 'No. CS Tech Week Ecuador es un evento gratuito. Algunos workshops tienen cupo limitado y requieren reserva previa, pero el acceso no tiene costo.',
  },
  {
    q: '¿Necesito ser miembro de IEEE?',
    a: 'No hace falta. El evento está abierto a cualquier persona interesada en computación. Ser miembro de IEEE Computer Society sí da prioridad en workshops de cupo limitado.',
  },
  {
    q: '¿Puedo participar desde otra ciudad?',
    a: tbd('Depende del formato final — por confirmar'),
  },
  {
    q: '¿Dan certificado?',
    a: 'Sí. Se emite certificado digital verificable para quienes cumplan el mínimo de asistencia. El detalle exacto se publica junto con la agenda.',
  },
  {
    q: '¿En qué idioma son las sesiones?',
    a: 'La mayoría en español. Las sesiones con ponentes internacionales pueden ser en inglés y se anuncian marcadas en la agenda.',
  },
  {
    q: 'Quiero dictar una charla o workshop, ¿cómo postulo?',
    a: 'La convocatoria de ponentes se abre junto con el programa. Déjanos tu correo y te avisamos apenas esté disponible.',
  },
]

/* ---------------------------------------------------------- */
/* FOOTER                                                       */
/* ---------------------------------------------------------- */

export const footerNote =
  'CS Tech Week Ecuador es una iniciativa de los capítulos IEEE Computer Society del Ecuador. IEEE, el logo de IEEE y el logo de IEEE Computer Society son marcas registradas de sus respectivos titulares.'

/* ---------------------------------------------------------- */
/* GLOBE — Ecuador on the zero parallel                         */
/* These are cities of the country, NOT confirmed venues. The    */
/* section says so explicitly, to promise nothing that isn't set. */
/* ---------------------------------------------------------- */

export type GeoCity = { name: string; location: [number, number]; size?: number }

/* The sizes are deliberately small: the whole country fits in a
   few degrees, and with large markers the nine cities merge into
   a single orange blob. */
export const globeCities: GeoCity[] = [
  { name: 'Quito', location: [-0.1807, -78.4678], size: 0.045 },
  { name: 'Guayaquil', location: [-2.1709, -79.9224], size: 0.04 },
  { name: 'Cuenca', location: [-2.9006, -79.0045], size: 0.032 },
  { name: 'Ambato', location: [-1.2491, -78.6168], size: 0.026 },
  { name: 'Loja', location: [-3.9931, -79.2042], size: 0.026 },
  { name: 'Manta', location: [-0.9677, -80.7089], size: 0.026 },
  { name: 'Ibarra', location: [0.3517, -78.1223], size: 0.024 },
  { name: 'Riobamba', location: [-1.6635, -78.6546], size: 0.024 },
  { name: 'Portoviejo', location: [-1.0546, -80.4545], size: 0.024 },
]

/* ---------------------------------------------------------- */
/* TICKER — text band between the hero and the rest              */
/* ---------------------------------------------------------- */

export const ticker = [
  'Latitud cero',
  'Ochenta años',
  'Una semana',
  'Seis tracks',
  'IEEE Computer Society',
  'Ecuador 2026',
] as const
