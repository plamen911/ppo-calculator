// Rasterizes assets/icon.svg into the app's icon assets:
//   public/favicon.ico   — multi-size (16/32/48), the browser tab favicon
//   public/icon-512.png  — 512 PNG, used as the Electron BrowserWindow icon
//   build/icon.ico       — multi-size (16/32/48/64/128/256), consumed by
//                          electron-builder for the exe / installer / taskbar
//
// Run with `npm run icons`. The generated files are committed so CI / Cloudflare
// builds don't need sharp installed.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = path.join(root, 'assets', 'icon.svg')
const publicDir = path.join(root, 'public')
const buildDir = path.join(root, 'build')

fs.mkdirSync(publicDir, { recursive: true })
fs.mkdirSync(buildDir, { recursive: true })

const svg = fs.readFileSync(svgPath)

// Render the SVG to a square PNG buffer at the given size.
const png = (size) =>
  sharp(svg, { density: 384 }).resize(size, size).png().toBuffer()

const favicon = path.join(publicDir, 'favicon.ico')
const iconPng = path.join(publicDir, 'icon-512.png')
const buildIco = path.join(buildDir, 'icon.ico')

const faviconSizes = [16, 32, 48]
const appIcoSizes = [16, 32, 48, 64, 128, 256]

const [faviconPngs, appIcoPngs, png512] = await Promise.all([
  Promise.all(faviconSizes.map(png)),
  Promise.all(appIcoSizes.map(png)),
  png(512),
])

await Promise.all([
  pngToIco(faviconPngs).then((buf) => fs.writeFileSync(favicon, buf)),
  pngToIco(appIcoPngs).then((buf) => fs.writeFileSync(buildIco, buf)),
  fs.promises.writeFile(iconPng, png512),
])

console.log('Generated:')
console.log('  ' + path.relative(root, favicon))
console.log('  ' + path.relative(root, iconPng))
console.log('  ' + path.relative(root, buildIco))
