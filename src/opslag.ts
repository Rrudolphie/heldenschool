// Alles wordt alleen op dit apparaat bewaard (localStorage).
import { NIVEAUS, type Voortgang } from './spel'
import { LETTER_NIVEAUS, STANDAARD_LETTERS } from './letters'

// De sleutel heet nog 'spider-sommen' (de oude naam): zo blijven sterren en pakken
// bewaard na het hernoemen naar Heldenschool.
const SLEUTEL = 'spider-sommen'

export type HeldId = 'spin' | 'ijzer'

/** Per oefensoort: hoe vaak in één keer goed en hoe vaak de eerste keer fout. */
export type Stats = Record<string, { goed: number; fout: number }>

export type HeldData = Voortgang & { sterren: number; pak: string; stats: Stats }

export type Bewaard = {
  naam: string
  rondes: number
  helden: Record<HeldId, HeldData>
  letters: string[] // letters die hij al kent (gekozen door de ouder)
  hakkenAan: boolean
  lezenAan: boolean
}

const legeStats = (soorten: string[]): Stats => Object.fromEntries(soorten.map((s) => [s, { goed: 0, fout: 0 }]))

const nieuweHeld = (soorten: string[]): HeldData => ({
  niveau: 0,
  goedOpRij: 0,
  foutOpRij: 0,
  sterren: 0,
  pak: 'klassiek',
  stats: legeStats(soorten),
})

export const START: Bewaard = {
  naam: '',
  rondes: 0,
  helden: { spin: nieuweHeld(NIVEAUS), ijzer: nieuweHeld(LETTER_NIVEAUS) },
  letters: STANDAARD_LETTERS,
  hakkenAan: false,
  lezenAan: false,
}

/** Lege voortgang voor beide helden (voor "opnieuw beginnen"). */
export const legeHelden = () => START.helden

export function laad(): Bewaard {
  try {
    const ruw = localStorage.getItem(SLEUTEL)
    if (!ruw) return START
    const d = JSON.parse(ruw)
    if (!d.helden) {
      // versie 1/2: alles hoorde bij de spinnenheld
      const spin = START.helden.spin
      return {
        ...START,
        naam: d.naam ?? '',
        rondes: d.rondes ?? 0,
        helden: {
          ijzer: START.helden.ijzer,
          spin: {
            niveau: d.niveau ?? 0,
            goedOpRij: d.goedOpRij ?? 0,
            foutOpRij: d.foutOpRij ?? 0,
            sterren: d.sterren ?? 0,
            pak: d.pak ?? 'klassiek',
            stats: { ...spin.stats, ...d.stats },
          },
        },
      }
    }
    return {
      ...START,
      ...d,
      helden: {
        spin: { ...START.helden.spin, ...d.helden.spin, stats: { ...START.helden.spin.stats, ...d.helden.spin?.stats } },
        ijzer: { ...START.helden.ijzer, ...d.helden.ijzer, stats: { ...START.helden.ijzer.stats, ...d.helden.ijzer?.stats } },
      },
    }
  } catch {
    return START
  }
}

export function bewaar(data: Bewaard) {
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(data))
  } catch {
    // privévenster of opslag vol: spel werkt gewoon door
  }
}

export const heldNaam = (held: HeldId, naam: string) =>
  held === 'spin' ? (naam ? `Spider-${naam}` : 'Spider-held') : naam ? `Iron-${naam}` : 'IJzerheld'

/** Welke niveaus aan staan per held. */
export function toegestaan(held: HeldId, data: Bewaard): number[] {
  if (held === 'spin') return NIVEAUS.map((_, i) => i)
  return [0, 1, ...(data.hakkenAan ? [2] : []), ...(data.lezenAan ? [3] : [])]
}
