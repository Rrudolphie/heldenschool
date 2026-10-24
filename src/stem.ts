// Voorlezen met de Nederlandse stem van het apparaat (Web Speech API).
import { heeftOpname, speel, stopSpeler } from './opnames'
import { KLANK_UITSPRAAK } from './letters'

let stem: SpeechSynthesisVoice | undefined

function kiesStem() {
  const stemmen = speechSynthesis.getVoices().filter((s) => s.lang.toLowerCase().startsWith('nl'))
  // liever nl-NL dan nl-BE, en liever een "verbeterde" stem
  stem =
    stemmen.find((s) => s.lang === 'nl-NL' && /enhanced|premium|verbeterd/i.test(s.name)) ??
    stemmen.find((s) => s.lang === 'nl-NL') ??
    stemmen[0]
}

if ('speechSynthesis' in window) {
  kiesStem()
  speechSynthesis.addEventListener?.('voiceschanged', kiesStem)
}

let beurt = 0

/** Stop wat er nu gezegd of afgespeeld wordt. */
export function stil() {
  beurt++
  if ('speechSynthesis' in window) speechSynthesis.cancel()
  stopSpeler()
}

/** Zeg een zin; de promise is klaar als de zin uit is (of afgebroken). */
export function zeg(tekst: string, { snelheid = 0.95 } = {}): Promise<void> {
  if (!('speechSynthesis' in window)) return Promise.resolve()
  const mijnBeurt = beurt
  return new Promise((klaar) => {
    const u = new SpeechSynthesisUtterance(tekst)
    u.lang = 'nl-NL'
    if (stem) u.voice = stem
    u.rate = snelheid
    u.pitch = 1.1
    let af = false
    const einde = () => {
      if (!af) {
        af = true
        klaar()
      }
    }
    u.onend = einde
    u.onerror = einde
    // vangnet: sommige browsers vergeten 'onend'
    setTimeout(einde, 400 + tekst.length * 110)
    if (mijnBeurt === beurt) speechSynthesis.speak(u)
    else einde()
  })
}

/** Geeft true zolang de huidige reeks niet is afgebroken met stil(). */
export function nogBezig(start: number) {
  return start === beurt
}

export function huidigeBeurt() {
  return beurt
}

const wacht = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Een losse klank: de eigen opname als die er is, anders de iPad-stem zo goed mogelijk. */
export function zegKlank(klank: string, snelheid = 0.8): Promise<void> {
  if (heeftOpname(`klank-${klank}`)) return speel(`klank-${klank}`)
  return zeg(KLANK_UITSPRAAK[klank] ?? klank, { snelheid })
}

/** Klanken na elkaar met een korte pauze (hakken). */
export async function zegKlanken(klanken: string[], pauze = 450, bijElke?: (i: number) => void) {
  const start = beurt
  for (let i = 0; i < klanken.length; i++) {
    if (!nogBezig(start)) return
    bijElke?.(i)
    await zegKlank(klanken[i])
    await wacht(pauze)
  }
}
