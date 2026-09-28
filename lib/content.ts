/* ============================================================
   SINGLE SOURCE OF CONTENT
   Everything editable on the site lives here. Components carry
   no copy of their own: changing the event = changing this file.

   One rule governs the copy: every fact is said once. Dates and
   hours live in the week strip, prices in the passes, the tracks
   in the speaker filter. If a sentence repeats something another
   section already shows, it goes.
   ============================================================ */

/* ---------------------------------------------------------- */
/* EVENT                                                        */
/* ---------------------------------------------------------- */

export const event = {
  name: 'CS Tech Week',
  fullName: 'CS Tech Week Ecuador 2026',
  year: 2026,

  /** Hero: the name, what it is, when. Plain on purpose. */
  headline: ['CS Tech Week', 'Ecuador 2026'],
  summary:
    'Una semana de charlas gratuitas, un hackathon de CSS y un torneo de Minecraft, organizada por los capítulos IEEE Computer Society del país.',
  when: 'Del 28 de septiembre al 4 de octubre',
  format: 'Virtual',

  /** Ecuador is UTC−5 all year round. The talks open Monday 28 at 17:00. */
  startsAt: '2026-09-28T17:00:00-05:00',
  endsAt: '2026-10-05T00:00:00-05:00',

  registerUrl: 'https://forms.gle/3aLwMJjCubUX7NXJ7',

  social: {
    instagram: 'https://www.instagram.com/ecu.cs.week.2026/',
    instagramHandle: '@ecu.cs.week.2026',
    email: 'cstechweek@ieee.ec',
  },

  closing: 'Nos vemos en la mitad del mundo',
} as const

export const nav = [
  { label: 'Programa', href: '#programa' },
  { label: 'Speakers', href: '#speakers' },
  { label: 'Concursos', href: '#concursos' },
  { label: 'Entradas', href: '#entradas' },
  { label: 'Organizan', href: '#organizan' },
  { label: 'FAQ', href: '#faq' },
] as const

/* ---------------------------------------------------------- */
/* THE WEEK                                                     */
/* Blocks span day indexes (0 = Monday 28). `hours` is in        */
/* Ecuador time and drives the "on air" state in the header.     */
/* ---------------------------------------------------------- */

export const week = {
  firstDay: '2026-09-28T00:00:00-05:00',
  days: [
    { weekday: 'Lun', day: '28', month: 'Sep' },
    { weekday: 'Mar', day: '29' },
    { weekday: 'Mié', day: '30' },
    { weekday: 'Jue', day: '01', month: 'Oct' },
    { weekday: 'Vie', day: '02' },
    { weekday: 'Sáb', day: '03' },
    { weekday: 'Dom', day: '04' },
  ],
  blocks: [
    {
      key: 'charlas',
      name: 'Charlas',
      detail: 'Desde las 17:00 ECT',
      from: 0,
      to: 5,
    },
    {
      key: 'concursos',
      name: 'Concursos',
      detail: 'CSS Battle · Minecraft',
      from: 5,
      to: 6,
    },
  ],
} as const

/* ---------------------------------------------------------- */
/* TRACKS — the official IEEE CS bright palette                 */
/* `ink` is the text colour that reads on top of the swatch.    */
/* ---------------------------------------------------------- */

export type TrackKey = 'investigacion' | 'iot' | 'software' | 'ia' | 'seguridad'

export const tracks: { key: TrackKey; name: string; hex: string; ink: 'dark' | 'light' }[] = [
  { key: 'investigacion', name: 'Investigación', hex: '#00B5E2', ink: 'dark' },
  { key: 'iot', name: 'IoT', hex: '#FFD100', ink: 'dark' },
  { key: 'software', name: 'Software', hex: '#78BE20', ink: 'dark' },
  { key: 'ia', name: 'IA', hex: '#981D97', ink: 'light' },
  { key: 'seguridad', name: 'Seguridad', hex: '#BA0C2F', ink: 'light' },
]

export const trackByKey = Object.fromEntries(tracks.map((t) => [t.key, t])) as Record<
  TrackKey,
  (typeof tracks)[number]
>

/* ---------------------------------------------------------- */
/* SPEAKERS                                                     */
/* Photos: drop the original in /public/speakers, run           */
/* `pnpm images`, and point `photo` at the WebP it prints.      */
/* `tracks` lists every topic a talk covers; it shows up under  */
/* each of them in the filter. `slot` places the card on the    */
/* wall. Two entries with the same `talk` share a card. A       */
/* speaker only appears once added here — there are no          */
/* placeholder cards.                                           */
/* ---------------------------------------------------------- */

export type Speaker = {
  name: string
  talk: string
  /** Institution or company. */
  org: string
  /** Academic degree, set small before the name: 'PhD.', 'MSc.', 'Mg.', 'Ing.' */
  degree?: string
  /** Professional position, shown before the institution: 'AI Engineer', 'Docente investigador' */
  role?: string
  photo?: string
  /** Every topic the talk covers. */
  tracks: TrackKey[]
  category?: 'profesional' | 'estudiante'
  /** When the talk happens. `day`: 0 = Monday 28. Hours in Ecuador time. */
  slot?: Slot
  /** Zoom link for the talk. Empty until it is published; a shared talk
   *  needs it on one of its speakers only. */
  zoom?: string
}

export type Slot = { day: number; start: string; end: string }

export const speakers: Speaker[] = [
  {
    name: 'Diego H. Peluffo-Ordóñez',
    degree: 'PhD.',
    talk: '…from ‘What If?’ to ‘Why Not?’: The journey of SDAS Research Group',
    org: 'YACHAY TECH',
    photo: '/speakers/web/diego.webp',
    tracks: ['investigacion', 'ia'],
    slot: { day: 3, start: '18:00', end: '19:00' },
    zoom: 'https://cedia.zoom.us/j/85154930362',
    category: 'profesional',
  },
  {
    name: 'Gustavo Justicia',
    talk: '¿Quién Está Comprando en tu Nombre? Comercio agéntico: oportunidad, riesgo y el futuro del consumo',
    degree: 'MSc.',
    role: 'CEO @StrategIA',
    org: 'YACHAY TECH',
    photo: '/speakers/web/gustavo.webp',
    tracks: ['ia', 'seguridad'],
    slot: { day: 0, start: '18:00', end: '19:00' },
    zoom: 'https://cedia.zoom.us/j/83415501349',
    category: 'profesional',
  },
  {
    name: 'Harikrishnan Muthukrishnan',
    talk: 'Low-Code by Design: Architecting Governed Enterprise Platforms in Regulated Healthcare',
    org: 'ESPOL',
    role: 'Forbes Technology Council Member',
    photo: '/speakers/web/Harikrishnan.webp',
    tracks: ['software'],
    slot: { day: 1, start: '19:00', end: '20:00' },
    zoom: 'https://cedia.zoom.us/j/85424704295',
    category: 'profesional',
  },
  {
    name: 'Diego Garcia',
    talk: 'Desarrollo de Software Guiado por Especificaciones (SDD) mediante Agentes de IA',
    degree: 'MSc.',
    org: 'ESPOCH',
    photo: '/speakers/web/diego_garcia.webp',
    tracks: ['software', 'ia'],
    slot: { day: 0, start: '20:00', end: '21:00' },
    zoom: 'https://cedia.zoom.us/j/88057627373',
    category: 'profesional',
  },
  {
    name: 'Edwin Hernando Salazar',
    talk: 'Del Modelo Matemático a la Imagen Sintética: generación de venas de la palma para el reconocimiento biométrico',
    role: 'Research Professor',
    org: 'ESPOCH',
    photo: '/speakers/web/edwin.webp',
    tracks: ['investigacion', 'ia', 'seguridad'],
    slot: { day: 2, start: '21:00', end: '22:00' },
    zoom: 'https://cedia.zoom.us/j/89337203053',
    category: 'profesional',
  },
  {
    name: 'Carlos Daniel Puentestar',
    talk: 'El uso de señales cerebrales como forma de control para tus dispositivos',
    org: 'UTN',
    photo: '/speakers/web/carlos.webp',
    tracks: ['iot', 'investigacion'],
    slot: { day: 2, start: '20:00', end: '21:00' },
    zoom: 'https://cedia.zoom.us/j/87075045103',
    category: 'profesional',
  },
  {
    name: 'Derek Guevara',
    talk: 'IA y Seguridad con AWS',
    role: 'AWS Student Builder Campus Leader',
    org: 'ESPOL',
    photo: '/speakers/web/dereck.webp',
    tracks: ['seguridad', 'ia'],
    slot: { day: 2, start: '18:00', end: '19:00' },
    zoom: 'https://cedia.zoom.us/j/81741875354',
    category: 'estudiante',
  },
  {
    name: 'Pablo Robalino',
    talk: 'Micro Mentoring y Actividades para Sudamérica',
    role: 'Global South America Liaison, IEEE CS MGA',
    org: 'UTN',
    photo: '/speakers/web/pablo.webp',
    tracks: ['investigacion'],
    slot: { day: 4, start: '18:00', end: '19:00' },
    zoom: 'https://cedia.zoom.us/j/85720130009',
    category: 'profesional',
  },
  {
    name: 'Kevin Pérez',
    talk: 'Vibecoding con propósito: de la idea a una aplicación funcional',
    role: 'SupaSquad Member & GDG Volunteer',
    org: 'UTN',
    photo: '/speakers/web/kevin_perez.webp',
    tracks: ['ia', 'software'],
    slot: { day: 2, start: '17:00', end: '18:00' },
    zoom: 'https://cedia.zoom.us/j/84564933852',
    category: 'estudiante',
  },
  {
    name: 'Kevin Morales',
    talk: 'De la AI al equipo: construyendo agentes con Grok Bot para resolver problemas reales',
    role: 'CEO & Co-Founder @Meniuz - Senior Mobile Engineer',
    org: 'UTN',
    photo: '/speakers/web/kevin_morales.webp',
    tracks: ['ia', 'software'],
    slot: { day: 3, start: '17:00', end: '18:00' },
    zoom: 'https://cedia.zoom.us/j/88413157823',
    category: 'profesional',
  },
  {
    name: 'Andrés Alba',
    talk: 'Técnicas avanzadas de optimización y paralelismo para soportar sistemas de IA de alta concurrencia en producción',
    degree: 'Ing.',
    org: 'UCACUE',
    photo: '/speakers/web/andres.webp',
    tracks: ['software', 'ia'],
    slot: { day: 5, start: '18:00', end: '19:00' },
    zoom: 'https://cedia.zoom.us/j/82313524954',
    category: 'profesional',
  },
  {
    name: 'Pablo Herrera',
    talk: 'Spec-Driven Development con IA: Arquitectura y desarrollo guiado de aplicaciones web',
    degree: 'MSc.',
    org: 'UCACUE',
    photo: '/speakers/web/pablo_herrera.webp',
    tracks: ['software', 'ia'],
    slot: { day: 5, start: '17:00', end: '18:00' },
    zoom: 'https://cedia.zoom.us/j/89943795352',
    category: 'profesional',
  },
  {
    name: 'Felipe Mendieta',
    talk: 'Primero los datos, luego la IA - Arquitectura y calidad antes de construir agentes',
    org: 'UCACUE',
    photo: '/speakers/web/felipe.webp',
    tracks: ['software', 'ia'],
    slot: { day: 5, start: '19:00', end: '20:00' },
    zoom: 'https://cedia.zoom.us/j/86525720640',
    category: 'profesional',
  },
  {
    name: 'David Castro',
    talk: 'Cómo escala una aplicación en el mundo real: La brecha entre los proyectos universitarios/personales y los sistemas que atienden a millones de usuarios',
    degree: 'Ing.',
    org: 'EPN',
    photo: '/speakers/web/david.webp',
    tracks: ['software'],
    slot: { day: 2, start: '19:00', end: '20:00' },
    zoom: 'https://cedia.zoom.us/j/86383675348',
    category: 'profesional',
  },
  {
    name: 'Samuel Lascano Rivera',
    talk: 'De los datos a la inteligencia: IA, sensores y sistemas inteligentes para resolver problemas reales',
    degree: 'PhD.',
    role: 'Research Professor',
    org: 'UPEC',
    photo: '/speakers/web/samuel.webp',
    tracks: ['iot', 'ia'],
    slot: { day: 1, start: '17:00', end: '18:00' },
    zoom: 'https://cedia.zoom.us/j/82300977473',
    category: 'profesional',
  },
  {
    name: 'Geovanny Basantes',
    talk: 'De Python al PLC: Integrando Sistemas Industriales con Modbus',
    degree: 'Ing.',
    role: 'CEO & Founder @DevIAlabs',
    org: 'UPEC',
    photo: '/speakers/web/geovanny.webp',
    tracks: ['iot', 'software'],
    slot: { day: 0, start: '17:00', end: '18:00' },
    zoom: 'https://cedia.zoom.us/j/88600129619',
    category: 'profesional',
  },
  {
    name: 'Johan Sáenz',
    talk: 'Java con Spring boot - Comandas en vivo',
    org: 'UCE',
    photo: '/speakers/web/johan.webp',
    tracks: ['software'],
    slot: { day: 3, start: '20:00', end: '21:00' },
    zoom: 'https://cedia.zoom.us/j/87207246271',
    category: 'estudiante',
  },
  {
    name: 'Lesly Salas Cueva',
    talk: 'De la Hoja de Vida a la Decisión: IA aplicada al Reclutamiento, Diseño y Evaluación Experimental',
    role: 'Development Intern @UMCO',
    org: 'UCE',
    photo: '/speakers/web/lesly.webp',
    tracks: ['ia', 'investigacion'],
    slot: { day: 1, start: '20:00', end: '21:00' },
    zoom: 'https://cedia.zoom.us/j/86733237256',
    category: 'estudiante',
  },
  {
    name: 'Meybili T. Olivares',
    talk: 'De la Hoja de Vida a la Decisión: IA aplicada al Reclutamiento, Diseño y Evaluación Experimental',
    role: 'Development Intern @NATONAR S.A.S.',
    org: 'UCE',
    photo: '/speakers/web/meybili.webp',
    tracks: ['ia', 'investigacion'],
    slot: { day: 1, start: '20:00', end: '21:00' },
    zoom: 'https://cedia.zoom.us/j/86733237256',
    category: 'estudiante',
  },
  {
    name: 'Christian Andrés Tapia',
    talk: 'Espionaje físico moderno: Cuando el peligro no viene por internet, sino por el cable de la pared',
    degree: 'MSc.',
    org: 'UCE',
    photo: '/speakers/web/christian.webp',
    tracks: ['seguridad'],
    slot: { day: 4, start: '17:00', end: '18:00' },
    zoom: 'https://cedia.zoom.us/j/86170622702',
    category: 'profesional',
  },
  {
    name: 'Jonathan Tito',
    talk: 'IA: privacidad y soberanía digital',
    degree: 'MSc.',
    role: 'Professor',
    org: 'UIDE',
    photo: '/speakers/web/jonathan.webp',
    tracks: ['ia', 'seguridad'],
    slot: { day: 3, start: '21:00', end: '22:00' },
    zoom: 'https://cedia.zoom.us/j/81459108705',
    category: 'profesional',
  },
  {
    name: 'Thelman Pabón',
    talk: 'Ciberseguridad: la respuesta al desempleo juvenil en Ecuador',
    org: 'USFQ',
    photo: '/speakers/web/thelman.webp',
    tracks: ['seguridad'],
    slot: { day: 0, start: '19:00', end: '20:00' },
    zoom: 'https://cedia.zoom.us/j/83927500504',
  },
  {
    name: 'Pavel Alba',
    talk: 'Cómo navegar el panorama de la IA: modelos, agentes y niveles de razonamiento',
    org: 'USFQ',
    photo: '/speakers/web/pavel.webp',
    tracks: ['ia'],
    slot: { day: 1, start: '18:00', end: '19:00' },
    zoom: 'https://cedia.zoom.us/j/84073234539',
  },
]

/* ---------------------------------------------------------- */
/* CONTESTS — the competitive weekend                           */
/* ---------------------------------------------------------- */

export type Contest = {
  key: 'cssbattle' | 'minecraft'
  name: string
  kind: string
  blurb: string
  partner?: { name: string; url: string }
  video?: string
  image?: string
  /** Day always; hours once they are confirmed. */
  slot: { day: number; start?: string; end?: string }
}

export const contests: Contest[] = [
  {
    key: 'cssbattle',
    name: 'CSS Battle',
    kind: 'Hackathon de CSS',
    blurb: 'Recrea un objetivo visual con la mayor precisión y el menor código posible.',
    partner: { name: 'cssbattle.dev', url: 'https://cssbattle.dev' },
    video: '/teaser/css-battle.mp4',
    image: '/images/web/cssbattle-preview.webp',
    slot: { day: 6 },
  },
  {
    key: 'minecraft',
    name: 'Minecraft',
    kind: 'Torneo de construcción',
    blurb: 'Construcción individual en un servidor exclusivo del evento.',
    image: '/images/web/minecraft-server.webp',
    slot: { day: 5, start: '14:30', end: '16:30' },
  },
]

export const prizes = 'Premios económicos y virtuales para quienes ganen.'

/* ---------------------------------------------------------- */
/* PASSES                                                       */
/* ---------------------------------------------------------- */

export type Pass = {
  key: string
  name: string
  /** USD. `member` applies with a current IEEE / Computer Society membership. */
  price: { member: number; general: number }
  includes: string[]
}

export const passes: Pass[] = [
  {
    key: 'charlas',
    name: 'Charlas',
    price: { member: 0, general: 0 },
    includes: ['Las seis jornadas de charlas', 'Preguntas en vivo a cada speaker'],
  },
  {
    key: 'un-concurso',
    name: '1 concurso',
    price: { member: 3, general: 5 },
    includes: ['CSS Battle o Minecraft', 'Charlas incluidas'],
  },
  {
    key: 'dos-concursos',
    name: '2 concursos',
    price: { member: 5, general: 7 },
    includes: ['CSS Battle y Minecraft', 'Charlas incluidas'],
  },
]

export const passesNote =
  'Todas incluyen certificado digital. La tarifa IEEE requiere membresía vigente de IEEE o Computer Society.'

/* ---------------------------------------------------------- */
/* ORGANISERS                                                   */
/* Cities are placed on the map by their coordinates; the list  */
/* is sorted north to south, so latitude zero falls between      */
/* them on its own.                                             */
/* ---------------------------------------------------------- */

export const cities = [
  { name: 'Tulcán', lat: 0.8114, lon: -77.7178 },
  { name: 'Urcuquí', lat: 0.4183, lon: -78.1975 },
  { name: 'Ibarra', lat: 0.35, lon: -78.1167 },
  { name: 'Quito', lat: -0.22, lon: -78.5125 },
  { name: 'Riobamba', lat: -1.6667, lon: -78.65 },
  { name: 'Guayaquil', lat: -2.1833, lon: -79.8833 },
  { name: 'Cuenca', lat: -2.8972, lon: -79.0042 },
] as const

export type CityName = (typeof cities)[number]['name']

export type Chapter = {
  /** Short name, as students say it. */
  short: string
  /** The brand guide asks for the full name, no acronyms. */
  fullName: string
  university: string
  city: CityName
  /** Omitted when a chapter can't show its logo yet: the panel falls back to text. */
  logo?: string
  /** Shown in place of the logo, e.g. who leads the chapter. */
  lead?: { name: string; role: string }
  instagram: string
}

export const chapters: Chapter[] = [
  {
    short: 'ESPOL',
    fullName: 'IEEE Computer Society ESPOL',
    university: 'Escuela Superior Politécnica del Litoral',
    city: 'Guayaquil',
    logo: '/chapters/web/CS_ESPOL.webp',
    instagram: 'https://www.instagram.com/ieee.espol.computer',
  },
  {
    short: 'UTN',
    fullName: 'IEEE Computer Society UTN',
    university: 'Universidad Técnica del Norte',
    city: 'Ibarra',
    /* No logo for now: the university hasn't approved its brand on the event yet. */
    lead: { name: 'Adrián Urresta', role: 'Líder UTN' },
    instagram: 'https://www.instagram.com/ieee_utncs',
  },
  {
    short: 'USFQ',
    fullName: 'IEEE Computer Society USFQ',
    university: 'Universidad San Francisco de Quito',
    city: 'Quito',
    logo: '/chapters/web/CS_USFQ.webp',
    instagram: 'https://www.instagram.com/ieee_usfq_cs',
  },
  {
    short: 'UPS',
    fullName: 'IEEE Computer Society UPS Cuenca',
    university: 'Universidad Politécnica Salesiana',
    city: 'Cuenca',
    logo: '/chapters/web/CS_UPS_CUENCA.webp',
    instagram: 'https://www.instagram.com/cs.ieee.ups.cuenca',
  },
  {
    short: 'UIDE',
    fullName: 'IEEE Computer Society UIDE',
    university: 'Universidad Internacional del Ecuador',
    city: 'Quito',
    logo: '/chapters/web/CS_UIDE.webp',
    instagram: 'https://www.instagram.com/ieee_uide',
  },
  {
    short: 'UCACUE',
    fullName: 'IEEE Computer Society UCACUE',
    university: 'Universidad Católica de Cuenca',
    city: 'Cuenca',
    logo: '/chapters/web/CS_UCACUE.webp',
    instagram: 'https://www.instagram.com/ieee.uc',
  },
  {
    short: 'EPN',
    fullName: 'IEEE Computer Society EPN',
    university: 'Escuela Politécnica Nacional',
    city: 'Quito',
    logo: '/chapters/web/CS_EPN.webp',
    instagram: 'https://www.instagram.com/computer_society.epn',
  },
  {
    short: 'UPEC',
    fullName: 'IEEE Computer Society UPEC',
    university: 'Universidad Politécnica Estatal del Carchi',
    city: 'Tulcán',
    logo: '/chapters/web/CS_UPEC.webp',
    instagram: 'https://www.instagram.com/ieee.upec',
  },
  {
    short: 'Yachay Tech',
    fullName: 'IEEE Computer Society Yachay Tech',
    university: 'Universidad Yachay Tech',
    city: 'Urcuquí',
    logo: '/chapters/web/CS_YACHAY.webp',
    instagram: 'https://www.instagram.com/ramaieeeyt',
  },
  {
    short: 'ESPOCH',
    fullName: 'IEEE Computer Society ESPOCH',
    university: 'Escuela Superior Politécnica de Chimborazo',
    city: 'Riobamba',
    logo: '/chapters/web/CS_ESPOCH.webp',
    instagram: 'https://www.instagram.com/ieee_espoch_cs',
  },
  {
    short: 'UCE',
    fullName: 'Rama Estudiantil IEEE UCE',
    university: 'Universidad Central del Ecuador',
    city: 'Quito',
    logo: '/chapters/web/IEEE_UCE_SB.webp',
    instagram: 'https://www.instagram.com/ieee.uce.sb',
  },
]

/* ---------------------------------------------------------- */
/* MERCH                                                        */
/* ---------------------------------------------------------- */

export const merch = {
  blurb: 'Stickers conmemorativos, con punto de entrega en cada universidad organizadora.',
  sheets: [
    {
      src: '/images/web/merch-stickers.webp',
      alt: 'Stickers de IEEE CS ESPOL y CS Tech Week con la tortuga graduada',
      width: 652,
      height: 247,
    },
    {
      src: '/images/web/merch_usfq.webp',
      alt: 'Stickers de IEEE CS USFQ con el dragón',
      width: 1400,
      height: 850,
    },
  ],
} as const

/* ---------------------------------------------------------- */
/* SPONSORS                                                     */
/* Empty tiers are not drawn.                                   */
/* ---------------------------------------------------------- */

export type SponsorTier = {
  key: string
  name: string
  /** `scale` enlarges a logo whose proportions make it look small next to the rest. */
  sponsors: { name: string; logo?: string; scale?: number }[]
}

export const sponsorTiers: SponsorTier[] = [
  {
    key: 'platinum',
    name: 'Platinum',
    sponsors: [],
  },
  {
    key: 'gold',
    name: 'Gold',
    sponsors: [
      { name: 'CAPIA, Cámara de la Pequeña Industria del Azuay', logo: '/sponsors/web/capia.webp' },
      { name: 'Maxxnet', logo: '/sponsors/web/maxxnet_logo.webp', scale: 1.3 },
      { name: 'Google Developer Groups Cuenca', logo: '/sponsors/web/gdg_cuenca_logo.webp', scale: 1.35 },
    ],
  },
  {
    key: 'silver',
    name: 'Silver',
    sponsors: [
      { name: 'CSSBattle', logo: '/sponsors/web/css_battle.webp' },
      { name: 'Grupo Sky', logo: '/sponsors/web/grupo_sky.webp', scale: 1.45 },
      { name: 'xAI', logo: '/sponsors/web/spacexai.webp' },
      { name: 'Meniuz', logo: '/sponsors/web/meniuz.webp' },
    ],
  },
]

/* ---------------------------------------------------------- */
/* FAQ — only what no section already answers                   */
/* ---------------------------------------------------------- */

export const faq = [
  {
    q: '¿Necesito ser miembro de IEEE?',
    a: 'No. El evento está abierto a estudiantes de cualquier institución, profesionales y curiosos. La membresía solo reduce el precio de los concursos.',
  },
  {
    q: '¿Cómo me conecto a las charlas?',
    a: 'Todo ocurre en línea. Al inscribirte recibirás en tu correo los enlaces a las salas de las charlas y a los canales de Discord de los concursos.',
  },
  {
    q: '¿Qué aval tiene el certificado?',
    a: 'Es un certificado digital por tus horas de asistencia y participación, emitido por el comité organizador con el respaldo de IEEE Computer Society Ecuador.',
  },
  {
    q: '¿Cómo recibo los stickers?',
    a: 'En persona: cada capítulo organizador tiene un punto de entrega en su campus.',
  },
  {
    q: '¿Quiero auspiciar o dar una charla?',
    a: 'Escríbenos a cstechweek@ieee.ec y te contamos qué espacios siguen abiertos.',
  },
]

/* ---------------------------------------------------------- */
/* FOOTER                                                       */
/* ---------------------------------------------------------- */

export const footerNote =
  'Una iniciativa de diez capítulos IEEE Computer Society y la Rama Estudiantil IEEE UCE. IEEE y IEEE Computer Society son marcas de sus titulares. Minecraft es una marca de Mojang Studios; este torneo comunitario no está afiliado a Mojang ni a Microsoft.'
