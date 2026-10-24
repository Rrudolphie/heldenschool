// Letters: woorden met plaatjes (emoji) en de letteroefeningen.
import { kies, schud } from './spel'

export type LetterSoort = 'beginklank' | 'herkennen' | 'hakken' | 'lezen'

export const LETTER_NIVEAUS: LetterSoort[] = ['beginklank', 'herkennen', 'hakken', 'lezen']
export const LETTER_NIVEAU_NAAM = ['Beginklank', 'Letter herkennen', 'Hakken en plakken', 'Woordjes lezen']

export type Woord = {
  woord: string
  emoji: string
  /** Alleen bij korte, klankzuivere woorden: de klanken voor hakken en plakken / lezen. */
  klanken?: string[]
}

// Woorden waarvan de eerste klank gewoon de eerste letter is
// (dus geen 'uil', 'ei' of 'schaap': daar hoor je iets anders dan de letter).
export const WOORDEN: Woord[] = [
  { woord: 'aap', emoji: '🐒', klanken: ['aa', 'p'] },
  { woord: 'appel', emoji: '🍎' },
  { woord: 'anker', emoji: '⚓' },
  { woord: 'ananas', emoji: '🍍' },
  { woord: 'bal', emoji: '⚽', klanken: ['b', 'a', 'l'] },
  { woord: 'boom', emoji: '🌳', klanken: ['b', 'oo', 'm'] },
  { woord: 'bus', emoji: '🚌', klanken: ['b', 'u', 's'] },
  { woord: 'boot', emoji: '⛵', klanken: ['b', 'oo', 't'] },
  { woord: 'beer', emoji: '🐻', klanken: ['b', 'ee', 'r'] },
  { woord: 'banaan', emoji: '🍌' },
  { woord: 'cactus', emoji: '🌵' },
  { woord: 'camera', emoji: '📷' },
  { woord: 'cadeau', emoji: '🎁' },
  { woord: 'das', emoji: '🧣', klanken: ['d', 'a', 's'] },
  { woord: 'deur', emoji: '🚪', klanken: ['d', 'eu', 'r'] },
  { woord: 'dino', emoji: '🦕' },
  { woord: 'duim', emoji: '👍', klanken: ['d', 'ui', 'm'] },
  { woord: 'dolfijn', emoji: '🐬' },
  { woord: 'eend', emoji: '🦆', klanken: ['ee', 'n', 'd'] },
  { woord: 'egel', emoji: '🦔' },
  { woord: 'emmer', emoji: '🪣' },
  { woord: 'fiets', emoji: '🚲' },
  { woord: 'fles', emoji: '🍾', klanken: ['f', 'l', 'e', 's'] },
  { woord: 'fee', emoji: '🧚', klanken: ['f', 'ee'] },
  { woord: 'geit', emoji: '🐐', klanken: ['g', 'ei', 't'] },
  { woord: 'gitaar', emoji: '🎸' },
  { woord: 'giraf', emoji: '🦒' },
  { woord: 'huis', emoji: '🏠', klanken: ['h', 'ui', 's'] },
  { woord: 'hond', emoji: '🐕', klanken: ['h', 'o', 'n', 'd'] },
  { woord: 'hoed', emoji: '🎩', klanken: ['h', 'oe', 'd'] },
  { woord: 'haan', emoji: '🐓', klanken: ['h', 'aa', 'n'] },
  { woord: 'inktvis', emoji: '🦑' },
  { woord: 'jas', emoji: '🧥', klanken: ['j', 'a', 's'] },
  { woord: 'jurk', emoji: '👗', klanken: ['j', 'u', 'r', 'k'] },
  { woord: 'jojo', emoji: '🪀' },
  { woord: 'kat', emoji: '🐈', klanken: ['k', 'a', 't'] },
  { woord: 'koe', emoji: '🐄', klanken: ['k', 'oe'] },
  { woord: 'kip', emoji: '🐔', klanken: ['k', 'i', 'p'] },
  { woord: 'kaas', emoji: '🧀', klanken: ['k', 'aa', 's'] },
  { woord: 'koek', emoji: '🍪', klanken: ['k', 'oe', 'k'] },
  { woord: 'kroon', emoji: '👑' },
  { woord: 'leeuw', emoji: '🦁' },
  { woord: 'lamp', emoji: '💡', klanken: ['l', 'a', 'm', 'p'] },
  { woord: 'lepel', emoji: '🥄' },
  { woord: 'lolly', emoji: '🍭' },
  { woord: 'lama', emoji: '🦙' },
  { woord: 'maan', emoji: '🌙', klanken: ['m', 'aa', 'n'] },
  { woord: 'muis', emoji: '🐭', klanken: ['m', 'ui', 's'] },
  { woord: 'melk', emoji: '🥛', klanken: ['m', 'e', 'l', 'k'] },
  { woord: 'mug', emoji: '🦟', klanken: ['m', 'u', 'g'] },
  { woord: 'neus', emoji: '👃', klanken: ['n', 'eu', 's'] },
  { woord: 'nest', emoji: '🪺', klanken: ['n', 'e', 's', 't'] },
  { woord: 'neushoorn', emoji: '🦏' },
  { woord: 'oog', emoji: '👁️', klanken: ['oo', 'g'] },
  { woord: 'oor', emoji: '👂', klanken: ['oo', 'r'] },
  { woord: 'olifant', emoji: '🐘' },
  { woord: 'peer', emoji: '🍐', klanken: ['p', 'ee', 'r'] },
  { woord: 'pan', emoji: '🍳', klanken: ['p', 'a', 'n'] },
  { woord: 'pizza', emoji: '🍕' },
  { woord: 'paard', emoji: '🐴' },
  { woord: 'pinguïn', emoji: '🐧' },
  { woord: 'roos', emoji: '🌹', klanken: ['r', 'oo', 's'] },
  { woord: 'raket', emoji: '🚀' },
  { woord: 'rups', emoji: '🐛', klanken: ['r', 'u', 'p', 's'] },
  { woord: 'robot', emoji: '🤖' },
  { woord: 'sok', emoji: '🧦', klanken: ['s', 'o', 'k'] },
  { woord: 'slak', emoji: '🐌', klanken: ['s', 'l', 'a', 'k'] },
  { woord: 'ster', emoji: '⭐', klanken: ['s', 't', 'e', 'r'] },
  { woord: 'slang', emoji: '🐍' },
  { woord: 'soep', emoji: '🍲', klanken: ['s', 'oe', 'p'] },
  { woord: 'tent', emoji: '⛺', klanken: ['t', 'e', 'n', 't'] },
  { woord: 'tijger', emoji: '🐯' },
  { woord: 'trein', emoji: '🚂' },
  { woord: 'tand', emoji: '🦷', klanken: ['t', 'a', 'n', 'd'] },
  { woord: 'taart', emoji: '🎂' },
  { woord: 'tomaat', emoji: '🍅' },
  { woord: 'ufo', emoji: '🛸' },
  { woord: 'vis', emoji: '🐟', klanken: ['v', 'i', 's'] },
  { woord: 'vos', emoji: '🦊', klanken: ['v', 'o', 's'] },
  { woord: 'vlinder', emoji: '🦋' },
  { woord: 'vork', emoji: '🍴', klanken: ['v', 'o', 'r', 'k'] },
  { woord: 'vuur', emoji: '🔥', klanken: ['v', 'uu', 'r'] },
  { woord: 'walvis', emoji: '🐋' },
  { woord: 'wolk', emoji: '☁️', klanken: ['w', 'o', 'l', 'k'] },
  { woord: 'worm', emoji: '🪱', klanken: ['w', 'o', 'r', 'm'] },
  { woord: 'wortel', emoji: '🥕' },
  { woord: 'zon', emoji: '☀️', klanken: ['z', 'o', 'n'] },
  { woord: 'zee', emoji: '🌊', klanken: ['z', 'ee'] },
  { woord: 'zebra', emoji: '🦓' },
  { woord: 'zaag', emoji: '🪚', klanken: ['z', 'aa', 'g'] },
]

const beginletter = (w: Woord) => w.woord[0]

/** Alle letters waar woorden bij zijn (q, x en y hebben geen goede woorden voor kleuters). */
export const ALLE_LETTERS = [...new Set(WOORDEN.map(beginletter))].sort()

/** Startkeuze tot de ouder zelf letters aanvinkt. */
export const STANDAARD_LETTERS = ['a', 'b', 'i', 'k', 'm', 'o', 'p', 'r', 's', 'v']

/** Alle klanken die in de korte woorden voorkomen (voor de opnames in het ouderscherm). */
export const ALLE_KLANKEN = [...new Set(WOORDEN.flatMap((w) => w.klanken ?? []))].sort(
  (a, b) => a.length - b.length || a.localeCompare(b),
)

export type LetterTaak = {
  soort: LetterSoort
  woord: Woord // het woord van het goede antwoord
  letter: string // de beginletter van dat woord
  opties: string[] // beginklank: letters; anders: woorden
  antwoord: string
}

const woordVan = (w: string) => WOORDEN.find((x) => x.woord === w)!

/** Korte woorden voor hakken/lezen, liefst alleen met letters die hij kent. */
function korteWoorden(letters: string[]) {
  const kort = WOORDEN.filter((w) => w.klanken)
  const bekend = kort.filter((w) => [...w.woord].every((c) => letters.includes(c)))
  return bekend.length >= 3 ? bekend : kort
}

/** Verschillende opties: het antwoord plus twee (of drie, op de hoge trede) andere, door elkaar. */
function drie(antwoord: string, anderen: string[], aantal = 3): string[] {
  const extra = schud(anderen.filter((x) => x !== antwoord)).slice(0, aantal - 1)
  return schud([antwoord, ...extra])
}

export function maakLetterTaak(soort: LetterSoort, gekozen: string[], vorige?: LetterTaak, trede = 0): LetterTaak {
  const letters = gekozen.length ? gekozen : STANDAARD_LETTERS
  const aantal = trede > 0 ? 4 : 3 // hoge trede: 4 keuzes
  for (let poging = 0; ; poging++) {
    let taak: LetterTaak
    if (soort === 'beginklank' || soort === 'herkennen') {
      const woord = kies(WOORDEN.filter((w) => letters.includes(beginletter(w))))
      const letter = beginletter(woord)
      if (soort === 'beginklank') {
        // foute letters liefst uit de letters die hij kent
        const andere = letters.length >= 3 ? letters : ALLE_LETTERS
        taak = { soort, woord, letter, opties: drie(letter, andere, aantal), antwoord: letter }
      } else {
        const andereWoorden = WOORDEN.filter((w) => beginletter(w) !== letter)
        const voorkeur = andereWoorden.filter((w) => letters.includes(beginletter(w)))
        const pool = (voorkeur.length >= 2 ? voorkeur : andereWoorden).map((w) => w.woord)
        // nooit twee foute plaatjes met dezelfde beginletter
        const uniek = [...new Map(schud(pool).map((w) => [w[0], w])).values()]
        taak = { soort, woord, letter, opties: drie(woord.woord, uniek, aantal), antwoord: woord.woord }
      }
    } else {
      const pool = korteWoorden(letters)
      const woord = kies(pool)
      taak = {
        soort,
        woord,
        letter: beginletter(woord),
        opties: drie(woord.woord, (pool.length >= 3 ? pool : WOORDEN.filter((w) => w.klanken)).map((w) => w.woord), aantal),
        antwoord: woord.woord,
      }
    }
    if (!vorige || vorige.woord.woord !== taak.woord.woord || poging > 5) return taak
  }
}

export const optieWoord = (w: string) => woordVan(w)

/** Wat de ijzerheld hardop zegt bij een opdracht. */
export function letterVraag(t: LetterTaak): string {
  switch (t.soort) {
    case 'beginklank':
      return `Waarmee begint ${t.woord.woord}?`
    case 'herkennen':
      return 'Welk plaatje begint met deze letter?'
    case 'hakken':
      return 'Luister goed. Welk plaatje hoor je?'
    case 'lezen':
      return 'Lees het woord. Welk plaatje hoort erbij?'
  }
}

/**
 * Hoe de iPad-stem een losse klank zo goed mogelijk uitspreekt (geen lettersnaam).
 * Niet perfect: daarom kan de ouder de klanken ook zelf opnemen.
 */
export const KLANK_UITSPRAAK: Record<string, string> = {
  a: 'ah', e: 'eh', i: 'ih', o: 'oh', u: 'uh',
  aa: 'aa', ee: 'ee', oo: 'oo', uu: 'uu', oe: 'oe', ie: 'ie', eu: 'eu', ui: 'ui', ei: 'ei',
  b: 'buh', d: 'duh', f: 'fff', g: 'ggg', h: 'hhh', j: 'juh', k: 'kuh', l: 'lll', m: 'mmm',
  n: 'nnn', p: 'puh', r: 'rrr', s: 'sss', t: 'tuh', v: 'vvv', w: 'wuh', z: 'zzz',
}
