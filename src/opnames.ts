// Eigen stemopnames: opnemen met de microfoon, bewaren op dit apparaat (IndexedDB)
// en afspelen. Er gaat niets naar internet.

export type Opname = { id: string; titel: string; voorbeeld: string }

export const OPNAMES: Opname[] = [
  { id: 'welkom', titel: 'Welkom', voorbeeld: 'Hoi! Zullen we samen rekenen?' },
  { id: 'lof1', titel: 'Compliment 1', voorbeeld: 'Super gedaan!' },
  { id: 'lof2', titel: 'Compliment 2', voorbeeld: 'Wauw, wat knap!' },
  { id: 'lof3', titel: 'Compliment 3', voorbeeld: 'Jij bent een echte rekenheld!' },
  { id: 'klaar', titel: 'Missie klaar', voorbeeld: 'Missie klaar! Ik ben trots op je!' },
]

export const MAX_SECONDEN = 5

const DB = 'spider-sommen'
const STORE = 'opnames'
const geheugen = new Map<string, Blob>()

function open(): Promise<IDBDatabase> {
  return new Promise((ok, fout) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => ok(req.result)
    req.onerror = () => fout(req.error)
  })
}

async function transactie(modus: IDBTransactionMode, actie: (s: IDBObjectStore) => void) {
  const db = await open()
  return new Promise<void>((ok, fout) => {
    const tx = db.transaction(STORE, modus)
    actie(tx.objectStore(STORE))
    tx.oncomplete = () => ok()
    tx.onerror = () => fout(tx.error)
  })
}

/** Laad alle opnames in het geheugen (één keer bij het opstarten). */
export async function laadOpnames() {
  try {
    const db = await open()
    await new Promise<void>((ok) => {
      const req = db.transaction(STORE).objectStore(STORE).openCursor()
      req.onsuccess = () => {
        const c = req.result
        if (!c) return ok()
        geheugen.set(String(c.key), c.value as Blob)
        c.continue()
      }
      req.onerror = () => ok()
    })
  } catch {
    // geen opslag beschikbaar: dan gewoon de iPad-stem
  }
}

export const heeftOpname = (id: string) => geheugen.has(id)

export async function bewaarOpname(id: string, blob: Blob) {
  geheugen.set(id, blob)
  await transactie('readwrite', (s) => s.put(blob, id))
}

export async function verwijderOpname(id: string) {
  geheugen.delete(id)
  await transactie('readwrite', (s) => s.delete(id))
}

// ---------- afspelen ----------

// Eén vaste speler: op de iPad mag geluid pas na een tik, en een speler die al
// een keer na een tik speelde, mag daarna ook vanzelf spelen.
const speler = new Audio()
let huidigeUrl = ''

/** Een piepklein stil geluidje om de speler bij de eerste tik te ontgrendelen. */
function stilGeluid() {
  const buf = new ArrayBuffer(46)
  const v = new DataView(buf)
  const tekst = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
  tekst(0, 'RIFF')
  v.setUint32(4, 38, true)
  tekst(8, 'WAVE')
  tekst(12, 'fmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true) // PCM
  v.setUint16(22, 1, true) // mono
  v.setUint32(24, 8000, true)
  v.setUint32(28, 16000, true)
  v.setUint16(32, 2, true)
  v.setUint16(34, 16, true)
  tekst(36, 'data')
  v.setUint32(40, 2, true)
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}

let ontgrendeld = false
export function ontgrendelGeluid() {
  if (ontgrendeld) return
  ontgrendeld = true
  speler.src = stilGeluid()
  speler.play().catch(() => {})
}

export function stopSpeler() {
  speler.pause()
}

/** Speel een opname af; de promise is klaar als hij uit is. */
export function speel(id: string | Blob): Promise<void> {
  const blob = typeof id === 'string' ? geheugen.get(id) : id
  if (!blob) return Promise.resolve()
  if (huidigeUrl) URL.revokeObjectURL(huidigeUrl)
  huidigeUrl = URL.createObjectURL(blob)
  speler.src = huidigeUrl
  return new Promise((klaar) => {
    const einde = () => {
      speler.onended = null
      speler.onerror = null
      speler.onpause = null
      klaar()
    }
    speler.onended = einde
    speler.onerror = einde
    speler.onpause = einde
    speler.play().catch(einde)
  })
}

// ---------- opnemen ----------

export const kanOpnemen = () => !!navigator.mediaDevices?.getUserMedia && 'MediaRecorder' in window

/** Start een opname. Roep stop() aan (of wacht MAX_SECONDEN) voor het resultaat. */
export async function startOpname(): Promise<{ stop: () => void; klaar: Promise<Blob> }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const type = ['audio/mp4', 'audio/webm', 'audio/ogg'].find((t) => MediaRecorder.isTypeSupported(t))
  const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined)
  const stukjes: Blob[] = []
  rec.ondataavailable = (e) => e.data.size && stukjes.push(e.data)
  const klaar = new Promise<Blob>((ok) => {
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      ok(new Blob(stukjes, { type: rec.mimeType || type || 'audio/mp4' }))
    }
  })
  rec.start()
  const stop = () => rec.state !== 'inactive' && rec.stop()
  setTimeout(stop, MAX_SECONDEN * 1000)
  return { stop, klaar }
}
