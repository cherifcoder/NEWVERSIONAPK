/* ------------------------------------------------------------------
   generate-icons.mjs — source d'icônes & splash pour @capacitor/assets
   Rasterise public/logo.svg en PNG (icon-only, adaptive fg/bg, splash)
   puis `npx capacitor-assets generate --android` distribue les tailles.
------------------------------------------------------------------- */
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const outDir = path.join(root, 'assets')
await mkdir(outDir, { recursive: true })

const logoSvg = await readFile(path.join(root, 'public', 'logo.svg'))

const DARK = '#05060a'
const BG = '#04050a'

const renderLogo = (size) =>
  sharp(logoSvg, { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

const solid = (w, h, background) =>
  sharp({ create: { width: w, height: h, channels: 4, background } }).png().toBuffer()

const flatten = async (bg, logoSize, out, size) => {
  const logo = await renderLogo(logoSize)
  const base = await solid(size, size, bg)
  await sharp(base)
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toFile(path.join(outDir, out))
}

const splash = async (out) => {
  const size = 2732
  const logo = await renderLogo(720)
  const base = await solid(size, size, DARK)
  await sharp(base)
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toFile(path.join(outDir, out))
}

// Icône « legacy » (fond sombre, logo large) — 1024x1024
await flatten(BG, 1024, 'icon-only.png', 1024)
await flatten(BG, 1024, 'icon.png', 1024)
// Icône adaptative : fond uni + foreground transparent (zone sûre 66 %)
await solid(1024, 1024, BG).then((buf) =>
  sharp(buf).png().toFile(path.join(outDir, 'icon-background.png')),
)
await sharp(await solid(1024, 1024, { r: 0, g: 0, b: 0, alpha: 0 }))
  .composite([{ input: await renderLogo(600), gravity: 'centre' }])
  .png()
  .toFile(path.join(outDir, 'icon-foreground.png'))

await splash('splash.png')
await splash('splash-dark.png')

console.log('✓ assets/ générés (icon-only, icon, icon-foreground, icon-background, splash)')
