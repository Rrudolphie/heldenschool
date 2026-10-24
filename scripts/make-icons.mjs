// Maakt de PNG-icoontjes (nodig voor het beginscherm van de iPad) zonder extra pakketten.
// Gebruik: npm run icons
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const BLAUW = [29, 78, 216]
const ROOD = [225, 29, 42]
const INKT = [17, 24, 39]
const WIT = [255, 255, 255]
const IJZERROOD = [185, 28, 28]
const GOUD = [245, 158, 11]
const LICHT = [103, 232, 249]

// Kleur van één punt in een 200x200-tekening (zelfde ontwerp als public/icon.svg):
// links de spinnenheld, rechts de ijzerheld.
function kleur(x, y, afgerond) {
  if (afgerond) {
    const r = 44
    const cx = Math.min(Math.max(x, r), 200 - r)
    const cy = Math.min(Math.max(y, r), 200 - r)
    if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) return null
  }
  const ex = (x - 100) / 70
  const ey = (y - 108) / 76
  const e = Math.hypot(ex, ey)
  if (e > 1.04) return BLAUW
  if (e > 0.97) return INKT
  if (Math.abs(x - 100) < 1.5) return INKT // scheidingslijn

  if (x > 100) {
    // ijzerheld: oog (schuine strook), gouden masker, rode helm
    const t = (x - 112) / 38
    const midden = 104 - t * 4
    if (t >= 0 && t <= 1 && Math.abs(y - midden) < 4.5) return LICHT
    if (t >= -0.05 && t <= 1.05 && Math.abs(y - midden) < 6.5) return INKT
    const m = Math.hypot((x - 100) / 44, (y - 122) / 50)
    if (m < 0.95) return GOUD
    if (m < 1.04) return INKT
    return IJZERROOD
  }

  // spinnenheld: oog als gedraaide ellips, schuin richting de neus
  {
    const dx = x - 69
    const dy = y - 100
    const u = dx * Math.cos(0.5) + dy * Math.sin(0.5)
    const v = -dx * Math.sin(0.5) + dy * Math.cos(0.5)
    const d = Math.hypot(u / 25, v / 15)
    if (d < 1) return WIT
    if (d < 1.22) return INKT
  }
  // webpatroon
  const wx = x - 100
  const wy = y - 116
  const afstand = Math.hypot(wx, wy)
  for (const r of [24, 48, 72, 96]) if (Math.abs(afstand - r) < 1.1) return mix(ROOD, INKT, 0.55)
  const a = Math.atan2(wy, wx)
  const stap = Math.PI / 6
  const delta = Math.abs(((a + stap / 2) % stap + stap) % stap - stap / 2)
  if (afstand * Math.sin(delta) < 1.1) return mix(ROOD, INKT, 0.55)
  return ROOD
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v * (1 - t) + b[i] * t))

function teken(grootte, afgerond) {
  const ss = 3
  const rij = grootte * 4 + 1
  const data = Buffer.alloc(rij * grootte)
  for (let py = 0; py < grootte; py++) {
    data[py * rij] = 0
    for (let px = 0; px < grootte; px++) {
      let r = 0, g = 0, b = 0, al = 0
      for (let sy = 0; sy < ss; sy++)
        for (let sx = 0; sx < ss; sx++) {
          const k = kleur(((px + (sx + 0.5) / ss) / grootte) * 200, ((py + (sy + 0.5) / ss) / grootte) * 200, afgerond)
          if (k) {
            r += k[0]
            g += k[1]
            b += k[2]
            al++
          }
        }
      const o = py * rij + 1 + px * 4
      data[o] = al ? r / al : 0
      data[o + 1] = al ? g / al : 0
      data[o + 2] = al ? b / al : 0
      data[o + 3] = (al / (ss * ss)) * 255
    }
  }
  return png(grootte, data)
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function blok(type, inhoud) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(inhoud.length)
  const td = Buffer.concat([Buffer.from(type), inhoud])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function png(grootte, data) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(grootte, 0)
  ihdr.writeUInt32BE(grootte, 4)
  ihdr[8] = 8 // bits
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    blok('IHDR', ihdr),
    blok('IDAT', deflateSync(data)),
    blok('IEND', Buffer.alloc(0)),
  ])
}

// iPad rondt zelf af: apple-touch-icon zonder ronde hoeken
writeFileSync('public/apple-touch-icon.png', teken(180, false))
writeFileSync('public/icon-192.png', teken(192, true))
writeFileSync('public/icon-512.png', teken(512, true))
console.log('Icoontjes gemaakt in public/')
