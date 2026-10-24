// Alle zinnen die de helden zeggen. De app gebruikt deze functies, en het script
// scripts/zinnen-lijst.ts maakt er de lijst van om alles vooraf in te spreken.
import type { HeldId } from './opslag'
import { NIVEAU_NAAM, type Som, vraagTekst } from './spel'
import { KLANK_UITSPRAAK, LETTER_NIVEAU_NAAM, LETTER_NIVEAUS, letterVraag, type LetterTaak, WOORDEN } from './letters'
import { PAKKEN } from './pakken'
import { mixIntro, VERHALEN } from './verhalen'

export const HELD_TITEL: Record<HeldId, string> = { spin: 'de spinnenheld', ijzer: 'de ijzerheld' }

export const TELWOORD = ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien']

export const LOF = ['Super!', 'Goed gedaan!', 'Wauw, knap!', 'Helemaal goed!', 'Top gedaan!']
export const LOF_HELD: Record<HeldId, string[]> = { spin: ['Spinnentastisch!'], ijzer: ['IJzersterk!'] }

export const Z = {
  hoi: 'Hoi',
  welkomRest: (held: HeldId) =>
    held === 'spin' ? 'Ik ben de spinnenheld. Zullen we samen rekenen?' : 'Ik ben de ijzerheld. Zullen we letters oefenen?',
  welkom: (held: HeldId) => `Hoi! ${Z.welkomRest(held)}`,
  welkomMix: 'De spinnenheld en de ijzerheld gaan samen op missie!',
  nieuwNiveau: (naam: string) => `Je bent naar een nieuw niveau: ${naam}!`,
  klaar: (sterren: number) => `Missie klaar! Je hebt ${sterren} ${sterren === 1 ? 'ster' : 'sterren'} verdiend.`,
  bedankt: 'Dankjewel',
  bedanktZonderNaam: 'Dankjewel, superheld!',
  nieuwPak: (naam: string) => `En je hebt een nieuw pak vrijgespeeld: ${naam}! Wil je het aantrekken?`,
  draagtPak: (naam: string) => `Je draagt nu het pak ${naam}!`,
  opSlot: 'Dit pak zit nog op slot. Verzamel nog meer sterren!',
  // hulp bij rekenen
  telMee: 'Bijna! Tel maar mee.',
  zoekWeb: (a: number) => `Bijna! Zoek het web met ${a} spinnetjes.`,
  // hulp bij letters
  luisterGoed: 'Bijna! Luister goed.',
  luisterMaar: 'Bijna! Luister maar.',
  nogEenKeer: 'Bijna! Luister nog een keer.',
  samenHakken: 'Bijna! We hakken het woord samen.',
  beginMet: 'Welk plaatje begint met',
}

type Zin = { held: HeldId; tekst: string }

/** Alle sommen die kunnen voorkomen (tot 10). */
function alleSommen(): Som[] {
  const sommen: Som[] = [{ soort: 'tellen', a: 0, b: 0, antwoord: 0, opties: [], kleur: '' }]
  for (let a = 1; a <= 10; a++) sommen.push({ soort: 'cijfers', a, b: 0, antwoord: a, opties: [], kleur: '' })
  for (let a = 1; a <= 9; a++)
    for (let b = 1; a + b <= 10; b++) sommen.push({ soort: 'plus', a, b, antwoord: a + b, opties: [], kleur: '' })
  for (let a = 2; a <= 10; a++)
    for (let b = 1; b < a; b++) sommen.push({ soort: 'min', a, b, antwoord: a - b, opties: [], kleur: '' })
  return sommen
}

/** De complete lijst, per held, zonder dubbele zinnen. */
export function alleZinnen(): Zin[] {
  const lijst: Zin[] = []
  const zeg = (held: HeldId, tekst: string) => lijst.push({ held, tekst })

  for (const held of ['spin', 'ijzer'] as HeldId[]) {
    zeg(held, Z.hoi)
    zeg(held, Z.welkomRest(held))
    zeg(held, Z.welkom(held))
    for (const l of [...LOF, ...LOF_HELD[held]]) zeg(held, l)
    for (const n of held === 'spin' ? NIVEAU_NAAM : LETTER_NIVEAU_NAAM) zeg(held, Z.nieuwNiveau(n))
    for (let s = 0; s <= 10; s++) zeg(held, Z.klaar(s))
    zeg(held, Z.bedankt)
    zeg(held, Z.bedanktZonderNaam)
    for (const p of PAKKEN[held]) {
      zeg(held, Z.nieuwPak(p.naam))
      zeg(held, Z.draagtPak(p.naam))
    }
    zeg(held, Z.opSlot)
  }

  // spinnenheld: rekenen
  zeg('spin', Z.welkomMix)
  zeg('spin', Z.telMee)
  for (let i = 1; i <= 10; i++) {
    zeg('spin', TELWOORD[i])
    zeg('spin', Z.zoekWeb(i))
  }
  for (const som of alleSommen()) zeg('spin', vraagTekst(som))

  // ijzerheld: letters
  for (const z of [Z.luisterGoed, Z.luisterMaar, Z.nogEenKeer, Z.samenHakken, Z.beginMet]) zeg('ijzer', z)
  for (const w of WOORDEN) {
    zeg('ijzer', w.woord)
    zeg('ijzer', letterVraag({ soort: 'beginklank', woord: w } as LetterTaak))
  }
  for (const soort of LETTER_NIVEAUS.filter((s) => s !== 'beginklank'))
    zeg('ijzer', letterVraag({ soort, woord: WOORDEN[0] } as LetterTaak))
  for (const uitspraak of Object.values(KLANK_UITSPRAAK)) zeg('ijzer', uitspraak)

  // avonturen: de held van het verhaal vertelt; bij de mix opent de spinnenheld
  for (const v of VERHALEN) {
    zeg(v.held, v.intro)
    zeg(v.held, v.halverwege)
    zeg(v.held, v.slot)
    zeg('spin', mixIntro(v))
  }

  const gezien = new Set<string>()
  return lijst.filter((z) => {
    const k = `${z.held}|${z.tekst}`
    if (gezien.has(k)) return false
    gezien.add(k)
    return true
  })
}
