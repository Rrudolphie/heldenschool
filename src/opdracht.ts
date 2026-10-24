// Eén opdracht in een missie: een som (spinnenheld) of een letteropdracht (ijzerheld).
import { maakSom, NIVEAUS, type Som, speelNiveau, vraagTekst } from './spel'
import { LETTER_NIVEAUS, type LetterTaak, letterVraag, maakLetterTaak } from './letters'
import { type Bewaard, type HeldId, toegestaan } from './opslag'

export type Wereld = 'rekenen' | 'letters' | 'mix'

export type Opdracht = { held: 'spin'; som: Som } | { held: 'ijzer'; taak: LetterTaak }

/** Welke held de opdracht met dit nummer geeft (bij de mix wisselen ze af). */
export const heldVoor = (wereld: Wereld, nr: number): HeldId =>
  wereld === 'rekenen' ? 'spin' : wereld === 'letters' ? 'ijzer' : nr % 2 === 0 ? 'spin' : 'ijzer'

export function maakOpdracht(held: HeldId, data: Bewaard, vorige?: Opdracht): Opdracht {
  const niveau = speelNiveau(data.helden[held].niveau, toegestaan(held, data))
  if (held === 'spin') return { held, som: maakSom(NIVEAUS[niveau], vorige?.held === 'spin' ? vorige.som : undefined) }
  return {
    held,
    taak: maakLetterTaak(LETTER_NIVEAUS[niveau], data.letters, vorige?.held === 'ijzer' ? vorige.taak : undefined),
  }
}

export const optiesVan = (o: Opdracht) => (o.held === 'spin' ? o.som.opties.map(String) : o.taak.opties)
export const antwoordVan = (o: Opdracht) => (o.held === 'spin' ? String(o.som.antwoord) : o.taak.antwoord)
export const soortVan = (o: Opdracht): string => (o.held === 'spin' ? o.som.soort : o.taak.soort)
export const vraagVan = (o: Opdracht) => (o.held === 'spin' ? vraagTekst(o.som) : letterVraag(o.taak))
