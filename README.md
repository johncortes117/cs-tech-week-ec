# CS Tech Week Ecuador 2026

Landing del evento organizado por los capítulos IEEE Computer Society del Ecuador,
en el año del 80.º aniversario de IEEE CS.

**Identidad:** «Latitud Cero» — ver `brand/branding-proposal.html` para el manual completo
(concepto, logo, paleta, tipografía, lenguaje gráfico).

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind 3.4 · [Motion](https://motion.dev) 12 · lucide-react
· [Lenis](https://lenis.darkroom.engineering) (scroll suave, ~4 kB) · [cobe](https://cobe.vercel.app) (globo WebGL, ~5 kB)

El mismo stack de `deviathon/devclub_website`, más dos dependencias diminutas para la
capa de interacción. Nada de three.js ni GSAP: todo lo demás es Motion, canvas 2D y CSS.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
```

## Dónde se edita el contenido

**Todo** vive en `lib/content.ts`. Los componentes no tienen texto quemado.

| Qué                        | Constante                          |
| -------------------------- | ---------------------------------- |
| Fechas, sede, contador     | `event`                            |
| Menú                       | `navLinks`                         |
| Tracks y sus colores       | `tracks`                           |
| Cifras del bloque "evento" | `stats`                            |
| Etiquetas de la órbita     | `orbitNodes`                       |
| Ciudades del globo (sedes) | `globeCities`                      |
| Teletipo bajo el hero      | `ticker`                           |
| Programa                   | `days`                             |
| Ponentes                   | `speakers`                         |
| Sedes                      | `venues`                           |
| Capítulos organizadores    | `chapters`                         |
| Niveles de sponsor         | `sponsorTiers`, `sponsorPitch`     |
| Preguntas frecuentes       | `faq`                              |

### Marcadores de dato pendiente

Envuelve cualquier valor por confirmar con `tbd('...')`:

```ts
venue: tbd('Sede por confirmar'),
```

Sale en pantalla en naranja con subrayado punteado, imposible de confundir con
información real. Cuando el dato exista, reemplaza la llamada por el string normal.

### Secciones que se llenan solas

`days`, `speakers`, `venues` y `chapters` están vacíos a propósito. Mientras lo estén,
cada sección muestra un estado "en construcción" diseñado — no cajas rotas. Apenas les
cargues datos, la sección cambia a su versión completa sin tocar ningún componente.

## Pendientes técnicos

- [ ] `NotifyForm` (`components/sections/agenda.tsx`) guarda el correo solo en estado local.
      Conectar a Resend / Supabase / vTools.
- [ ] `event.registerUrl` apunta a `#registro`. Cambiar por la URL real de inscripción.
- [ ] `event.startsAt` es una fecha placeholder. Ajustar a la real (define el contador).
- [ ] Imagen Open Graph (`app/opengraph-image.tsx` o `public/og.png`).

## Assets de marca

`public/logo/` y `brand/assets/logo/` — los cuatro SVG oficiales del 80.º aniversario,
corregidos: los originales venían de Illustrator con `display:none` en la raíz y no se
renderizaban en web.

| Archivo                        | Uso                            |
| ------------------------------ | ------------------------------ |
| `ieee-cs-80th-white.svg`       | Principal en web (fondo negro) |
| `ieee-cs-80th-orange-white.svg`| Sobre azul CS                  |
| `ieee-cs-80th-color.svg`       | Impreso, certificados          |
| `ieee-cs-80th-black.svg`       | Una tinta                      |

El logo **no se recolorea, no se redibuja y no pierde el `TM`**. Espacio de respeto:
0.3 × la altura del logo, en los cuatro lados.

## Movimiento

Todas las curvas y variantes salen de `lib/motion.ts`. Si una animación no viene de ahí,
no debería existir — la coherencia es lo que separa "moderno" de "ruidoso".

### `prefers-reduced-motion`

Lo gestiona `<MotionProvider>` (`components/ui/motion-provider.tsx`), que envuelve la app
con `MotionConfig reducedMotion="user"`: Motion desactiva transform y layout, y deja pasar
opacidad y color. **Los componentes no deben ramificar sus variantes con un ternario** del
tipo `variants={reduce ? still : fadeUp}` — parece equivalente y no lo es (rompía la
orquestación padre-hijo y dejaba secciones enteras invisibles).

Cuando hace falta el valor en JS —apagar un bucle de canvas, no montar el cursor, detener
Lenis— se usa `useReducedMotion` de `lib/use-reduced-motion.ts`, **no** el de `motion/react`:
el de Motion lee la media query en el primer render del cliente pero devuelve `false` en el
servidor, y esa discrepancia rompe la hidratación. El nuestro se corrige tras montar.

Como red de seguridad, todo elemento que aparece con scroll lleva `data-reveal`, y
`globals.css` fuerza `opacity: 1` sobre ellos bajo `prefers-reduced-motion`. Así el
contenido nunca depende de que un IntersectionObserver llegue a disparar.

## Capa de interacción

Componentes adaptados de [Aceternity UI](https://ui.aceternity.com/components) y
[React Bits](https://reactbits.dev) al sistema "Latitud Cero". Ninguno se copió tal cual:
todos están recoloreados a la paleta oficial de IEEE CS y reescritos para Tailwind 3.4.

| Componente (`components/ui/`) | Origen | Dónde vive |
| ----------------------------- | ------ | ---------- |
| `hero-scene.tsx`     | propio · WebGL sin dependencias | Hero — el planeta de puntos y la línea del ecuador |
| `binary-field.tsx`   | propio (idea: RB · DotGrid)  | CTA final — los bits se encienden y voltean con el cursor |
| `magnetic.tsx`       | React Bits · Magnet          | Todos los CTA |
| `text-fx.tsx`        | RB · ShinyText / Decrypted / SplitText | Sello del 80.º, coordenadas, títulos de sección |
| `scroll-velocity.tsx` + `ticker.tsx` | React Bits · ScrollVelocity | Banda entre el hero y el cuerpo |
| `count-up.tsx`       | React Bits · CountUp         | Cifras del bloque "evento" |
| `glowing-effect.tsx` | Aceternity · Glowing Effect  | Tarjetas de track (arco del color del track), agenda, sponsor destacado |
| `comet-card.tsx`     | Aceternity · Comet Card      | Fichas de speaker |
| `globe.tsx`          | Aceternity · 3D Globe (sobre cobe, no three.js) | Sedes |
| `glare-hover.tsx`    | React Bits · GlareHover      | Niveles de sponsor, tarjetas de sede |
| `tracing-beam.tsx`   | Aceternity · Tracing Beam    | Timeline de la agenda (cuando haya `days`) |
| `split-flap.tsx`     | React Bits · Split Flap Text | Contador del CTA final |
| `aurora.tsx`         | Aceternity · Aurora Background | Fondo del CTA final |
| `target-cursor.tsx`  | React Bits · TargetCursor    | Global, solo con puntero fino |
| `click-spark.tsx`    | React Bits · ClickSpark      | Global |
| `smooth-scroll.tsx`  | Lenis                        | Global — y toda la navegación por anclas |

Los efectos que dependen del cursor (`glowing-effect`, `comet-card`, `magnetic`,
`target-cursor`) no existen en táctil ni con la preferencia de movimiento activa.

## La escena del hero

`components/ui/hero-scene.tsx` — WebGL a pelo, sin three.js ni OGL. Dos programas y dos
llamadas de dibujo:

1. **Fondo**: un triángulo a pantalla completa. Nebulosa con ruido fbm, halo alrededor del
   planeta y la línea del ecuador. Los cinco colores salen del brand guide.
2. **Planeta**: 7000 puntos repartidos por espiral de Fibonacci sobre una esfera unitaria.
   Los puntos de latitud ~0 se pintan naranja, así que **el ecuador no está dibujado
   encima: lo dibuja la geometría**. Se ensambla al cargar, gira solo, se inclina con el
   cursor y se hunde con el scroll.

Salvaguardas: resolución tope 1,5×; **calidad adaptativa** (mide los primeros 45 cuadros y,
si no llega a ~48 fps, baja a 1× y apaga la capa de ruido secundaria); no dibuja nada
mientras está fuera de pantalla; y si no hay WebGL cae a un degradado equivalente.

## Rendimiento

El sitio arrancaba a **6 fps** en el build de producción medido con renderizado por software.
El perfilador de CPU daba 70 % de tiempo ocioso: el cuello no era JavaScript, era **pintado**.
Retirando capas una por una salieron los culpables y se corrigieron:

| Causa | Coste medido | Qué se hizo |
| ----- | ------------ | ----------- |
| `filter: blur()` sobre capas grandes (atmósfera del hero, Aurora, halo del glowing effect) | ×2,3 de fotogramas | Fuera. La suavidad va horneada en los degradados; el hero la hace el shader |
| Conos del Spotlight + rejilla técnica a pantalla completa | ×1,8 | Sustituidos por la escena WebGL |
| `background-position` animado en Aurora | repintaba la capa entera cada cuadro | Ahora se mueve con `transform` |
| `fillText` por celda y por cuadro en `binary-field` (~2000 llamadas × 60/s) | la función JS más cara del sitio | La retícula se cachea en un lienzo fuera de pantalla; solo se repintan las ~130 celdas del halo |
| Un `pointermove` + `scroll` por instancia de `glowing-effect` (×8) | 8 reflows por movimiento de ratón | Un único listener de módulo que reparte a todas las instancias en un rAF |
| `getComputedStyle` en cada movimiento del cursor personalizado | recálculo de estilo a 60 Hz | Cacheado por elemento en un `WeakMap` |
| Bucles de rAF permanentes (globo, cinta de scroll, chispas del clic) | GPU y compositor toda la visita | Se apagan fuera de pantalla, o solo corren cuando hay algo que dibujar |

**Resultado: de 6 a ~42 fps**, y prácticamente sin cambio al frenar la CPU 4× — señal de que
ya no queda trabajo de JavaScript en el camino crítico. Todas esas cifras salen de
renderizado por software (sin GPU), que es el peor caso posible; con GPU real va sobrada.

### Reglas para no volver atrás

- Nada de `filter: blur()` sobre elementos grandes o animados. Si hace falta suavidad, se
  hornea en el degradado o se resuelve en el shader.
- Animar `transform` y `opacity`, nunca `background-position`, `top/left` ni `width`.
- Todo bucle de `requestAnimationFrame` se apaga con un `IntersectionObserver` cuando su
  elemento sale de pantalla.
- Los listeners de `pointermove` se agrupan en un rAF y se comparten entre instancias.
  Ninguna lectura de geometría (`getBoundingClientRect`, `getComputedStyle`) va suelta
  dentro de un manejador de eventos.
