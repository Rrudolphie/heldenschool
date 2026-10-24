// De spreker: al het geluid (ingesproken zinnen, eigen opnames, klanken) loopt door
// één wachtrij, zodat er nooit twee geluiden door elkaar klinken.
//
// Zinnen zijn vooraf ingesproken met een AI-stem (scripts/maak-stem.py) en staan in
// public/stem/. Ontbreekt een zin toch, dan valt de spreker terug op de iPad-stem.
import { heeftOpname, ontgrendelGeluid, speel, speelBron, stopSpeler } from './opnames'
import { KLANK_UITSPRAAK } from './letters'
import type { HeldId } from './opslag'

// ---------- vooraf ingesproken zinnen ----------

let zinnen: Record<string, string> = {}

/** Laad de wegwijzer met ingesproken zinnen (één keer bij het opstarten). */
export async function laadStemmen() {
  try {
    zinnen = await (await fetch('./stem/index.json')).json()
  } catch {
    // geen wegwijzer: dan de iPad-stem
  }
}

// ---------- wachtrij ----------

let beurt = 0
let rij: Promise<void> = Promise.resolve()

/** Zet een geluid achteraan in de rij; de promise is klaar als het geklonken heeft (of is overgeslagen). */
function inRij(taak: () => Promise<void>): Promise<void> {
  const mijnBeurt = beurt
  const klaar = rij.then(() => (mijnBeurt === beurt ? taak() : undefined))
  rij = klaar.catch(() => {})
  return rij
}

/** Stop wat er nu klinkt en gooi de rest van de rij weg (bijv. bij een tik op een antwoord). */
export function stil() {
  beurt++
  rij = Promise.resolve()
  if ('speechSynthesis' in window) speechSynthesis.cancel()
  stopSpeler()
}

/** Geeft true zolang de huidige reeks niet is afgebroken met stil(). */
export function nogBezig(start: number) {
  return start === beurt
}

export function huidigeBeurt() {
  return beurt
}

/** Laat een held een zin zeggen (achteraan in de rij). */
export function zeg(tekst: string, held: HeldId = 'spin'): Promise<void> {
  return inRij(() => {
    const bestand = zinnen[`${held}|${tekst}`]
    return bestand ? speelBron(`./stem/${bestand}`) : ipadStem(tekst)
  })
}

/** Speel een eigen opname af (achteraan in de rij). */
export function speelOpname(id: string): Promise<void> {
  return inRij(() => speel(id))
}

const wacht = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Een korte stilte in de rij. */
export function pauze(ms: number): Promise<void> {
  return inRij(() => wacht(ms))
}

/** Een losse klank: de eigen opname als die er is, anders de ingesproken benadering. */
export function zegKlank(klank: string): Promise<void> {
  if (heeftOpname(`klank-${klank}`)) return speelOpname(`klank-${klank}`)
  return zeg(KLANK_UITSPRAAK[klank] ?? klank, 'ijzer')
}

/** Klanken na elkaar met een korte pauze (hakken); bijElke wordt aangeroepen vlak voor elke klank. */
export async function zegKlanken(klanken: string[], tussen = 450, bijElke?: (i: number) => void) {
  const start = beurt
  for (let i = 0; i < klanken.length; i++) {
    await rij // wachten tot alles ervoor geklonken heeft, zodat het oplichten gelijk loopt
    if (!nogBezig(start)) return
    bijElke?.(i)
    await zegKlank(klanken[i])
    await pauze(tussen)
  }
}

// ---------- geluidseffecten (gemaakt met Web Audio, geen bestanden nodig) ----------

let audio: AudioContext | undefined

/** Bij de eerste tik: speler en geluidseffecten ontgrendelen (op de iPad mag geluid pas na een tik). */
export function ontgrendel() {
  ontgrendelGeluid()
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') audio.resume()
  } catch {
    // geen Web Audio: dan geen effecten
  }
}

export type Effect = 'pling' | 'boing' | 'tadaa'

// tonen: [frequentie in Hz, start in s, duur in s]
const EFFECTEN: Record<Effect, { golf: OscillatorType; tonen: [number, number, number][]; glij?: number; volume: number }> = {
  pling: { golf: 'sine', tonen: [[1047, 0, 0.12], [1319, 0.1, 0.28]], volume: 0.25 },
  boing: { golf: 'sine', tonen: [[330, 0, 0.3]], glij: 160, volume: 0.2 },
  tadaa: { golf: 'triangle', tonen: [[523, 0, 0.14], [659, 0.12, 0.14], [784, 0.24, 0.14], [1047, 0.36, 0.5]], volume: 0.22 },
}

function speelEffect(naam: Effect): Promise<void> {
  if (!audio) return Promise.resolve()
  const { golf, tonen, glij, volume } = EFFECTEN[naam]
  const nu = audio.currentTime
  for (const [freq, start, duur] of tonen) {
    const osc = audio.createOscillator()
    const vol = audio.createGain()
    osc.type = golf
    osc.frequency.setValueAtTime(freq, nu + start)
    if (glij) osc.frequency.exponentialRampToValueAtTime(glij, nu + start + duur)
    vol.gain.setValueAtTime(0.0001, nu + start)
    vol.gain.exponentialRampToValueAtTime(volume, nu + start + 0.02)
    vol.gain.exponentialRampToValueAtTime(0.0001, nu + start + duur)
    osc.connect(vol).connect(audio.destination)
    osc.start(nu + start)
    osc.stop(nu + start + duur + 0.05)
  }
  const einde = Math.max(...tonen.map(([, s, d]) => s + d))
  return wacht(einde * 1000)
}

/** Een geluidseffect (achteraan in de rij, dus nooit door een stem heen). */
export function effect(naam: Effect): Promise<void> {
  return inRij(() => speelEffect(naam))
}

// ---------- reserve: de iPad-stem ----------

let ipadVoorkeur: SpeechSynthesisVoice | undefined

function kiesIpadStem() {
  const stemmen = speechSynthesis.getVoices().filter((s) => s.lang.toLowerCase().startsWith('nl'))
  ipadVoorkeur =
    stemmen.find((s) => s.lang === 'nl-NL' && /enhanced|premium|verbeterd/i.test(s.name)) ??
    stemmen.find((s) => s.lang === 'nl-NL') ??
    stemmen[0]
}

if ('speechSynthesis' in window) {
  kiesIpadStem()
  speechSynthesis.addEventListener?.('voiceschanged', kiesIpadStem)
}

function ipadStem(tekst: string): Promise<void> {
  if (!('speechSynthesis' in window)) return Promise.resolve()
  return new Promise((klaar) => {
    const u = new SpeechSynthesisUtterance(tekst)
    u.lang = 'nl-NL'
    if (ipadVoorkeur) u.voice = ipadVoorkeur
    u.rate = 0.95
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
    setTimeout(einde, 400 + tekst.length * 110) // vangnet: sommige browsers vergeten 'onend'
    speechSynthesis.speak(u)
  })
}
