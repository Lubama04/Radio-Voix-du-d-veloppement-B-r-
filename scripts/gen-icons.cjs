const sharp = require('sharp')
const path = require('path')

const root = path.join(__dirname, '..')
const src = path.join(root, 'public', 'logo.png')

async function main() {
  await sharp(src).resize(192, 192).png({ quality: 90 }).toFile(path.join(root, 'public', 'icon-192.png'))
  await sharp(src).resize(512, 512).png({ quality: 90 }).toFile(path.join(root, 'public', 'icon-512.png'))
  await sharp(src).resize(48, 48).png({ quality: 90 }).toFile(path.join(root, 'public', 'favicon.png'))
  await sharp(src).resize(180, 180).png({ quality: 90 }).toFile(path.join(root, 'public', 'apple-touch-icon.png'))
  await sharp(src).resize(512, 512).png({ quality: 85, compressionLevel: 9 }).toFile(path.join(root, 'public', 'logo-optimized.png'))
  console.log('done')
}
main().catch(e => { console.error(e); process.exit(1) })
