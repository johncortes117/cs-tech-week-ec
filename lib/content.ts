/* ============================================================
   FUENTE ÚNICA DE CONTENIDO
   Todo lo editable del sitio vive aquí. Los componentes no
   traen texto quemado: cambiar el evento = cambiar este archivo.

   Lo marcado con  TBD:  son datos que faltan confirmar. Salen
   en pantalla con estilo de marcador naranja punteado para que
   nadie los confunda con información real.
   ============================================================ */

export const TBD = '__TBD__' as const

/** Envuelve un valor pendiente para que la UI lo pinte como marcador. */
export const tbd = (hint: string) => `${TBD}${hint}`
export const isTbd = (v: string) => v.startsWith(TBD)
export const tbdText = (v: string) => v.slice(TBD.length)

/* ---------------------------------------------------------- */
/* EVENTO                                                       */
/* ---------------------------------------------------------- */

export const event = {
  name: 'CS Tech Week',
  region: 'Ecuador',
  year: 2026,
  /** Titular del hero. El <em> se pinta en naranja. */
  headline: ['CS Tech', 'Week', 'Ecuador'],
  tagline: 'Latitud cero. Ochenta años. Una semana.',
  taglineEn: 'Latitude zero. Eighty years. One week.',
  intro:
    'Una semana de charlas, talleres y retos organizada por los capítulos Computer Society del Ecuador, en el año en que IEEE Computer Society cumple ochenta.',

  // TBD — confirmar con el comité
  dates: tbd('Fechas por confirmar'),
  datesShort: tbd('Por confirmar'),
  venue: tbd('Sede por confirmar'),
  format: tbd('Presencial + virtual'),

  /**
   * Fecha objetivo del contador (ISO, hora de Ecuador UTC−5).
   * PLACEHOLDER — reemplazar por la fecha real de arranque.
   */
  startsAt: '2026-11-09T09:00:00-05:00',

  coords: '0°00′00″ · −78°27′',
  anniversary: 'IEEE CS · 80 años construyendo comunidad',

  registerUrl: '#registro',
  sponsorUrl: '#sponsors',
  agendaUrl: '#agenda',

  social: {
    instagram: 'https://www.instagram.com/ieee.ecuador.cs',
    linkedin: 'https://www.linkedin.com/company/ieee-computer-society',
    email: 'cstechweek@ieee.ec',
  },
} as const

/* ---------------------------------------------------------- */
/* NAVEGACIÓN                                                   */
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
/* TRACKS — cada hex sale de la paleta bright oficial de IEEE CS */
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
/* CIFRAS                                                       */
/* ---------------------------------------------------------- */

export const stats = [
  { value: '6', label: 'Días', detail: 'Lunes a sábado, sin pausa' },
  { value: '6', label: 'Tracks', detail: 'De IA a computación cuántica' },
  { value: tbd('—'), label: 'Capítulos', detail: 'Organizando en conjunto' },
  { value: tbd('—'), label: 'Sedes', detail: 'Presenciales y virtuales' },
] as const

/* ---------------------------------------------------------- */
/* CONSTELACIÓN TECNOLÓGICA (§ orbit)                           */
/* Etiquetas de tecnología, no logos de sponsor.                */
/* edge: true = queda fuera del ancho útil en móvil, se oculta. */
/* ---------------------------------------------------------- */

export const orbitNodes = [
  // anillo 0 (r=240)
  { label: 'Python', ring: 0, angle: 210 },
  { label: 'React', ring: 0, angle: 270 },
  { label: 'Docker', ring: 0, angle: 330 },
  // anillo 1 (r=370)
  { label: 'Kubernetes', ring: 1, angle: 198 },
  { label: 'PyTorch', ring: 1, angle: 235 },
  { label: 'Rust', ring: 1, angle: 305 },
  { label: 'Go', ring: 1, angle: 342 },
  // anillo 2 (r=495)
  { label: 'Linux', ring: 2, angle: 192, edge: true },
  { label: 'Postgres', ring: 2, angle: 216 },
  { label: 'LLMs', ring: 2, angle: 270 },
  { label: 'Qiskit', ring: 2, angle: 324 },
  { label: 'Wireshark', ring: 2, angle: 348, edge: true },
] as const

/* ---------------------------------------------------------- */
/* AGENDA                                                       */
/* Se muestra tal cual esté: si days va vacío, la sección       */
/* entra en modo "en construcción" con captura de correo.       */
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

/** Vacío a propósito: el programa aún no está definido. */
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

/** Vacío a propósito: aún no hay confirmados públicamente. */
export const speakers: Speaker[] = []

/** Cuántos huecos mostrar mientras no haya speakers confirmados. */
export const speakerSlots = 4

/* ---------------------------------------------------------- */
/* SEDES                                                        */
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
/* CAPÍTULOS ORGANIZADORES                                      */
/* El brand guide exige el nombre completo, sin siglas.         */
/* ---------------------------------------------------------- */

export type Chapter = { name: string; city: string }

export const chapters: Chapter[] = []

/** Huecos a mostrar mientras se confirma la lista. */
export const chapterSlots = 6

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
/* PIE                                                          */
/* ---------------------------------------------------------- */

export const footerNote =
  'CS Tech Week Ecuador es una iniciativa de los capítulos IEEE Computer Society del Ecuador. IEEE, el logo de IEEE y el logo de IEEE Computer Society son marcas registradas de sus respectivos titulares.'

/* ---------------------------------------------------------- */
/* GLOBO — Ecuador sobre el paralelo cero                       */
/* Son las ciudades del país, NO sedes confirmadas. La sección  */
/* lo dice explícitamente para no prometer lo que no está.      */
/* ---------------------------------------------------------- */

export type GeoCity = { name: string; location: [number, number]; size?: number }

/* Los tamaños son pequeños a propósito: el país entero cabe en
   pocos grados, y con marcadores grandes las nueve ciudades se
   funden en una sola mancha naranja. */
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
/* TELETIPO — banda de texto entre el hero y el resto            */
/* ---------------------------------------------------------- */

export const ticker = [
  'Latitud cero',
  'Ochenta años',
  'Una semana',
  'Seis tracks',
  'IEEE Computer Society',
  'Ecuador 2026',
] as const
