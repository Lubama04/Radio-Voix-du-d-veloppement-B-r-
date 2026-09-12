const sharp = require('sharp')
const pngToIco = require('png-to-ico').default
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const src = path.join(root, 'public', 'logo.png')

async function main() {
  await sharp(src).resize(192, 192).png({ quality: 90 }).toFile(path.join(root, 'public', 'icon-192.png'))
  await sharp(src).resize(512, 512).png({ quality: 90 }).toFile(path.join(root, 'public', 'icon-512.png'))
  await sharp(src).resize(48, 48).png({ quality: 90 }).toFile(path.join(root, 'public', 'favicon.png'))
  await sharp(src).resize(32, 32).png({ quality: 90 }).toFile(path.join(root, 'public', 'favicon-32.png'))
  await sharp(src).resize(180, 180).png({ quality: 90 }).toFile(path.join(root, 'public', 'apple-touch-icon.png'))
  await sharp(src).resize(512, 512).png({ quality: 85, compressionLevel: 9 }).toFile(path.join(root, 'public', 'logo-optimized.png'))

  // favicon.ico multi-résolution (16/32/48) — sharp ne sait pas écrire de .ico
  const sizes = [16, 32, 48]
  const buffers = await Promise.all(
    sizes.map(s => sharp(src).resize(s, s).png().toBuffer())
  )
  const icoBuffer = await pngToIco(buffers)
  fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), icoBuffer)

  console.log('done')
}
main().catch(e => { console.error(e); process.exit(1) })
