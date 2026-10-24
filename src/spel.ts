// Spellogica rekenen: niveaus, sommen maken en het niveau laten meegroeien.
//
// Meegroeien gaat in twee lagen:
// - binnen een niveau zijn er twee treden: eerst kleinere getallen en makkelijke foute
//   antwoorden, daarna grotere getallen en foute antwoorden die dicht bij het goede liggen;
// - na de hoogste trede volgt het volgende niveau. Snel én goed telt dubbel.

export type Soort = 'tellen' | 'cijfers' | 'plus' | 'min' | 'plus20' | 'min20'

export const NIVEAUS: Soort[] = ['tellen', 'cijfers', 'plus', 'min', 'plus20', 'min20']
export const NIVEAU_NAAM = ['Tellen', 'Cijfers', 'Plussommen', 'Minsommen', 'Plus tot 20', 'Min tot 20']
export const SOMMEN_PER_RONDE = 10
const OMHOOG_NA = [3, 4] // punten (goed op rij, snel telt dubbel) per trede om omhoog te gaan
const OMLAAG_NA = 3 // fout op rij → een stap terug
const TERUG_TREDE_NA = 2 // fout op rij → terug naar de makkelijke trede
export const SNEL_MS = 6000 // binnen deze tijd goed = snel

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

/** Twee foute opties binnen min..max: op de hoge trede dicht bij het goede antwoord. */
function maakOpties(antwoord: number, min: number, max: number, trede: number): number[] {
  const afstanden = trede > 0 ? [-1, 1, -2, 2, 3, -3] : [-3, 3, -2, 2, 4, -4, -1, 1]
  const kandidaten = new Set<number>()
  // eerst de vier voorkeursafstanden in willekeurige volgorde, dan de reserve
  for (const d of [...schud(afstanden.slice(0, 4)), ...afstanden.slice(4)]) {
    const v = antwoord + d
    if (v >= min && v <= max) kandidaten.add(v)
    if (kandidaten.size === 2) break
  }
  return schud([antwoord, ...kandidaten])
}

export function maakSom(soort: Soort, trede = 0, vorige?: Som): Som {
  const kleur = KLEUREN[rnd(0, KLEUREN.length - 1)]
  const hoog = trede > 0
  for (let poging = 0; ; poging++) {
    let a = 0
    let b = 0
    let antwoord = 0
    let opties: number[]
    if (soort === 'tellen' || soort === 'cijfers') {
      a = rnd(1, hoog ? 10 : 5)
      antwoord = a
      opties = maakOpties(a, 1, 10, trede)
    } else if (soort === 'plus' || soort === 'plus20') {
      antwoord = soort === 'plus' ? rnd(2, hoog ? 10 : 5) : rnd(11, hoog ? 20 : 15)
      a = rnd(1, antwoord - 1)
      b = antwoord - a
      opties = maakOpties(antwoord, 0, soort === 'plus' ? 10 : 20, trede)
    } else {
      a = soort === 'min' ? rnd(2, hoog ? 10 : 5) : rnd(11, hoog ? 20 : 15)
      b = rnd(1, a - 1)
      antwoord = a - b
      opties = maakOpties(antwoord, 0, soort === 'min' ? 10 : 20, trede)
    }
    const zelfde = vorige && vorige.soort === soort && vorige.a === a && vorige.b === b
    if (!zelfde || poging > 5) return { soort, a, b, antwoord, opties, kleur }
  }
}

export type Voortgang = { niveau: number; trede?: number; goedOpRij: number; foutOpRij: number }

/**
 * Het niveau dat echt gespeeld wordt: het hoogste toegestane niveau dat niet hoger is
 * dan het bewaarde (de ouder kan niveaus uitzetten).
 */
export function speelNiveau(niveau: number, toegestaan: number[]): number {
  return [...toegestaan].reverse().find((n) => n <= niveau) ?? toegestaan[0]
}

/**
 * Verwerk een antwoord (alleen de eerste poging telt voor het niveau).
 * `toegestaan` zijn de niveaus die aan staan, oplopend. `snel` = goed binnen SNEL_MS.
 */
export function verwerk(
  v: Voortgang,
  inEenKeerGoed: boolean,
  toegestaan: number[],
  snel = false,
): Required<Voortgang> & { veranderd: -1 | 0 | 1 } {
  const plek = toegestaan.indexOf(speelNiveau(v.niveau, toegestaan))
  const trede = v.trede ?? 0
  if (inEenKeerGoed) {
    const punten = v.goedOpRij + (snel ? 2 : 1)
    if (punten >= OMHOOG_NA[trede]) {
      if (trede === 0) return { niveau: v.niveau, trede: 1, goedOpRij: 0, foutOpRij: 0, veranderd: 0 }
      if (plek < toegestaan.length - 1)
        return { niveau: toegestaan[plek + 1], trede: 0, goedOpRij: 0, foutOpRij: 0, veranderd: 1 }
    }
    return { niveau: v.niveau, trede, goedOpRij: Math.min(punten, OMHOOG_NA[1]), foutOpRij: 0, veranderd: 0 }
  }
  const fout = v.foutOpRij + 1
  if (trede === 1 && fout >= TERUG_TREDE_NA) return { niveau: v.niveau, trede: 0, goedOpRij: 0, foutOpRij: 0, veranderd: 0 }
  if (fout >= OMLAAG_NA && plek > 0)
    return { niveau: toegestaan[plek - 1], trede: 1, goedOpRij: 0, foutOpRij: 0, veranderd: -1 }
  return { niveau: v.niveau, trede, goedOpRij: 0, foutOpRij: fout, veranderd: 0 }
}

/** Wat de held hardop zegt bij een som. */
export function vraagTekst(som: Som): string {
  switch (som.soort) {
    case 'tellen':
      return 'Hoeveel spinnetjes zie je?'
    case 'cijfers':
      return `Waar zitten ${som.a} spinnetjes?`
    case 'plus':
    case 'plus20':
      return `${som.a} plus ${som.b}. Hoeveel spinnetjes zijn het samen?`
    case 'min':
    case 'min20':
      return `${som.a} spinnetjes. Er slingeren er ${som.b} weg. Hoeveel blijven er over?`
  }
}
