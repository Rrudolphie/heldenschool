// Spellogica rekenen: niveaus, sommen maken en het niveau laten meegroeien.

export type Soort = 'tellen' | 'cijfers' | 'plus' | 'min'

export const NIVEAUS: Soort[] = ['tellen', 'cijfers', 'plus', 'min']
export const NIVEAU_NAAM = ['Tellen', 'Cijfers', 'Plussommen', 'Minsommen']
export const SOMMEN_PER_RONDE = 10
const OMHOOG_NA = 5 // goed op rij (in één keer) → niveau omhoog
const OMLAAG_NA = 3 // fout op rij → niveau omlaag

export type Som = {
  soort: Soort
  a: number // tellen/cijfers: het aantal; plus/min: eerste getal
  b: number // plus/min: tweede getal (anders 0)
  antwoord: number
  opties: number[] // 3 keuzes, door elkaar
  kleur: string
}

const KLEUREN = ['#7c3aed', '#16a34a', '#ea580c', '#0891b2', '#db2777']

export const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))
export const kies = <T,>(l: T[]) => l[Math.floor(Math.random() * l.length)]

export function schud<T>(lijst: T[]): T[] {
  const l = [...lijst]
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[l[i], l[j]] = [l[j], l[i]]
  }
  return l
}

/** Twee foute opties dicht bij het goede antwoord, binnen min..max. */
function maakOpties(antwoord: number, min: number, max: number): number[] {
  const kandidaten = new Set<number>()
  for (const d of schud([-2, -1, 1, 2, 3, -3])) {
    const v = antwoord + d
    if (v >= min && v <= max) kandidaten.add(v)
    if (kandidaten.size === 2) break
  }
  return schud([antwoord, ...kandidaten])
}

export function maakSom(soort: Soort, vorige?: Som): Som {
  const kleur = KLEUREN[rnd(0, KLEUREN.length - 1)]
  for (let poging = 0; ; poging++) {
    let a = 0
    let b = 0
    let antwoord = 0
    let opties: number[]
    if (soort === 'tellen' || soort === 'cijfers') {
      a = rnd(1, 10)
      antwoord = a
      opties = maakOpties(a, 1, 10)
    } else if (soort === 'plus') {
      antwoord = rnd(2, 10)
      a = rnd(1, antwoord - 1)
      b = antwoord - a
      opties = maakOpties(antwoord, 0, 10)
    } else {
      a = rnd(2, 10)
      b = rnd(1, a - 1)
      antwoord = a - b
      opties = maakOpties(antwoord, 0, 10)
    }
    const zelfde = vorige && vorige.soort === soort && vorige.a === a && vorige.b === b
    if (!zelfde || poging > 5) return { soort, a, b, antwoord, opties, kleur }
  }
}

export type Voortgang = { niveau: number; goedOpRij: number; foutOpRij: number }

/**
 * Het niveau dat echt gespeeld wordt: het hoogste toegestane niveau dat niet hoger is
 * dan het bewaarde (de ouder kan niveaus uitzetten).
 */
export function speelNiveau(niveau: number, toegestaan: number[]): number {
  return [...toegestaan].reverse().find((n) => n <= niveau) ?? toegestaan[0]
}

/**
 * Verwerk een antwoord (alleen de eerste poging telt voor het niveau).
 * `toegestaan` zijn de niveaus die aan staan, oplopend.
 */
export function verwerk(
  v: Voortgang,
  inEenKeerGoed: boolean,
  toegestaan: number[],
): Voortgang & { veranderd: -1 | 0 | 1 } {
  const plek = toegestaan.indexOf(speelNiveau(v.niveau, toegestaan))
  if (inEenKeerGoed) {
    const goed = v.goedOpRij + 1
    if (goed >= OMHOOG_NA && plek < toegestaan.length - 1)
      return { niveau: toegestaan[plek + 1], goedOpRij: 0, foutOpRij: 0, veranderd: 1 }
    return { ...v, goedOpRij: goed, foutOpRij: 0, veranderd: 0 }
  }
  const fout = v.foutOpRij + 1
  if (fout >= OMLAAG_NA && plek > 0) return { niveau: toegestaan[plek - 1], goedOpRij: 0, foutOpRij: 0, veranderd: -1 }
  return { ...v, goedOpRij: 0, foutOpRij: fout, veranderd: 0 }
}

/** Wat de held hardop zegt bij een som. */
export function vraagTekst(som: Som): string {
  switch (som.soort) {
    case 'tellen':
      return 'Hoeveel spinnetjes zie je?'
    case 'cijfers':
      return `Waar zitten ${som.a} spinnetjes?`
    case 'plus':
      return `${som.a} plus ${som.b}. Hoeveel spinnetjes zijn het samen?`
    case 'min':
      return `${som.a} spinnetjes. Er slingeren er ${som.b} weg. Hoeveel blijven er over?`
  }
}
