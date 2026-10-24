// Pakken voor de held. Je speelt ze vrij door in totaal genoeg sterren te verzamelen
// (sterren worden niet "uitgegeven", zodat er nooit iets af gaat).

export type Pak = {
  id: string
  naam: string
  sterren: number // totaal aantal sterren nodig
  hoofd: string // hoofd, midden van het lijf, handen en laarzen
  zijkant: string // zijkanten, armen en benen
  web: string // kleur van de weblijnen
  embleem: string
}

export const PAKKEN: Pak[] = [
  { id: 'klassiek', naam: 'Klassiek', sterren: 0, hoofd: '#e11d2a', zijkant: '#1d4ed8', web: '#111827', embleem: '#111827' },
  { id: 'nacht', naam: 'Nacht', sterren: 10, hoofd: '#1f2937', zijkant: '#0b0f19', web: '#e5e7eb', embleem: '#f8fafc' },
  { id: 'jungle', naam: 'Jungle', sterren: 25, hoofd: '#16a34a', zijkant: '#14532d', web: '#052e16', embleem: '#facc15' },
  { id: 'goud', naam: 'Goud', sterren: 40, hoofd: '#eab308', zijkant: '#b91c1c', web: '#713f12', embleem: '#7f1d1d' },
  { id: 'ijs', naam: 'IJs', sterren: 60, hoofd: '#38bdf8', zijkant: '#e0f2fe', web: '#0c4a6e', embleem: '#0c4a6e' },
  { id: 'galaxy', naam: 'Galaxy', sterren: 80, hoofd: '#7c3aed', zijkant: '#ec4899', web: '#1e1b4b', embleem: '#fdf4ff' },
  { id: 'vuur', naam: 'Vuur', sterren: 100, hoofd: '#f97316', zijkant: '#7f1d1d', web: '#431407', embleem: '#fde047' },
]

export const pakVan = (id: string) => PAKKEN.find((p) => p.id === id) ?? PAKKEN[0]

export const isVrij = (pak: Pak, sterren: number) => sterren >= pak.sterren

/** Pakken die vrijkwamen tussen twee sterrenstanden (voor het feestje na een ronde). */
export const nieuwVrij = (voor: number, na: number) => PAKKEN.filter((p) => p.sterren > voor && p.sterren <= na)

/** Het eerstvolgende pak dat nog op slot zit. */
export const volgendPak = (sterren: number) => PAKKEN.find((p) => p.sterren > sterren)
