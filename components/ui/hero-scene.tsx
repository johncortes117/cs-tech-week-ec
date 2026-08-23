'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   ESCENA DEL HERO — WebGL

   Un planeta de siete mil puntos con el ecuador encendido, y una
   línea de luz naranja que lo atraviesa y sigue de lado a lado
   de la pantalla. Es la misma regla ecuatorial que separa cada
   sección del sitio, pero aquí se ve de dónde sale: de un
   planeta, a la altura exacta de la latitud cero.

   Sustituye a toda la atmósfera anterior (conos de Spotlight,
   degradados desenfocados, rejilla y campo binario). No fue por
   gusto: medido sobre el build de producción, las capas con
   `filter: blur` costaban 2,3× de fotogramas y los conos otro
   1,8×, porque cada una obliga a rasterizar superficies enormes
   en cada cuadro. Un shader hace todo eso en una pasada.

   Dos programas, dos llamadas de dibujo:

   1. FONDO — un triángulo a pantalla completa. Nebulosa con
      ruido fbm, halo alrededor del planeta y la línea del
      ecuador. Los cinco colores salen del brand guide.

   2. PLANETA — puntos repartidos por espiral de Fibonacci sobre
      una esfera unitaria. Gira solo, se inclina con el cursor y
      se hunde con el scroll. Los puntos cuya latitud es ~0 se
      pintan naranja: el ecuador no está dibujado encima, lo
      dibuja la propia geometría del planeta.

   Todo el 3D es matemática en el vertex shader — sin three.js,
   sin OGL, sin dependencias.
   ============================================================ */

const VERT_BG = `
attribute vec2 aXY;
void main() { gl_Position = vec4(aXY, 0.0, 1.0); }
`

const FRAG_BG = `
precision mediump float;
uniform vec2  uRes;
uniform vec2  uCenter;   /* centro del planeta, en espacio p */
uniform float uTime;
uniform float uScroll;
uniform float uQuality;  /* 1 = completo, 0 = versión barata */
uniform float uIntroBg;  /* la línea del ecuador nace con el planeta */

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
             mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);

  vec3 INK    = vec3(0.020, 0.027, 0.043);  /* #05070B */
  vec3 ABYSS  = vec3(0.000, 0.157, 0.333);  /* #002855 PMS 295 */
  vec3 DEEP   = vec3(0.000, 0.384, 0.608);  /* #00629B PMS 3015 */
  vec3 CYAN   = vec3(0.000, 0.710, 0.886);  /* #00B5E2 */
  vec3 ORANGE = vec3(1.000, 0.639, 0.000);  /* #FFA300 PMS 137 */

  vec2 d = p - uCenter;
  float r = length(d);
  float n = fbm(p * 1.9 + vec2(uTime * 0.018, uTime * 0.011));

  /* La página es negra. La luz nace del planeta y se apaga
     rápido: sin esto el fondo se lava y deja de ser IEEE CS. */
  vec3 col = INK;
  col += ABYSS * 1.05 * exp(-r * 1.9) * (0.55 + 0.55 * n);
  col += DEEP  * 0.34 * exp(-r * 3.1);

  if (uQuality > 0.5) {
    float n2 = fbm(p * 3.4 - vec2(uTime * 0.013, uTime * 0.019));
    col += CYAN * pow(n2, 4.0) * 0.13 * exp(-r * 1.2);
  }

  /* La línea del ecuador cruza toda la pantalla a la altura del
     planeta: el filo nítido más un rescoldo ancho debajo. */
  float ecuador = p.y - uCenter.y;
  col += ORANGE * exp(-abs(ecuador) * 150.0) * 0.55 * uIntroBg;
  col += ORANGE * exp(-abs(ecuador) * 13.0) * 0.085 * (0.6 + 0.4 * n) * uIntroBg;

  /* se apaga hacia los bordes horizontales para que la línea no
     choque de frente con el marco */
  col *= 1.0 - 0.5 * smoothstep(0.55, 1.1, abs(p.x) / max(0.35, uRes.x / uRes.y * 0.5));

  /* viñeta y desvanecido inferior hacia la siguiente sección */
  col *= 1.0 - 0.42 * smoothstep(0.30, 1.0, length(p * vec2(0.72, 1.25)));
  col *= 1.0 - 0.55 * smoothstep(0.30, 0.5, p.y * -1.0) * uScroll;

  /* grano finísimo: mata el banding de los degradados oscuros */
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.013;

  gl_FragColor = vec4(col, 1.0);
}
`

const VERT_DOTS = `
attribute vec3  aPos;
attribute float aRand;

uniform float uYaw;
uniform float uPitch;
uniform float uAspect;
uniform float uScale;
uniform vec2  uCenterNdc;
uniform float uDpr;
uniform float uIntro;   /* 0 = disperso, 1 = planeta formado */

varying float vDepth;
varying float vIntro;
varying float vEquator;
varying float vRand;

void main() {
  /* ENSAMBLAJE. Los puntos entran desde fuera y caen a su sitio
     en la esfera, cada uno con su propio retraso. Es lo primero
     que se ve al abrir la página: el planeta se construye. */
  float delay = aRand * 0.4;
  float k = clamp((uIntro - delay) / max(0.0001, 1.0 - delay), 0.0, 1.0);
  k = 1.0 - pow(1.0 - k, 3.0);
  vIntro = k;
  vec3 seed = aPos * mix(3.4, 1.0, k);

  /* giro sobre el eje polar */
  float cy = cos(uYaw), sy = sin(uYaw);
  vec3 p = vec3(seed.x * cy + seed.z * sy, seed.y, -seed.x * sy + seed.z * cy);

  /* inclinación: es lo que responde al cursor */
  float cp = cos(uPitch), sp = sin(uPitch);
  p = vec3(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);

  /* la latitud se mide ANTES de rotar: el ecuador viaja con el
     planeta, no con la cámara */
  vEquator = 1.0 - smoothstep(0.0, 0.038, abs(aPos.y));
  vDepth = p.z;
  vRand = aRand;

  float persp = 2.75 / (2.75 - p.z);
  vec2 sc = vec2(p.x, p.y) * uScale * persp;
  sc.x /= uAspect;
  sc += uCenterNdc;

  gl_Position = vec4(sc, 0.0, 1.0);
  gl_PointSize = (0.7 + 1.9 * persp) * uDpr;
}
`

const FRAG_DOTS = `
precision mediump float;
varying float vDepth;
varying float vEquator;
varying float vRand;
varying float vIntro;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c);
  if (d > 0.25) discard;
  float soft = smoothstep(0.25, 0.015, d);

  /* La cara oculta se apaga con fuerza. Sin esta diferencia la
     esfera se lee como un disco de ruido en vez de un volumen. */
  float front = smoothstep(-1.0, 0.9, vDepth);
  front *= front;

  vec3 CYAN   = vec3(0.000, 0.710, 0.886);
  vec3 PAPER  = vec3(0.933, 0.949, 0.965);
  vec3 ORANGE = vec3(1.000, 0.639, 0.000);

  vec3 col = mix(CYAN * 0.75, PAPER, vRand * 0.6);
  col = mix(col, ORANGE, vEquator);

  float a = soft * (0.035 + 0.40 * front) * (0.30 + 0.70 * vRand);
  a += vEquator * soft * (0.15 + 0.85 * front) * 0.75;

  gl_FragColor = vec4(col, a * vIntro);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || 'shader')
  }
  return sh
}

function program(gl: WebGLRenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs))
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || 'program')
  }
  return p
}

/** Espiral de Fibonacci: reparto uniforme sin acumular en los polos. */
function sphere(count: number) {
  const pos = new Float32Array(count * 3)
  const rand = new Float32Array(count)
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const th = golden * i
    pos[i * 3] = Math.cos(th) * r
    pos[i * 3 + 1] = y
    pos[i * 3 + 2] = Math.sin(th) * r
    rand[i] = (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1
  }
  return { pos, rand }
}

const COUNT = 7000

export function HeroScene({ className }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  const [failed, setFailed] = React.useState(false)

  const mouse = React.useRef({ tx: 0, ty: 0, x: 0, y: 0 })
  const scroll = React.useRef(0)

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const gl = (canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    }) || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null

    if (!gl) {
      setFailed(true)
      return
    }

    let progBg: WebGLProgram
    let progDots: WebGLProgram
    try {
      progBg = program(gl, VERT_BG, FRAG_BG)
      progDots = program(gl, VERT_DOTS, FRAG_DOTS)
    } catch {
      setFailed(true)
      return
    }

    /* triángulo que cubre la pantalla: más barato que dos, evita
       la costura de la diagonal */
    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const { pos, rand } = sphere(COUNT)
    const bufPos = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, bufPos)
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW)
    const bufRand = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, bufRand)
    gl.bufferData(gl.ARRAY_BUFFER, rand, gl.STATIC_DRAW)

    const aXY = gl.getAttribLocation(progBg, 'aXY')
    const uResBg = gl.getUniformLocation(progBg, 'uRes')
    const uCenterBg = gl.getUniformLocation(progBg, 'uCenter')
    const uTimeBg = gl.getUniformLocation(progBg, 'uTime')
    const uScrollBg = gl.getUniformLocation(progBg, 'uScroll')
    const uQualityBg = gl.getUniformLocation(progBg, 'uQuality')
    const uIntroBg = gl.getUniformLocation(progBg, 'uIntroBg')

    const aPos = gl.getAttribLocation(progDots, 'aPos')
    const aRand = gl.getAttribLocation(progDots, 'aRand')
    const uYaw = gl.getUniformLocation(progDots, 'uYaw')
    const uPitch = gl.getUniformLocation(progDots, 'uPitch')
    const uAspect = gl.getUniformLocation(progDots, 'uAspect')
    const uScale = gl.getUniformLocation(progDots, 'uScale')
    const uCenterNdc = gl.getUniformLocation(progDots, 'uCenterNdc')
    const uDpr = gl.getUniformLocation(progDots, 'uDpr')
    const uIntro = gl.getUniformLocation(progDots, 'uIntro')

    /* Resolución tope 1.5: por encima no se distingue un fondo
       difuso y el coste de relleno se dispara. Baja sola a 1 si
       la máquina no da los cuadros (ver medición más abajo). */
    let dprCap = 1.5
    let dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    let quality = 1
    let w = 0
    let h = 0
    let cx = 0
    let cy = 0

    const layout = () => {
      const aspect = w / h
      /* En vertical el planeta no cabe al lado del texto: se
         centra y baja, y el texto queda encima de su hemisferio. */
      const portrait = aspect < 0.95
      cx = portrait ? 0 : 0.44
      cy = portrait ? -0.52 : -0.04
    }

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = Math.max(1, Math.round(r.width * dpr))
      h = Math.max(1, Math.round(r.height * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, w, h)
      layout()
    }
    resize()

    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE)

    let raf = 0
    let visible = true

    /* Calidad adaptativa: se miden los primeros cuadros reales y,
       si la máquina no llega, se baja resolución y se apaga la
       capa de ruido secundaria. Vale más un hero fluido que uno
       bonito a tirones. */
    let probe = 0
    let acc = 0
    let prev = 0
    let t0 = 0

    const draw = (t: number) => {
      const time = t / 1000
      if (!t0) t0 = t
      /* 2,2 s de ensamblaje; con reduced-motion ya está formado */
      const intro = reduce ? 1 : Math.min(1, (t - t0) / 2200)

      if (!reduce && probe < 45) {
        if (prev) acc += t - prev
        prev = t
        probe++
        if (probe === 45 && acc / 44 > 21) {
          quality = 0
          dprCap = 1
          dpr = Math.min(window.devicePixelRatio || 1, dprCap)
          resize()
        }
      }

      /* suavizado exponencial: el puntero manda un objetivo y la
         escena lo persigue, así el giro nunca da tirones */
      const m = mouse.current
      m.x += (m.tx - m.x) * 0.045
      m.y += (m.ty - m.y) * 0.045
      const s = scroll.current

      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      gl.useProgram(progBg)
      gl.enableVertexAttribArray(aXY)
      gl.vertexAttribPointer(aXY, 2, gl.FLOAT, false, 0, 0)
      gl.uniform2f(uResBg, w, h)
      gl.uniform2f(uCenterBg, (cx * (w / h)) / 2, (cy - s * 0.35) / 2)
      gl.uniform1f(uTimeBg, reduce ? 12 : time)
      gl.uniform1f(uScrollBg, s)
      gl.uniform1f(uQualityBg, quality)
      /* la línea tarda un poco más que los puntos: primero el
         planeta, después el ecuador */
      gl.uniform1f(uIntroBg, Math.max(0, (intro - 0.45) / 0.55))
      gl.disable(gl.BLEND)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      gl.enable(gl.BLEND)

      gl.useProgram(progDots)
      gl.bindBuffer(gl.ARRAY_BUFFER, bufPos)
      gl.enableVertexAttribArray(aPos)
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, bufRand)
      gl.enableVertexAttribArray(aRand)
      gl.vertexAttribPointer(aRand, 1, gl.FLOAT, false, 0, 0)

      gl.uniform1f(uYaw, (reduce ? 0.6 : time * 0.05) + m.x * 0.45)
      /* casi de canto: así el ecuador se lee como una línea recta
         y empalma con la que cruza la pantalla */
      gl.uniform1f(uPitch, -0.1 + m.y * 0.2 + s * 0.3)
      gl.uniform1f(uAspect, w / h)
      gl.uniform1f(uScale, 0.66 * (1 - s * 0.22))
      gl.uniform2f(uCenterNdc, cx, cy - s * 0.7)
      gl.uniform1f(uDpr, dpr)
      gl.uniform1f(uIntro, intro)
      gl.drawArrays(gl.POINTS, 0, COUNT)

      if (reduce) return
      raf = requestAnimationFrame(draw)
    }

    const startLoop = () => {
      if (raf || !visible || reduce) return
      raf = requestAnimationFrame(draw)
    }
    const stopLoop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    if (reduce) requestAnimationFrame(draw)
    else startLoop()

    /* Fuera de pantalla no se dibuja. Es la diferencia entre
       gastar la GPU toda la visita o solo mientras se ve. */
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible) startLoop()
        else stopLoop()
      },
      { threshold: 0 }
    )
    io.observe(canvas)

    const onPointer = (e: PointerEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.ty = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onScroll = () => {
      scroll.current = Math.min(1, window.scrollY / Math.max(1, window.innerHeight))
    }
    const onResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, dprCap)
      resize()
    }

    if (!reduce) window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      io.disconnect()
      stopLoop()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [reduce])

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {failed ? (
        /* Sin WebGL el hero no se queda negro: el mismo cuadro,
           resuelto con degradados y sin filtros. */
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(38% 52% at 72% 48%, hsl(var(--abyss) / 0.95), transparent 72%),
              radial-gradient(22% 30% at 72% 48%, hsl(var(--deep) / 0.5), transparent 74%),
              linear-gradient(0deg, transparent 46%, hsl(var(--orange) / 0.5) 48%, transparent 50%),
              hsl(var(--ink))`,
          }}
        />
      ) : (
        <canvas ref={ref} className="h-full w-full" />
      )}
    </div>
  )
}
