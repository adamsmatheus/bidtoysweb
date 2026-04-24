import { readFileSync, writeFileSync } from 'fs'

// Parse PNG manually — remove near-white/beige background pixels → transparent
const buf = readFileSync('public/palavra.png')

// PNG signature
const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
if (!buf.slice(0, 8).equals(PNG_SIG)) throw new Error('Not a PNG')

// Find IHDR to get dimensions
const width  = buf.readUInt32BE(16)
const height = buf.readUInt32BE(20)
const bitDepth    = buf[24]
const colorType   = buf[25]

console.log(`${width}x${height} bit:${bitDepth} colorType:${colorType}`)

if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
  throw new Error(`Unsupported PNG format (bit:${bitDepth} colorType:${colorType}). Need 8-bit RGB or RGBA.`)
}

// We need to decompress IDAT chunks — use Node zlib
import { inflateSync } from 'zlib'

// Collect all IDAT chunks
let idatData = Buffer.alloc(0)
let pos = 8
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos)
  const type = buf.slice(pos + 4, pos + 8).toString('ascii')
  const data = buf.slice(pos + 8, pos + 8 + len)
  if (type === 'IDAT') idatData = Buffer.concat([idatData, data])
  pos += 12 + len
  if (type === 'IEND') break
}

const raw = inflateSync(idatData)
const channels = colorType === 6 ? 4 : 3
const stride = 1 + width * channels // filter byte + row pixels

// Decode with filter
const pixels = Buffer.alloc(width * height * 4) // always RGBA output

function paethPredictor(a, b, c) {
  const p = a + b - c
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c
}

const recon = Buffer.alloc(height * width * channels)
for (let y = 0; y < height; y++) {
  const filterType = raw[y * stride]
  const rowIn  = raw.slice(y * stride + 1, y * stride + 1 + width * channels)
  const rowOut = recon.slice(y * width * channels, (y + 1) * width * channels)
  const prev   = y > 0 ? recon.slice((y - 1) * width * channels, y * width * channels) : Buffer.alloc(width * channels)

  for (let x = 0; x < width * channels; x++) {
    const a = x >= channels ? rowOut[x - channels] : 0
    const b = prev[x]
    const c = x >= channels ? prev[x - channels] : 0
    let val = rowIn[x]
    if      (filterType === 0) val = rowIn[x]
    else if (filterType === 1) val = (rowIn[x] + a) & 0xff
    else if (filterType === 2) val = (rowIn[x] + b) & 0xff
    else if (filterType === 3) val = (rowIn[x] + ((a + b) >> 1)) & 0xff
    else if (filterType === 4) val = (rowIn[x] + paethPredictor(a, b, c)) & 0xff
    rowOut[x] = val
  }

  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4
    const r = recon[y * width * channels + x * channels + 0]
    const g = recon[y * width * channels + x * channels + 1]
    const b2 = recon[y * width * channels + x * channels + 2]
    const a2 = channels === 4 ? recon[y * width * channels + x * channels + 3] : 255

    // Treat near-white/beige as transparent (threshold)
    // Beige is roughly R>200, G>190, B>170 and relatively low saturation
    const isBackground =
      r > 195 && g > 185 && b2 > 165 &&
      Math.max(r, g, b2) - Math.min(r, g, b2) < 50

    pixels[i + 0] = r
    pixels[i + 1] = g
    pixels[i + 2] = b2
    pixels[i + 3] = isBackground ? 0 : a2
  }
}

// Re-encode as RGBA PNG
import { deflateSync } from 'zlib'

function crc32(buf) {
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[i] = c
    }
    return t
  })())
  let c = 0xffffffff
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type)
  const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length)
  const crcInput = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf])
}

// IHDR
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4)
ihdr[8] = 8; ihdr[9] = 6 // 8-bit RGBA

// Raw rows with filter 0
const outStride = 1 + width * 4
const outRaw = Buffer.alloc(height * outStride)
for (let y = 0; y < height; y++) {
  outRaw[y * outStride] = 0 // filter None
  pixels.copy(outRaw, y * outStride + 1, y * width * 4, (y + 1) * width * 4)
}

const compressed = deflateSync(outRaw, { level: 9 })

const out = Buffer.concat([
  PNG_SIG,
  chunk('IHDR', ihdr),
  chunk('IDAT', compressed),
  chunk('IEND', Buffer.alloc(0)),
])

writeFileSync('public/palavra.png', out)
console.log('Done — background removed, saved as RGBA PNG')
