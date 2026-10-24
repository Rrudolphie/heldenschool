// Alles wordt alleen op dit apparaat bewaard (localStorage).
import { NIVEAUS, type Soort, type Voortgang } from './spel'

const SLEUTEL = 'spider-sommen'

/** Per somsoort: hoe vaak in één keer goed en hoe vaak de eerste keer fout. */
export type Stats = Record<Soort, { goed: number; fout: number }>

export type Bewaard = Voortgang & {
  sterren: number
  naam: string
  pak: string
  rondes: number
  stats: Stats
}

const legeStats = (): Stats =>
  Object.fromEntries(NIVEAUS.map((s) => [s, { goed: 0, fout: 0 }])) as Stats

export const START: Bewaard = {
  niveau: 0,
  goedOpRij: 0,
  foutOpRij: 0,
  sterren: 0,
  naam: '',
  pak: 'klassiek',
  rondes: 0,
  stats: legeStats(),
}

export function laad(): Bewaard {
  try {
    const ruw = localStorage.getItem(SLEUTEL)
    if (!ruw) return START
    const data = JSON.parse(ruw)
    // oudere opslag (versie 1) aanvullen met de nieuwe velden
    return { ...START, ...data, stats: { ...legeStats(), ...data.stats } }
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
