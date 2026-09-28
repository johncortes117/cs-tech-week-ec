/* ============================================================
   IMAGE OPTIMISER

   `images.unoptimized` is on (see next.config.mjs), so whatever
   sits in /public is served byte for byte. Speaker photos arrive
   as multi-megabyte PNGs straight from a phone; this script
   writes a WebP next to each one, sized for how the site
   actually draws it, into a `web/` folder beside the source.

   Run it after adding a photo:   pnpm images
   and point content.ts at the file it prints.

   It borrows the `sharp` that Next already installs, so there is
   no extra dependency to keep in sync. Files that are already up
   to date are skipped.
   ============================================================ */

import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve('next/package.json'))('sharp')

const JOBS = [
  /* Portraits are cropped to 4:5 on screen: the short side is what
     has to survive at 2x, so both sides end up at least 720px. */
  { dir: 'public/speakers', resize: { width: 720, height: 720, fit: 'outside' }, quality: 80 },
  /* White logos on transparency, drawn at most ~260px wide. */
  { dir: 'public/chapters', resize: { width: 640, fit: 'inside' }, quality: 90, only: /^(CS_|IEEE_)/, skip: /^CS_TECH_WEEK/ },
  /* Sponsor logos arrive with margins of every size; trimming them makes
     each logo fill its tile the same way. */
  {
    dir: 'public/sponsors',
    resize: { width: 560, fit: 'inside' },
    quality: 90,
    /* trims whatever surrounds the logo — white or transparent — taken
       from the corner pixel; CSSBattle's yellow block is its logo, kept */
    trim: { threshold: 16 },
    noTrim: /^css_battle/,
  },
  /* the planning document's screenshots are not on the site */
  { dir: 'public/images', resize: { width: 1400, fit: 'inside', withoutEnlargement: true }, quality: 82, skip: /^(pricing-table|instagram-csweekperu)\./ },
]

const SOURCE = /\.(png|jpe?g)$/i

for (const job of JOBS) {
  const out = path.join(job.dir, 'web')
  fs.mkdirSync(out, { recursive: true })

  for (const file of fs.readdirSync(job.dir)) {
    if (!SOURCE.test(file) || (job.only && !job.only.test(file)) || job.skip?.test(file)) continue
    const src = path.join(job.dir, file)
    const dest = path.join(out, file.replace(SOURCE, '.webp'))

    if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs) continue

    let image = sharp(src).rotate() // honour EXIF orientation from phone cameras
    if (job.trim && !job.noTrim?.test(file)) image = image.trim(job.trim)
    await image
      .resize({ withoutEnlargement: true, ...job.resize })
      .webp({ quality: job.quality, alphaQuality: 100, effort: 5 })
      .toFile(dest)

    const before = (fs.statSync(src).size / 1024).toFixed(0)
    const after = (fs.statSync(dest).size / 1024).toFixed(0)
    console.log(`${src} → /${path.relative('public', dest).replaceAll('\\', '/')}  ${before} KB → ${after} KB`)
  }
}
