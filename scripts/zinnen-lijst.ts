// Maakt de lijst met alle zinnen voor het inspreken (scripts/zinnen.json)
// en de wegwijzer voor de app (public/stem/index.json).
// Gebruik: npx tsx scripts/zinnen-lijst.ts
import { mkdirSync, writeFileSync } from 'node:fs'
import { alleZinnen, TELWOORD } from '../src/zinnen'

/** Korte, vaste bestandsnaam per zin (FNV-1a), zodat ongewijzigde zinnen niet opnieuw hoeven. */
function naam(sleutel: string) {
  let h = 0x811c9dc5
  for (const c of sleutel) {
    h ^= c.codePointAt(0)!
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36).padStart(7, '0')
}

/** Getallen voluit schrijven, zodat de stem ze in het Nederlands uitspreekt. */
const uitspraak = (tekst: string) => tekst.replace(/\b(1[0-9]|20|[0-9])\b/g, (g) => TELWOORD[Number(g)])

const zinnen = alleZinnen().map((z) => {
  const sleutel = `${z.held}|${z.tekst}`
  return { sleutel, bestand: `${z.held}-${naam(sleutel)}.mp3`, held: z.held, tekst: z.tekst, uitspraak: uitspraak(z.tekst) }
})

mkdirSync('public/stem', { recursive: true })
writeFileSync('scripts/zinnen.json', JSON.stringify(zinnen, null, 1))
writeFileSync('public/stem/index.json', JSON.stringify(Object.fromEntries(zinnen.map((z) => [z.sleutel, z.bestand]))))
console.log(`${zinnen.length} zinnen (${zinnen.filter((z) => z.held === 'spin').length} spinnenheld, ${zinnen.filter((z) => z.held === 'ijzer').length} ijzerheld)`)
