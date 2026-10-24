// Voorlezen met de Nederlandse stem van het apparaat (Web Speech API).
import { stopSpeler } from './opnames'

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
