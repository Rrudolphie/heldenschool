// Pakken voor de helden. Je speelt ze vrij door in totaal genoeg sterren te verzamelen
// (sterren worden niet "uitgegeven", zodat er nooit iets af gaat). Elke held spaart apart.
import type { HeldId } from './opslag'

type Basis = {
  id: string
  naam: string
  sterren: number
  /** wat de held over dit pak zegt in de kledingkast */
  praatje: string
}

export type SpinPak = Basis & {
  held: 'spin'
  hoofd: string // hoofd, midden van het lijf, handen en laarzen
  zijkant: string // zijkanten, armen en benen
  web: string // kleur van de weblijnen
  embleem: string
}

export type IjzerPak = Basis & {
  held: 'ijzer'
  harnas: string // hoofdkleur van het harnas
  accent: string // gezichtsmasker, buik en benen
  licht: string // ogen, borstlamp en handpalmen
}

export type Pak = SpinPak | IjzerPak

const spin = (p: Omit<SpinPak, 'held'>): SpinPak => ({ held: 'spin', ...p })
const ijzer = (p: Omit<IjzerPak, 'held'>): IjzerPak => ({ held: 'ijzer', ...p })

export const PAKKEN: Record<HeldId, Pak[]> = {
  spin: [
    spin({ id: 'klassiek', naam: 'Klassiek', sterren: 0, praatje: 'Mijn klassieke pak, daar kan ik alles mee!', hoofd: '#e11d2a', zijkant: '#1d4ed8', web: '#111827', embleem: '#111827' }),
    spin({ id: 'nacht', naam: 'Nacht', sterren: 10, praatje: 'In het Nachtpak zie je mij in het donker bijna niet!', hoofd: '#1f2937', zijkant: '#0b0f19', web: '#e5e7eb', embleem: '#f8fafc' }),
    spin({ id: 'jungle', naam: 'Jungle', sterren: 25, praatje: 'Met het Junglepak slinger ik door de bomen!', hoofd: '#16a34a', zijkant: '#14532d', web: '#052e16', embleem: '#facc15' }),
    spin({ id: 'goud', naam: 'Goud', sterren: 40, praatje: 'Het Gouden pak glimt als een schat!', hoofd: '#eab308', zijkant: '#b91c1c', web: '#713f12', embleem: '#7f1d1d' }),
    spin({ id: 'ijs', naam: 'IJs', sterren: 60, praatje: 'Brrr, het IJspak is lekker koel!', hoofd: '#38bdf8', zijkant: '#e0f2fe', web: '#0c4a6e', embleem: '#0c4a6e' }),
    spin({ id: 'galaxy', naam: 'Galaxy', sterren: 80, praatje: 'Met het Galaxypak zwaai ik tussen de sterren!', hoofd: '#7c3aed', zijkant: '#ec4899', web: '#1e1b4b', embleem: '#fdf4ff' }),
    spin({ id: 'vuur', naam: 'Vuur', sterren: 100, praatje: 'Het Vuurpak is heet, heet, heet!', hoofd: '#f97316', zijkant: '#7f1d1d', web: '#431407', embleem: '#fde047' }),
  ],
  ijzer: [
    ijzer({ id: 'klassiek', naam: 'Klassiek', sterren: 0, praatje: 'Mijn rood met gouden harnas, sterk en snel!', harnas: '#b91c1c', accent: '#f59e0b', licht: '#67e8f9' }),
    ijzer({ id: 'zilver', naam: 'Zilver', sterren: 10, praatje: 'Het Zilveren harnas glanst als een spiegel!', harnas: '#6b7280', accent: '#e5e7eb', licht: '#93c5fd' }),
    ijzer({ id: 'stealth', naam: 'Stealth', sterren: 25, praatje: 'Met het Stealthpak ben ik bijna onzichtbaar!', harnas: '#111827', accent: '#374151', licht: '#f87171' }),
    ijzer({ id: 'ruimte', naam: 'Ruimte', sterren: 40, praatje: 'Met het Ruimtepak kan ik naar de maan!', harnas: '#1e3a8a', accent: '#cbd5e1', licht: '#a5f3fc' }),
    ijzer({ id: 'goud', naam: 'Goud', sterren: 60, praatje: 'Het Gouden harnas is extra sterk!', harnas: '#ca8a04', accent: '#fde68a', licht: '#ffffff' }),
    ijzer({ id: 'neon', naam: 'Neon', sterren: 80, praatje: 'Het Neonpak licht op in het donker!', harnas: '#6d28d9', accent: '#22d3ee', licht: '#f0abfc' }),
    ijzer({ id: 'lava', naam: 'Lava', sterren: 100, praatje: 'Het Lavapak is gloeiend heet!', harnas: '#7f1d1d', accent: '#f97316', licht: '#fde047' }),
  ],
}

export const pakVan = (held: HeldId, id: string) => PAKKEN[held].find((p) => p.id === id) ?? PAKKEN[held][0]

export const isVrij = (pak: Pak, sterren: number) => sterren >= pak.sterren

/** Pakken die vrijkwamen tussen twee sterrenstanden (voor het feestje na een ronde). */
export const nieuwVrij = (held: HeldId, voor: number, na: number) =>
  PAKKEN[held].filter((p) => p.sterren > voor && p.sterren <= na)

/** Het eerstvolgende pak dat nog op slot zit. */
export const volgendPak = (held: HeldId, sterren: number) => PAKKEN[held].find((p) => p.sterren > sterren)
