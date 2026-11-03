// Pakken voor de helden. Je speelt ze vrij door in totaal genoeg sterren te verzamelen
// (sterren worden niet "uitgegeven", zodat er nooit iets af gaat). Elke held spaart apart.
// De id's blijven gelijk aan eerdere versies, zodat een gekozen pak bewaard blijft.
import type { HeldId } from './opslag'

export type Pak = {
  held: HeldId
  id: string
  naam: string
  sterren: number
  /** wat de held over dit pak zegt in de kledingkast */
  praatje: string
}

const pak = (held: HeldId, id: string, naam: string, sterren: number, praatje: string): Pak => ({
  held,
  id,
  naam,
  sterren,
  praatje,
})

export const PAKKEN: Record<HeldId, Pak[]> = {
  spin: [
    pak('spin', 'klassiek', 'Klassiek', 0, 'Mijn blauwe tenue, daar scoor ik alles mee!'),
    pak('spin', 'nacht', 'Nacht', 10, 'In het Nachttenue zie je mij in het donker bijna niet!'),
    pak('spin', 'jungle', 'Jungle', 25, 'Met het Jungletenue ren ik door het bos!'),
    pak('spin', 'goud', 'Goud', 40, 'Het Gouden tenue glimt als een beker!'),
    pak('spin', 'ijs', 'IJs', 60, 'Brrr, het IJstenue is lekker koel!'),
    pak('spin', 'galaxy', 'Galaxy', 80, 'Met het Galaxytenue schiet ik tot de sterren!'),
    pak('spin', 'vuur', 'Vuur', 100, 'Het Vuurtenue is heet, heet, heet!'),
  ],
  ijzer: [
    pak('ijzer', 'klassiek', 'Klassiek', 0, 'Mijn zwart-gele uniform, klaar voor actie!'),
    pak('ijzer', 'zilver', 'Zilver', 10, 'Het Zilveren uniform glanst als een spiegel!'),
    pak('ijzer', 'stealth', 'Stealth', 25, 'In het Stealthuniform ben ik bijna onzichtbaar!'),
    pak('ijzer', 'ruimte', 'Ruimte', 40, 'Met het Ruimte-uniform kan ik naar de maan!'),
    pak('ijzer', 'goud', 'Goud', 60, 'Het Gouden uniform is extra sterk!'),
    pak('ijzer', 'neon', 'Neon', 80, 'Het Neonuniform licht op in het donker!'),
    pak('ijzer', 'lava', 'Lava', 100, 'Het Lava-uniform is gloeiend heet!'),
  ],
}

export const pakVan = (held: HeldId, id: string) => PAKKEN[held].find((p) => p.id === id) ?? PAKKEN[held][0]

export const isVrij = (pak: Pak, sterren: number) => sterren >= pak.sterren

/** Pakken die vrijkwamen tussen twee sterrenstanden (voor het feestje na een ronde). */
export const nieuwVrij = (held: HeldId, voor: number, na: number) =>
  PAKKEN[held].filter((p) => p.sterren > voor && p.sterren <= na)

/** Het eerstvolgende pak dat nog op slot zit. */
export const volgendPak = (held: HeldId, sterren: number) => PAKKEN[held].find((p) => p.sterren > sterren)
