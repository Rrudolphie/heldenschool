// Alles wordt alleen op dit apparaat bewaard (localStorage).
import type { Voortgang } from './spel'

const SLEUTEL = 'spider-sommen'

export type Bewaard = Voortgang & { sterren: number; naam: string }

const START: Bewaard = { niveau: 0, goedOpRij: 0, foutOpRij: 0, sterren: 0, naam: '' }

export function laad(): Bewaard {
  try {
    const ruw = localStorage.getItem(SLEUTEL)
    return ruw ? { ...START, ...JSON.parse(ruw) } : START
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
