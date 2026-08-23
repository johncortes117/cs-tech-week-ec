'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   HERO SCENE — WebGL

   A planet of seven thousand points with its equator lit, and a
   line of orange light that crosses it and carries on from one
   side of the screen to the other. It is the same equatorial
   rule that separates every section of the site, but here you
   see where it comes from: a planet, at exactly latitude zero.

   It replaces the whole previous atmosphere (Spotlight cones,
   blurred gradients, grid and binary field). Not by taste:
   measured on the production build, the `filter: blur` layers
   cost 2.3× in frames and the cones another 1.8×, because each
   one forces enormous surfaces to be rasterised every frame. A
   shader does all of that in a single pass.

   Two programs, two draw calls:

   1. BACKGROUND — a full-screen triangle. Nebula built from fbm
      noise, halo around the planet and the equator line. All
      five colours come from the brand guide.

   2. PLANET — points spread by Fibonacci spiral over a unit
      sphere. It spins on its own, tilts with the cursor and
      sinks with the scroll. The points whose latitude is ~0 are
      painted orange: the equator is not drawn on top, it is
      drawn by the planet's own geometry.

   All the 3D is maths in the vertex shader — no three.js, no
   OGL, no dependencies.
   ============================================================ */

const VERT_BG = `
attribute vec2 aXY;
void main() { gl_Position = vec4(aXY, 0.0, 1.0); }
`

const FRAG_BG = `
precision mediump float;
uniform vec2  uRes;
uniform vec2  uCenter;   /* planet centre, in p space */
uniform float uTime;
uniform float uScroll;
uniform float uQuality;  /* 1 = full, 0 = cheap version */
uniform float uIntroBg;  /* the equator line is born with the planet */

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

  /* The page is black. The light is born from the planet and dies
     fast: without this the background washes out and stops being
     IEEE CS. */
  vec3 col = INK;
  col += ABYSS * 1.05 * exp(-r * 1.9) * (0.55 + 0.55 * n);
  col += DEEP  * 0.34 * exp(-r * 3.1);

  if (uQuality > 0.5) {
    float n2 = fbm(p * 3.4 - vec2(uTime * 0.013, uTime * 0.019));
    col += CYAN * pow(n2, 4.0) * 0.13 * exp(-r * 1.2);
  }

  /* The equator line crosses the whole screen at the planet's
     height: the crisp edge plus a wide ember underneath. */
  float ecuador = p.y - uCenter.y;
  col += ORANGE * exp(-abs(ecuador) * 150.0) * 0.55 * uIntroBg;
  col += ORANGE * exp(-abs(ecuador) * 13.0) * 0.085 * (0.6 + 0.4 * n) * uIntroBg;

  /* fades towards the horizontal edges so the line does not hit
     the frame head-on */
  col *= 1.0 - 0.5 * smoothstep(0.55, 1.1, abs(p.x) / max(0.35, uRes.x / uRes.y * 0.5));

  /* vignette and bottom fade towards the next section */
  col *= 1.0 - 0.42 * smoothstep(0.30, 1.0, length(p * vec2(0.72, 1.25)));
  col *= 1.0 - 0.55 * smoothstep(0.30, 0.5, p.y * -1.0) * uScroll;

  /* very fine grain: kills the banding of the dark gradients */
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
uniform float uIntro;   /* 0 = scattered, 1 = planet formed */

varying float vDepth;
varying float vIntro;
varying float vEquator;
varying float vRand;

void main() {
  /* ASSEMBLY. The points come in from outside and fall into place
     on the sphere, each with its own delay. It is the first
     thing you see on opening the page: the planet builds itself. */
  float delay = aRand * 0.4;
  float k = clamp((uIntro - delay) / max(0.0001, 1.0 - delay), 0.0, 1.0);
  k = 1.0 - pow(1.0 - k, 3.0);
  vIntro = k;
  vec3 seed = aPos * mix(3.4, 1.0, k);

  /* spin about the polar axis */
  float cy = cos(uYaw), sy = sin(uYaw);
  vec3 p = vec3(seed.x * cy + seed.z * sy, seed.y, -seed.x * sy + seed.z * cy);

  /* tilt: this is what responds to the cursor */
  float cp = cos(uPitch), sp = sin(uPitch);
  p = vec3(p.x, p.y * cp - p.z * sp, p.y * sp + p.z * cp);

  /* latitude is measured BEFORE rotating: the equator travels
     with the planet, not with the camera */
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

  /* The hidden face is dimmed hard. Without that difference the
     sphere reads as a disc of noise instead of a volume. */
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

/** Fibonacci spiral: even spread without bunching at the poles. */
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

    /* triangle that covers the screen: cheaper than two, and it
       avoids the seam along the diagonal */
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

    /* Resolution capped at 1.5: above that a diffuse background is
       indistinguishable and the fill cost explodes. Drops to 1 on
       its own if the machine cannot keep up (see the measurement
       further down). */
    let dprCap = 1.5
    let dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    let quality = 1
    let w = 0
    let h = 0
    let cx = 0
    let cy = 0

    const layout = () => {
      const aspect = w / h
      /* In portrait the planet does not fit beside the text: it is
         centred and lowered, and the text sits over its hemisphere. */
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

    /* Adaptive quality: the first real frames are measured and, if
       the machine falls short, resolution drops and the secondary
       noise layer is switched off. A fluid hero is worth more than
       a pretty one that stutters. */
    let probe = 0
    let acc = 0
    let prev = 0
    let t0 = 0

    const draw = (t: number) => {
      const time = t / 1000
      if (!t0) t0 = t
      /* 2.2 s of assembly; with reduced-motion it is already formed */
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

      /* exponential smoothing: the pointer sets a target and the
         scene chases it, so the spin never jerks */
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
      /* the line takes slightly longer than the points: first the
         planet, then the equator */
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
      /* almost edge-on: this way the equator reads as a straight
         line and joins the one crossing the screen */
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

    /* Offscreen means nothing is drawn. It is the difference
       between burning GPU for the whole visit and only while it
       is visible. */
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
        /* Without WebGL the hero does not go black: the same frame,
           solved with gradients and no filters. */
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
