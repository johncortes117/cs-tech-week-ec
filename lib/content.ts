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
    'Una semana dedicada a la tecnología, innovación, talento y comunidad, celebrando el 80.º aniversario de IEEE Computer Society, reuniendo a estudiantes, profesionales y entusiastas de la computación a través de charlas, hackathons, concursos y espacios de conexión 100% virtual.',

  /** Confirmed event dates. */
  dates: 'Del 28 de septiembre al 4 de octubre de 2026',
  datesShort: '28 SEP – 04 OCT 2026',
  scheduleHours: 'Semana Académica: 17:00 a 21:00 ECT · Fin de Semana: Concursos',

  /** The whole week runs online, so it is stated once, here. */
  format: 'Virtual',

  /** Countdown target date (ISO, Ecuador time UTC−5, starts 17:00 ECT on Sep 28). */
  startsAt: '2026-09-28T17:00:00-05:00',

  coords: '0°00′00″ · −78°27′',
  anniversary: 'IEEE CS · 80 años construyendo comunidad',

  registerUrl: '#precios',
  sponsorUrl: '#sponsors',
  agendaUrl: '#agenda',

  social: {
    instagram: 'https://www.instagram.com/ecu.cs.week.2026',
    linkedin: 'https://www.linkedin.com/company/ieee-computer-society',
    email: 'cstechweek@ieee.ec',
    cssBattle: 'https://cssbattle.dev',
    csWeekPeru: 'https://www.instagram.com/csweekperu',
  },
} as const

/* ---------------------------------------------------------- */
/* PHASES & SCHEDULE STRUCTURE                                  */
/* ---------------------------------------------------------- */

export const phases = [
  {
    phase: 'Fase 1 · Semana Académica',
    dates: '28 Sep – 3 Oct (Lun a Sáb)',
    hours: '17:00 a 21:00 ECT (5:00 PM – 9:00 PM)',
    desc: 'Ponencias magistrales y conferencias virtuales de frontera dictadas por referentes de la industria y talento universitario.',
    tag: 'Conferencias Magistrales',
    badge: '6 Días',
  },
  {
    phase: 'Fase 2 · Fin de Semana Competitivo',
    dates: '3 y 4 de Octubre (Sáb y Dom)',
    hours: 'Horarios de duelos y torneos',
    desc: 'Mini Hackathon Frontend auspiciada por CSSBattle y Torneo de Construcción en servidor dedicado de Minecraft.',
    tag: 'Hackathons & Torneos',
    badge: 'Fin de Semana',
  },
] as const

/* ---------------------------------------------------------- */
/* NAVIGATION                                                   */
/* ---------------------------------------------------------- */

export const navLinks = [
  { label: 'El evento', href: '#evento' },
  { label: 'Actividades', href: '#actividades' },
  { label: 'Agenda', href: '#agenda' },
  { label: 'Speakers', href: '#speakers' },
  { label: 'Entradas', href: '#precios' },
  { label: 'Merch', href: '#merch' },
  { label: 'Sponsors', href: '#sponsors' },
  { label: 'Capítulos', href: '#capitulos' },
] as const

/* ---------------------------------------------------------- */
/* TEMÁTICAS — every hex comes from the official IEEE CS bright palette */
/* ---------------------------------------------------------- */

export type TopicKey = 'investigacion' | 'iot' | 'software' | 'ia' | 'seguridad'
export type TrackKey = TopicKey

export const tracks: {
  key: TopicKey
  name: string
  pms: string
  hex: string
  blurb: string
}[] = [
  {
    key: 'investigacion',
    name: 'Investigación Científica',
    pms: 'PMS Process Cyan',
    hex: '#00B5E2',
    blurb: 'Avances académicos, papers y proyectos de innovación científica.',
  },
  {
    key: 'iot',
    name: 'IoT (Internet de las Cosas)',
    pms: 'PMS 109 C',
    hex: '#FFD100',
    blurb: 'Hardware libre, sensores, sistemas embebidos y conectividad.',
  },
  {
    key: 'software',
    name: 'Software',
    pms: 'PMS 368 C',
    hex: '#78BE20',
    blurb: 'Ingeniería de software, Frontend, Backend, arquitectura y DevOps.',
  },
  {
    key: 'ia',
    name: 'Inteligencia Artificial',
    pms: 'PMS 254 C',
    hex: '#981D97',
    blurb: 'Machine learning, visión computacional, agentes autónomos y LLMs.',
  },
  {
    key: 'seguridad',
    name: 'Seguridad',
    pms: 'PMS 200 C',
    hex: '#BA0C2F',
    blurb: 'Ciberseguridad defensiva, hacking ético y protección de sistemas.',
  },
]

export const topics = tracks
export const trackByKey = Object.fromEntries(tracks.map((t) => [t.key, t])) as Record<
  TopicKey,
  (typeof tracks)[number]
>
export const topicByKey = trackByKey

/* ---------------------------------------------------------- */
/* FIGURES                                                      */
/* ---------------------------------------------------------- */

export const stats = [
  { value: '7', label: 'Días', detail: '28 Sep – 04 Oct 2026' },
  { value: '2', label: 'Fases', detail: 'Charlas + Concursos' },
  { value: '5', label: 'Temáticas', detail: 'Áreas de vanguardia' },
  { value: '10', label: 'Capítulos', detail: 'Organizan en conjunto' },
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

export type SessionType = 'ponencia' | 'panel' | 'workshop' | 'reto'

export type Session = {
  start: string
  end: string
  title: string
  speaker?: string
  track: TrackKey
  type: SessionType
}

export type Day = {
  key: string
  label: string
  date: string
  sessions: Session[]
}

/** Empty on purpose: the programme is not defined yet. */
export const days: Day[] = []

export const typeLabels: Record<SessionType, string> = {
  ponencia: 'Ponencia',
  panel: 'Panel',
  workshop: 'Workshop',
  reto: 'Reto',
}

/* ---------------------------------------------------------- */
/* SPEAKERS                                                     */
/* ---------------------------------------------------------- */

export type SpeakerCategory = 'profesional' | 'estudiante'

export type Speaker = {
  name: string
  role: string
  org: string
  photo?: string
  track?: TrackKey
  category?: SpeakerCategory
}

/** Empty on purpose: nobody is publicly confirmed yet. */
export const speakers: Speaker[] = []

/** How many slots to show while no speakers are confirmed. */
export const speakerSlots = 4

export const speakerCategories = [
  {
    title: 'Profesionales de la Industria',
    desc: 'Expertos que aportarán su visión técnica, experiencia laboral e investigaciones aplicadas.',
  },
  {
    title: 'Estudiantes Destacados',
    desc: 'Jóvenes universitarios con dominio sobresaliente en tecnologías de vanguardia y proyectos reales.',
  },
] as const

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
/* SPONSORS & FINANCING                                         */
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
    blurb: 'Keynote propia, presencia estelar en toda la campaña y emisión de cheques virtuales.',
    slots: 1,
    featured: true,
  },
  {
    key: 'oro',
    name: 'Oro',
    blurb: 'Workshop propio y presencia de marca en agenda, transmisiones y certificados.',
    slots: 3,
  },
  {
    key: 'plata',
    name: 'Plata',
    blurb: 'Presencia destacada en sitio web, dinámicas y redes durante toda la semana.',
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
  title: 'Tu marca frente a estudiantes y profesionales de computación del Ecuador.',
  points: [
    'Aportes económicos directos para fondear premios de los concursos.',
    'Emisión de "cheques virtuales" como patrocinador de los ganadores.',
    'Difusión masiva en comunidades universitarias y canales de 10 universidades.',
    'Espacios dedicados para workshops, keynotes técnicas y captación de talento.',
  ],
}

/* ---------------------------------------------------------- */
/* COMMUNITY REWARDS & MERCHANDISING                            */
/* ---------------------------------------------------------- */

export const communityRewards = {
  title: 'Gestión Transparente y Merchandising Físico',
  subtitle: 'Premios para ganadores y recuerdos en cada universidad',
  description:
    'Todos los ingresos de entradas y auspicios son evaluados y gestionados en conjunto por los presidentes de capítulo con los más altos estándares de transparencia. Los fondos se destinan íntegramente a:',
  items: [
    {
      title: 'Premios Económicos y Virtuales',
      desc: 'Reconocimientos en efectivo y cheques virtuales para los ganadores de la Mini Hackathon de CSS y el Concurso de Minecraft.',
    },
    {
      title: 'Merchandising Físico Conmemorativo',
      desc: 'Stickers coleccionables de la mascota tortuga IEEE CS ESPOL y recuerdos oficiales del CS TECH WEEK.',
    },
    {
      title: 'Puntos de Entrega en Cada Universidad',
      desc: 'Distribución física coordinada por los Chairs de capítulos técnicos en cada universidad participante.',
    },
  ],
  image: '/images/merch-stickers.png',
}

/* ---------------------------------------------------------- */
/* PRICING COMBOS (ENTRADAS)                                    */
/* ---------------------------------------------------------- */

export type Price = {
  /** USD for IEEE Computer Society members. */
  member: number
  /** USD for everyone else. */
  general: number
}

export type PricingCombo = {
  key: string
  name: string
  tagline: string
  price: Price
  features: string[]
  badge?: string
  popular?: boolean
  cta: string
}

export const pricingCombos: PricingCombo[] = [
  {
    key: 'solo-charlas',
    name: 'Solo Charlas',
    tagline: 'Acceso completo a las conferencias magistrales.',
    price: { member: 2, general: 3 },
    features: [
      'Acceso a todas las charlas (28 Sep – 3 Oct)',
      'Horario de 17:00 a 21:00 ECT',
      'Acceso a las 5 temáticas oficiales',
      'Certificado digital con horas avaladas',
      'Acceso a sesiones de preguntas y respuestas',
    ],
    cta: 'Elegir Solo Charlas',
  },
  {
    key: 'charlas-1-hackaton',
    name: 'Charlas + 1 Hackatón',
    tagline: 'Semana académica + 1 concurso a tu elección.',
    price: { member: 3, general: 5 },
    features: [
      'Acceso completo a todas las charlas (6 días)',
      'Inscripción a 1 concurso: CSS Battle o Minecraft',
      'Certificado oficial de asistencia y competencia',
      'Opción a premios económicos del concurso elegido',
      'Acceso a comunidad y canales en Discord',
    ],
    badge: 'Popular',
    cta: 'Elegir Charlas + 1 Hackatón',
  },
  {
    key: 'solo-2-hackatones',
    name: 'Solo 2 Hackatones',
    tagline: 'Fin de semana 100% competitivo.',
    price: { member: 5, general: 7 },
    features: [
      'Inscripción a Mini Hackathon de CSS (CSSBattle)',
      'Inscripción a Torneo de Minecraft (Servidor dedicado)',
      'Competencias el fin de semana (3 y 4 de Octubre)',
      'Premios económicos y virtuales para ganadores',
      'Certificado oficial de participación en competencias',
    ],
    cta: 'Elegir 2 Hackatones',
  },
  {
    key: 'full-pass',
    name: 'Full Pass',
    tagline: 'La experiencia completa del CS TECH WEEK.',
    price: { member: 6, general: 8 },
    features: [
      'Acceso total a todas las charlas (28 Sep – 3 Oct)',
      'Inscripción a Mini Hackathon de CSS (CSSBattle)',
      'Inscripción a Torneo de Minecraft (Servidor dedicado)',
      'Certificado digital integral avalado por IEEE CS Ecuador',
      'Elegible a premios económicos y cheques virtuales',
      'Stickers físicos oficiales en puntos de entrega universitarios',
    ],
    popular: true,
    badge: 'Mejor Valor',
    cta: 'Obtener Full Pass',
  },
]

/* ---------------------------------------------------------- */
/* ACTIVITIES                                                   */
/* ---------------------------------------------------------- */

export type Activity = {
  key: string
  kind: string
  name: string
  tagline?: string
  blurb: string
  price: Price
  meta?: { label: string; value: string }[]
  revealed: boolean
  pending?: string[]
  video?: string
  image?: string
  sponsorLogo?: string
  sponsorUrl?: string
  revealAt?: string
}

export const activities: Activity[] = [
  {
    key: 'charlas',
    kind: 'Semana Académica (28 Sep – 3 Oct)',
    name: 'Charlas y Conferencias',
    tagline: '17:00 a 21:00 ECT · 6 días de ponencias magistrales',
    blurb:
      'Ponencias virtuales de alto nivel dictadas por profesionales líderes de la industria y estudiantes universitarios destacados con dominio en tecnologías de frontera.',
    price: { member: 2, general: 3 },
    meta: [
      { label: 'Horario', value: '17:00 a 21:00 ECT' },
      { label: 'Fechas', value: '28 Sep – 03 Oct' },
      { label: 'Certificación', value: 'Horas avaladas' },
    ],
    revealed: true,
  },
  {
    key: 'hackathon',
    kind: 'Mini Hackathon (3 y 4 Oct)',
    name: 'CSS Battle',
    tagline: 'Auspiciado por CSSBattle.dev',
    blurb:
      'Retos intensivos de diseño, maquetación y desarrollo Frontend en vivo. Duelos donde gana quien recree el objetivo visual con la mayor precisión y la menor cantidad de código posible.',
    price: { member: 3, general: 5 },
    meta: [
      { label: 'Auspiciador', value: 'CSSBattle.dev' },
      { label: 'Plataforma', value: 'CSSBattle & Discord' },
      { label: 'Fechas', value: '3 y 4 de Octubre' },
    ],
    revealed: true,
    video: '/teaser/css-battle.mp4',
    image: '/images/cssbattle-preview.png',
    sponsorUrl: 'https://cssbattle.dev',
  },
  {
    key: 'minecraft',
    kind: 'Torneo de Construcción (3 y 4 Oct)',
    name: 'Minecraft',
    tagline: 'Servidor dedicado · Trabajo en equipo',
    blurb:
      'Competencia por equipos dentro de un servidor dedicado exclusivo del evento. Desafíos de creatividad, construcción voxel y trabajo colaborativo para dar vida a proyectos temáticos.',
    price: { member: 3, general: 5 },
    meta: [
      { label: 'Modalidad', value: 'Por equipos' },
      { label: 'Servidor', value: 'Dedicado oficial' },
      { label: 'Fechas', value: '3 y 4 de Octubre' },
    ],
    revealed: true,
    image: '/images/minecraft-server.jpg',
  },
]

/** Reduced rate applies to every activity, so it is said once. */
export const priceNote =
  'La tarifa reducida para miembros aplica presentando tu membresía vigente de IEEE / Computer Society. Los accesos se adquieren por combos para mayor flexibilidad.'

/* ---------------------------------------------------------- */
/* FAQ                                                          */
/* ---------------------------------------------------------- */

export const faq = [
  {
    q: '¿Cómo funcionan los Combos de Entrada y sus precios?',
    a: 'El evento se maneja mediante combos accesibles: Solo Charlas ($2 IEEE / $3 General), Charlas + 1 Hackatón ($3 IEEE / $5 General), Solo 2 Hackatones ($5 IEEE / $7 General) y Full Pass con todo incluido ($6 IEEE / $8 General).',
  },
  {
    q: '¿Necesito ser miembro de IEEE para participar?',
    a: 'No, el evento está 100% abierto a todo público: estudiantes universitarios de cualquier institución, colegiales, profesionales y entusiastas tech. Ser miembro IEEE te otorga un descuento preferencial en cada combo.',
  },
  {
    q: '¿En qué horarios se desarrollarán las charlas y los concursos?',
    a: 'La Semana Académica (Charlas) se realiza del lunes 28 de septiembre al sábado 3 de octubre, de 17:00 a 21:00 ECT (5:00 PM a 9:00 PM hora Ecuador). Los concursos (CSS Battle y Minecraft) se desarrollarán durante el fin de semana del 3 y 4 de octubre.',
  },
  {
    q: '¿Cómo se entregará el certificado y qué aval tiene?',
    a: 'Se emitirá un certificado digital oficial que acredita las horas de asistencia y participación, gestionado por el comité organizador estudiantil con el respaldo y firma virtual de IEEE Computer Society Ecuador.',
  },
  {
    q: '¿Dónde y cómo se entrega el merchandising físico (stickers)?',
    a: 'Los stickers y recuerdos conmemorativos de la iniciativa (como los de la tortuga IEEE CS ESPOL) se distribuirán a través de "puntos de entrega" físicos en los campus de cada universidad organizadora mediante sus Chairs de capítulo.',
  },
  {
    q: '¿Dónde se realiza y cómo accedo a las sesiones virtuales?',
    a: 'Todo el evento es virtual a través de plataformas de streaming y Discord. Los enlaces de acceso a las salas de conferencias y canales de concurso se envían al correo con el que te registras.',
  },
  {
    q: '¿Cómo puedo postular como ponente o auspiciante?',
    a: 'Puedes escribirnos directamente a cstechweek@ieee.ec o a nuestro Instagram oficial @ecu.cs.week.2026. Hay espacios abiertos tanto para keynotes de empresas como para ponencias de estudiantes y profesionales.',
  },
]

/* ---------------------------------------------------------- */
/* FOOTER                                                       */
/* ---------------------------------------------------------- */

export const footerNote =
  'CS Tech Week Ecuador es una iniciativa conjunta de 10 capítulos IEEE Computer Society del Ecuador. IEEE, el logo de IEEE y el logo de IEEE Computer Society son marcas registradas de sus respectivos titulares. CSSBattle es una marca de sus creadores. Minecraft es una marca de Mojang Studios y Microsoft; este torneo comunitario no está afiliado a Mojang ni a Microsoft.'

/* ---------------------------------------------------------- */
/* TICKER — text band between the hero and the rest              */
/* ---------------------------------------------------------- */

export const ticker = [
  'Latitud cero',
  'Ochenta años',
  'Una semana',
  'Diez universidades',
  '5 temáticas',
  'Mini Hackathon CSS',
  'Torneo Minecraft',
  'IEEE Computer Society Ecuador',
  '2026',
] as const
