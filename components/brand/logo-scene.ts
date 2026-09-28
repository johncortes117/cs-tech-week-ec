import {
  NeutralToneMapping,
  Box3,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Shape,
  ShapeUtils,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  BufferGeometry,
  Float32BufferAttribute,
} from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js'
import { MARK } from './logo-paths'

/* ============================================================
   THE LOGO IN THREE DIMENSIONS

   Every piece is extruded from the logo's own SVG paths — no
   model file, nothing redrawn. The flat logo already implies
   depth: the ribbon passes in front of the bulb and its back
   shows behind it. Here that is made literal. The glass sits in
   the middle plane, the back of the ribbon behind it, and the
   front of the ribbon is bent into an arc so it really wraps
   round the bulb — which only becomes visible once the logo
   turns.

   Behaviour:
   · intro   the pieces fly in from an exploded view and lock
   · pointer the logo turns to face the cursor, and the key
             light follows it so the highlights slide
   · hover   the layers pull apart, showing how it is built
   · scroll  it turns away and rises as the hero leaves
   · touch   no cursor, so it sways on its own

   The loop only runs while the canvas is on screen and the tab
   is visible. Loaded on demand (see logo-3d.tsx), so three.js
   never weighs on the first paint.
   ============================================================ */

/** Centre of the mark in SVG units (viewBox 0 0 776 856). */
const CENTER = { x: 388, y: 428 }
const UNIT = 1 / 360

/* The ribbon runs from its tail (42, 567) to its arrow (745, 204).
   Bending happens along that axis, around the point where it
   crosses the bulb. */
const AXIS = { cx: 393, cy: 385, dx: 0.8885, dy: -0.4588, span: 430 }
/** How far forward the middle of the ribbon comes, in SVG units. */
const BULGE = 84

/* Normals are smoothed between faces that meet at less than this
   angle: the bevel's steps (30° each) read as one rounded edge,
   while the real corners of the logo — the arrow tip, the ends of
   the strokes — stay crisp. Without it every facet catches the
   light on its own and the edges flicker as the logo turns. */
const CREASE = Math.PI / 4.5

/* Longest triangle edge (SVG units) allowed on a surface that gets
   bent. The triangulator covers the ribbon's face with long slivers
   that run its whole length; bent as they are, each one stays flat
   and the ribbon reads as a row of facets. */
const MAX_EDGE = 22

/**
 * Splits every edge longer than `max` at its midpoint until none is
 * left. The decision belongs to the edge, not the triangle — both
 * triangles that share an edge split it at the same point — so the
 * mesh stays watertight once it is bent. Only positions are kept:
 * normals are rebuilt afterwards.
 */
function refine(source: BufferGeometry, max: number) {
  const input = source.index ? source.toNonIndexed() : source
  let tris = Array.from(input.attributes.position.array as ArrayLike<number>)
  const max2 = max * max

  for (let pass = 0; pass < 10; pass++) {
    const out: number[] = []
    let split = false
    for (let i = 0; i < tris.length; i += 9) {
      const a = [tris[i], tris[i + 1], tris[i + 2]]
      const b = [tris[i + 3], tris[i + 4], tris[i + 5]]
      const c = [tris[i + 6], tris[i + 7], tris[i + 8]]
      const long = (p: number[], q: number[]) =>
        (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2 > max2
      const mid = (p: number[], q: number[]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2]
      const ab = long(a, b)
      const bc = long(b, c)
      const ca = long(c, a)
      const push = (...ps: number[][]) => ps.forEach((p) => out.push(p[0], p[1], p[2]))

      if (!ab && !bc && !ca) {
        push(a, b, c)
        continue
      }
      split = true
      const mab = mid(a, b)
      const mbc = mid(b, c)
      const mca = mid(c, a)
      /* winding a → b → c is kept in every piece */
      if (ab && bc && ca) push(a, mab, mca, mab, b, mbc, mca, mbc, c, mab, mbc, mca)
      else if (ab && bc) push(mab, b, mbc, a, mab, mbc, a, mbc, c)
      else if (bc && ca) push(mbc, c, mca, a, b, mbc, a, mbc, mca)
      else if (ca && ab) push(a, mab, mca, mab, b, c, mab, c, mca)
      else if (ab) push(a, mab, c, mab, b, c)
      else if (bc) push(a, b, mbc, a, mbc, c)
      else push(a, b, mca, mca, b, c)
    }
    tris = out
    if (!split) break
  }

  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(tris, 3))
  return g
}

const COLORS = {
  cyan: '#00AEEF',
  warm: '#FAA41A',
  porcelain: '#EDF2F7',
  ribbonBack: '#2F6F97',
  letters: '#F7FAFC',
}

type Pose = { x?: number; y?: number; z?: number; rx?: number; ry?: number; rz?: number; s?: number }

type Piece = {
  pivot: Group
  home: Vector3
  from: Pose
  delay: number
  duration: number
  /** Extra z (SVG units) when the layers pull apart on hover. */
  spread: number
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t))
/** Slower to settle than expo, so the assembly is actually seen. */
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

export function createLogoScene(mount: HTMLElement, { onReady }: { onReady: () => void }) {
  /* ---------- renderer ---------- */
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  const coarse = window.matchMedia('(pointer: coarse)').matches
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.75 : 2))
  renderer.outputColorSpace = SRGBColorSpace
  /* Neutral, not ACES: ACES desaturates the brights and turns the
     logo's cyan into a pastel blue. Neutral keeps the brand hex. */
  renderer.toneMapping = NeutralToneMapping
  renderer.toneMappingExposure = 1
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  mount.appendChild(renderer.domElement)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  /* The room is kept for soft reflections only: at full strength its
     bright panels mirror across the surfaces as white glare. */
  scene.environmentIntensity = 0.32

  const sky = new HemisphereLight('#ffffff', '#0b1a2e', 1.25)
  const key = new DirectionalLight('#ffffff', 1.35)
  key.position.set(-2.5, 3, 4)
  const rim = new DirectionalLight('#9fe2ff', 0.45)
  rim.position.set(3, -2, -3)
  scene.add(sky, key, rim)

  const camera = new PerspectiveCamera(26, 1, 0.1, 100)

  /* ---------- materials ----------
     Satin, not gloss: a clear coat mirrors the environment at grazing
     angles and washes the brand colours out to white. A single rough
     layer keeps the cyan cyan and the orange orange from every side. */
  const satin = (hex: string, roughness: number) =>
    new MeshStandardMaterial({ color: new Color(hex), roughness, metalness: 0 })
  const mats = {
    cyan: satin(COLORS.cyan, 0.48),
    warm: satin(COLORS.warm, 0.5),
    porcelain: satin(COLORS.porcelain, 0.58),
    back: satin(COLORS.ribbonBack, 0.55),
    letters: satin(COLORS.letters, 0.52),
  }

  /* ---------- geometry from the SVG paths ---------- */
  const loader = new SVGLoader()
  const geometries: BufferGeometry[] = []

  const shapesOf = (d: string) =>
    loader
      .parse(`<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}"/></svg>`)
      .paths.flatMap((p) => SVGLoader.createShapes(p))

  /* Pushes vertices forward along the ribbon's axis — a parabola
     that peaks where the ribbon crosses the bulb. Normals are rebuilt
     afterwards from the bent surface. */
  const bend = (g: BufferGeometry) => {
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const t = ((pos.getX(i) - AXIS.cx) * AXIS.dx + (pos.getY(i) - AXIS.cy) * AXIS.dy) / AXIS.span
      pos.setZ(i, pos.getZ(i) + BULGE * (1 - t * t))
    }
    pos.needsUpdate = true
  }

  const extrude = (shapes: Shape[], depth: number, bevel: number, bent = false) => {
    let g: BufferGeometry = new ExtrudeGeometry(shapes, {
      depth,
      bevelEnabled: bevel > 0,
      bevelThickness: bevel,
      bevelSize: bevel * 0.6,
      bevelSegments: 3,
      curveSegments: 10,
    })
    g.translate(0, 0, -depth / 2)
    if (bent) {
      const flat = g
      g = refine(flat, MAX_EDGE)
      flat.dispose()
      bend(g)
    }
    const smooth = toCreasedNormals(g, CREASE)
    smooth.computeBoundingBox()
    smooth.computeBoundingSphere()
    geometries.push(smooth)
    return smooth
  }

  /* The ribbon's lettering is cut out of it as holes. They are
     extruded again on their own, in white and a little proud of
     the surface, so the name reads as raised type. If the parser
     returned the letters as separate shapes instead of holes, the
     largest shape is the ribbon and the rest are letters. */
  const ribbonShapes = shapesOf(MARK.ribbon)
  const area = (s: Shape) => Math.abs(ShapeUtils.area(s.getPoints(4)))
  ribbonShapes.sort((a, b) => area(b) - area(a))
  const [ribbonShape, ...loose] = ribbonShapes
  ribbonShape.holes.push(...loose)
  const letterShapes = ribbonShape.holes.map((h) => new Shape(h.getPoints(10)))

  /** Wraps meshes in a group whose origin is their own centre, so they turn and scale in place. */
  const pivot = (meshes: Mesh[], z: number) => {
    const box = new Box3()
    meshes.forEach((m) => {
      m.geometry.computeBoundingBox()
      box.union(m.geometry.boundingBox!)
    })
    const c = box.getCenter(new Vector3())
    const g = new Group()
    meshes.forEach((m) => {
      m.position.set(-c.x, -c.y, m.userData.lift ?? 0)
      g.add(m)
    })
    g.position.set(c.x, c.y, z)
    return g
  }

  /* In the flat logo the orange strokes overlap the cyan ones. In 3D
     the piece underneath is made thinner and the one on top is lifted
     a little, so the lower piece's walls stay hidden inside the upper
     one's bevel from any angle instead of showing as a cyan seam. */
  const mesh = (d: string, material: MeshStandardMaterial, depth = 24, bevel = 4, lift = 0) => {
    const m = new Mesh(extrude(shapesOf(d), depth, bevel), material)
    m.userData.lift = lift
    return m
  }

  /* ---------- the pieces ---------- */
  const glass = pivot(
    [
      mesh(MARK.arcOuter, mats.cyan, 20),
      mesh(MARK.arcWarm, mats.warm, 24, 4, 3),
      mesh(MARK.arcInner, mats.porcelain),
      /* in the neck it is the other way round: the SVG paints the cyan
         part over the orange one */
      mesh(MARK.neckWarm, mats.warm, 18, 3),
      mesh(MARK.neckCool, mats.cyan, 24, 4, 3),
    ],
    0
  )

  const back = pivot(
    [
      mesh(MARK.ribbonBackLeft, mats.back, 18),
      mesh(MARK.ribbonBackRight, mats.back, 16),
      mesh(MARK.ribbonBackRightLight, mats.cyan, 20, 4, 3),
    ],
    -70
  )

  const threads = MARK.base.map((d) => pivot([mesh(d, mats.porcelain)], 0))
  const cap = pivot([mesh(MARK.cap, mats.porcelain)], 0)

  const ribbonGeo = extrude([ribbonShape], 18, 4, true)
  const lettersGeo = extrude(letterShapes, 32, 0, true)
  const front = pivot([new Mesh(ribbonGeo, mats.cyan), new Mesh(lettersGeo, mats.letters)], 30)

  const pieces: Piece[] = [
    { pivot: glass, from: { s: 0.001, rz: -0.7 }, delay: 0.05, duration: 1.8, spread: 0 },
    { pivot: back, from: { z: -520, s: 0.001 }, delay: 0.35, duration: 1.7, spread: -120 },
    ...threads.map((t, i) => ({
      pivot: t,
      from: { x: -260, s: 0.001 },
      delay: 0.55 + i * 0.1,
      duration: 1.3,
      spread: 36 * (i + 1),
    })),
    { pivot: cap, from: { y: 120, s: 0.001 }, delay: 0.9, duration: 1.2, spread: 140 },
    { pivot: front, from: { z: 620, x: 180, ry: -1.4, s: 0.001 }, delay: 0.75, duration: 1.9, spread: 150 },
  ].map((p) => ({ ...p, home: p.pivot.position.clone() }))

  /* SVG space: y points down and the unit is the logo's pixel. The
     negative y scale flips it up; three.js corrects the face winding
     for mirrored objects on its own. */
  const logo = new Group()
  pieces.forEach((p) => logo.add(p.pivot))
  logo.scale.set(UNIT, -UNIT, UNIT)
  logo.position.set(-CENTER.x * UNIT, CENTER.y * UNIT, 0)

  const root = new Group()
  root.add(logo)
  scene.add(root)

  /* ---------- framing ---------- */
  const OBJECT = { w: 776 * UNIT, h: 856 * UNIT }
  /** Share of the canvas the logo takes; the rest is room to turn and spread. */
  const FILL = 0.62

  const resize = () => {
    const w = mount.clientWidth
    const h = mount.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    const tan = Math.tan((camera.fov * Math.PI) / 360)
    camera.position.set(0, 0, Math.max(OBJECT.h / (FILL * 2 * tan), OBJECT.w / (FILL * 2 * tan * camera.aspect)))
    camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(mount)

  /* ---------- input ---------- */
  const fine = window.matchMedia('(pointer: fine)').matches
  const input = { px: 0, py: 0, active: false, hover: false, scroll: 0 }

  const onPointer = (e: PointerEvent) => {
    const r = mount.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    input.px = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)))
    input.py = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)))
    input.active = true
    /* "over the logo" = within the part of the canvas it occupies */
    const reach = Math.min(r.width, r.height) * FILL * 0.55
    input.hover = Math.hypot(e.clientX - cx, e.clientY - cy) < reach
  }
  const onLeave = () => {
    input.hover = false
  }
  const onScroll = () => {
    input.scroll = Math.min(1.2, window.scrollY / Math.max(1, window.innerHeight))
  }
  if (fine) {
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  /* ---------- loop ---------- */
  const motion = { ry: 0, rx: 0, spread: 0 }
  let raf = 0
  let started = -1
  let last = 0
  let visible = true
  let readySent = false

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    if (started < 0) {
      started = now
      last = now
    }
    const t = (now - started) / 1000
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now

    /* intro, then hover spread */
    const smooth = 1 - Math.exp(-dt * 5)
    motion.spread += ((input.hover ? 1 : 0) - motion.spread) * smooth
    for (const p of pieces) {
      const e = easeOutQuart(clamp01((t - p.delay) / p.duration))
      const f = p.from
      const back = 1 - e
      p.pivot.position.set(
        p.home.x + (f.x ?? 0) * back,
        p.home.y + (f.y ?? 0) * back,
        p.home.z + (f.z ?? 0) * back + p.spread * motion.spread * e
      )
      p.pivot.rotation.set((f.rx ?? 0) * back, (f.ry ?? 0) * back, (f.rz ?? 0) * back)
      const s = (f.s ?? 1) + (1 - (f.s ?? 1)) * e
      p.pivot.scale.setScalar(s)
    }

    /* facing: the cursor on desktop, a slow sway on touch */
    const follow = fine && input.active
    const targetY = follow ? input.px * 0.55 : Math.sin(t * 0.45) * 0.38
    const targetX = follow ? input.py * 0.3 : Math.sin(t * 0.3) * 0.08
    const ease = 1 - Math.exp(-dt * 3.2)
    motion.ry += (targetY - motion.ry) * ease
    motion.rx += (targetX - motion.rx) * ease

    const intro = 1 - easeOutExpo(clamp01(t / 2.8))
    root.rotation.y = motion.ry - 0.8 * intro + input.scroll * 1.3
    root.rotation.x = motion.rx + input.scroll * 0.25
    root.position.y = Math.sin(t * 0.9) * 0.035 + input.scroll * 0.7

    /* the key light trails the cursor, so the highlights move */
    key.position.x = -2.5 + motion.ry * 2.5
    key.position.y = 3 - motion.rx * 2

    renderer.render(scene, camera)
    if (!readySent) {
      readySent = true
      onReady()
    }
  }

  const play = () => {
    if (!raf && visible && document.visibilityState === 'visible') {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }
  const pause = () => {
    cancelAnimationFrame(raf)
    raf = 0
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) play()
    else pause()
  })
  io.observe(mount)
  const onVisibility = () => (document.visibilityState === 'visible' ? play() : pause())
  document.addEventListener('visibilitychange', onVisibility)
  play()

  /* ---------- teardown ---------- */
  return () => {
    pause()
    io.disconnect()
    ro.disconnect()
    window.removeEventListener('pointermove', onPointer)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('visibilitychange', onVisibility)
    geometries.forEach((g) => g.dispose())
    Object.values(mats).forEach((m) => m.dispose())
    environment.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
