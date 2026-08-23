'use client'

import * as React from 'react'
import { useReducedMotion } from '@/lib/use-reduced-motion'
import { cn } from '@/lib/utils'

/* ============================================================
   HERO BACKDROP — WebGL

   A nebula that breathes, a halo behind the logo, and the orange
   equator line crossing the whole screen. It is the same
   equatorial rule that separates every section of the site.

   One program, one draw call: a full-screen triangle with fbm
   noise. All five colours come from the brand guide.

   Why a shader and not DOM layers: measured on the production
   build, doing this with `filter: blur` cost 2.3× in frames,
   because each blurred layer forces an enormous surface to be
   rasterised every frame. The shader does it in a single pass at
   capped resolution.
   ============================================================ */

const VERT = `
attribute vec2 aXY;
void main() { gl_Position = vec4(aXY, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform vec2  uRes;
uniform vec2  uCenter;   /* focus of the halo, in p space */
uniform float uTime;
uniform float uScroll;
uniform float uQuality;  /* 1 = full, 0 = cheap version */
uniform float uIntro;    /* the equator line is born with the page */

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

  float r = length(p - uCenter);
  float n = fbm(p * 1.9 + vec2(uTime * 0.018, uTime * 0.011));

  /* The page is black. The light is born behind the logo and dies
     fast: without this the background washes out. */
  vec3 col = INK;
  col += ABYSS * 1.05 * exp(-r * 1.9) * (0.55 + 0.55 * n);
  col += DEEP  * 0.32 * exp(-r * 3.1);

  if (uQuality > 0.5) {
    float n2 = fbm(p * 3.4 - vec2(uTime * 0.013, uTime * 0.019));
    col += CYAN * pow(n2, 4.0) * 0.13 * exp(-r * 1.2);
  }

  /* The equator line: a crisp edge plus a wide ember underneath. */
  float equator = p.y - uCenter.y;
  col += ORANGE * exp(-abs(equator) * 150.0) * 0.5 * uIntro;
  col += ORANGE * exp(-abs(equator) * 13.0) * 0.075 * (0.6 + 0.4 * n) * uIntro;

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

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(sh) || 'shader')
  }
  return sh
}

export function HeroBackdrop({ className }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  const [failed, setFailed] = React.useState(false)
  const scroll = React.useRef(0)

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    }) as WebGLRenderingContext | null

    if (!gl) {
      setFailed(true)
      return
    }

    let program: WebGLProgram
    try {
      program = gl.createProgram()!
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT))
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link')
    } catch {
      setFailed(true)
      return
    }

    /* A triangle that covers the screen: cheaper than two, and it
       avoids the seam along the diagonal. */
    const quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const aXY = gl.getAttribLocation(program, 'aXY')
    const uRes = gl.getUniformLocation(program, 'uRes')
    const uCenter = gl.getUniformLocation(program, 'uCenter')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uScroll = gl.getUniformLocation(program, 'uScroll')
    const uQuality = gl.getUniformLocation(program, 'uQuality')
    const uIntro = gl.getUniformLocation(program, 'uIntro')

    /* Resolution capped at 1.5: above that a diffuse background is
       indistinguishable and the fill cost explodes. Drops to 1 on
       its own if the machine cannot keep up. */
    let dprCap = 1.5
    let dpr = Math.min(window.devicePixelRatio || 1, dprCap)
    let quality = 1
    let w = 0
    let h = 0
    let cx = 0
    let cy = 0

    const layout = () => {
      const portrait = w / h < 0.95
      cx = portrait ? 0 : 0.44
      cy = portrait ? -0.4 : -0.04
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
    gl.disable(gl.BLEND)

    let raf = 0
    let visible = true
    let probe = 0
    let acc = 0
    let prev = 0
    let t0 = 0

    const draw = (t: number) => {
      if (!t0) t0 = t

      /* Adaptive quality: the first real frames are measured and,
         if the machine falls short, resolution drops and the
         secondary noise layer is switched off. */
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

      const s = scroll.current
      gl.bindBuffer(gl.ARRAY_BUFFER, quad)
      gl.useProgram(program)
      gl.enableVertexAttribArray(aXY)
      gl.vertexAttribPointer(aXY, 2, gl.FLOAT, false, 0, 0)
      gl.uniform2f(uRes, w, h)
      gl.uniform2f(uCenter, (cx * (w / h)) / 2, (cy - s * 0.35) / 2)
      gl.uniform1f(uTime, reduce ? 12 : t / 1000)
      gl.uniform1f(uScroll, s)
      gl.uniform1f(uQuality, quality)
      gl.uniform1f(uIntro, reduce ? 1 : Math.min(1, (t - t0) / 1400))
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (reduce) return
      raf = requestAnimationFrame(draw)
    }

    const start = () => {
      if (raf || !visible || reduce) return
      raf = requestAnimationFrame(draw)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    if (reduce) requestAnimationFrame(draw)
    else start()

    /* Offscreen means nothing is drawn. It is the difference
       between burning GPU for the whole visit and only while it
       is visible. */
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible) start()
        else stop()
      },
      { threshold: 0 }
    )
    io.observe(canvas)

    const onScroll = () => {
      scroll.current = Math.min(1, window.scrollY / Math.max(1, window.innerHeight))
    }
    const onResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, dprCap)
      resize()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      io.disconnect()
      stop()
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
