/**
 * Generates PWA icons from SVG using sharp.
 * Run once: npm run gen-icons
 * Output: public/icons/icon-192.png, public/icons/icon-512.png, public/apple-touch-icon.png
 */
import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
mkdirSync(join(root, 'public', 'icons'), { recursive: true })

function makeSvg(size) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.36
  const sw = size * 0.09
  const rr = size * 0.22  // corner radius
  // arc end point for 75% fill (starting at top, going clockwise)
  const angle = -Math.PI / 2 + Math.PI * 2 * 0.75
  const x1 = cx + r * Math.cos(-Math.PI / 2)
  const y1 = cy + r * Math.sin(-Math.PI / 2)
  const x2 = cx + r * Math.cos(angle)
  const y2 = cy + r * Math.sin(angle)
  const fontSize = Math.round(size * 0.28)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rr}" ry="${rr}" fill="#0d0d0d"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#2e2e2e" stroke-width="${sw}"/>
  <path d="M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}"
    fill="none" stroke="#3dd68c" stroke-width="${sw}" stroke-linecap="round"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
    font-family="-apple-system, system-ui, sans-serif" font-size="${fontSize}" font-weight="700" fill="#f0f0f0">G</text>
</svg>`
}

const targets = [
  { name: 'icons/icon-192.png', size: 192 },
  { name: 'icons/icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

for (const { name, size } of targets) {
  const svg = Buffer.from(makeSvg(size))
  const png = await sharp(svg).png().toBuffer()
  const outPath = join(root, 'public', name)
  writeFileSync(outPath, png)
  console.log(`✓ ${outPath} (${size}×${size})`)
}
