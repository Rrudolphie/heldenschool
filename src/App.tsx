import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import { HoekWeb, Held, type Humeur, Ster } from './figuren'
import { kies, NIVEAU_NAAM, SOMMEN_PER_RONDE, verwerk } from './spel'
import { LETTER_NIVEAU_NAAM } from './letters'
import { bewaar, type Bewaard, type HeldData, type HeldId, heldNaam, laad, toegestaan } from './opslag'
import { huidigeBeurt, nogBezig, stil, zeg, zegKlank, zegKlanken } from './stem'
import { nieuwVrij, type Pak, pakVan, volgendPak } from './pakken'
import { heeftOpname, laadOpnames, ontgrendelGeluid, speel } from './opnames'
import {
  antwoordVan,
  heldVoor,
  maakOpdracht,
  type Opdracht,
  optiesVan,
  soortVan,
  vraagVan,
  type Wereld,
} from './opdracht'
import { SomOpgave, SomOptie } from './SomWeergave'
import { LetterOpgave, LetterOptie } from './LetterWeergave'
import { KastScherm } from './Kast'
import { OudersScherm } from './Ouders'

type Scherm = 'start' | 'spel' | 'klaar' | 'kast' | 'ouders'
type PerHeld = Record<HeldId, number>

const LOF = ['Super!', 'Goed zo!', 'Wauw, knap!', 'Helemaal goed!', 'Top gedaan!']
const LOF_HELD: Record<HeldId, string[]> = { spin: ['Spinnentastisch!'], ijzer: ['IJzersterk!'] }
const OUDER_HOUDEN_MS = 2500
const NUL: PerHeld = { spin: 0, ijzer: 0 }

const NIVEAU_NAMEN: Record<HeldId, string[]> = { spin: NIVEAU_NAAM, ijzer: LETTER_NIVEAU_NAAM }
const wacht = (ms: number) => new Promise((r) => setTimeout(r, ms))

type Updaters = {
  update: (n: Partial<Bewaard>) => void
  updateHeld: (h: HeldId, n: Partial<HeldData>) => void
}

export default function App() {
  const [data, setData] = useState<Bewaard>(laad)
  const [scherm, setScherm] = useState<Scherm>('start')
  const [wereld, setWereld] = useState<Wereld>('rekenen')
  const [rondeSterren, setRondeSterren] = useState<PerHeld>(NUL)
  const [sterrenBijStart, setSterrenBijStart] = useState<PerHeld>(NUL)

  useEffect(() => {
    laadOpnames()
  }, [])

  const update = useCallback((nieuw: Partial<Bewaard>) => {
    setData((d) => {
      const n = { ...d, ...nieuw }
      bewaar(n)
      return n
    })
  }, [])

  const updateHeld = useCallback((h: HeldId, nieuw: Partial<HeldData>) => {
    setData((d) => {
      const n = { ...d, helden: { ...d.helden, [h]: { ...d.helden[h], ...nieuw } } }
      bewaar(n)
      return n
    })
  }, [])

  const start = (w: Wereld) => {
    setWereld(w)
    setRondeSterren(NUL)
    setSterrenBijStart({ spin: data.helden.spin.sterren, ijzer: data.helden.ijzer.sterren })
    setScherm('spel')
  }

  const naarStart = () => {
    stil()
    setScherm('start')
  }

  const pakken: Record<HeldId, Pak> = {
    spin: pakVan('spin', data.helden.spin.pak),
    ijzer: pakVan('ijzer', data.helden.ijzer.pak),
  }

  return (
    <div className="app">
      <HoekWeb className="hoek-lb" />
      <HoekWeb className="hoek-rb" />
      {scherm === 'start' && (
        <StartScherm
          data={data}
          pakken={pakken}
          onStart={start}
          onKast={() => setScherm('kast')}
          onOuders={() => setScherm('ouders')}
        />
      )}
      {scherm === 'spel' && (
        <SpelScherm
          wereld={wereld}
          data={data}
          pakken={pakken}
          updateHeld={updateHeld}
          onSter={(h) => setRondeSterren((s) => ({ ...s, [h]: s[h] + 1 }))}
          onKlaar={() => {
            update({ rondes: data.rondes + 1 })
            setScherm('klaar')
          }}
          onStop={naarStart}
        />
      )}
      {scherm === 'klaar' && (
        <KlaarScherm
          wereld={wereld}
          sterren={rondeSterren}
          naam={data.naam}
          pakken={pakken}
          nieuwePakken={[
            ...nieuwVrij('spin', sterrenBijStart.spin, data.helden.spin.sterren),
            ...nieuwVrij('ijzer', sterrenBijStart.ijzer, data.helden.ijzer.sterren),
          ]}
          onAantrekken={(p) => updateHeld(p.held, { pak: p.id })}
          onNogEen={() => start(wereld)}
          onStop={naarStart}
        />
      )}
      {scherm === 'kast' && <KastScherm data={data} updateHeld={updateHeld} onTerug={naarStart} />}
      {scherm === 'ouders' && (
        <OudersScherm data={data} update={update} updateHeld={updateHeld} onTerug={naarStart} />
      )}
    </div>
  )
}

function StartScherm({
  data,
  pakken,
  onStart,
  onKast,
  onOuders,
}: {
  data: Bewaard
  pakken: Record<HeldId, Pak>
  onStart: (w: Wereld) => void
  onKast: () => void
  onOuders: () => void
}) {
  const begin = (w: Wereld) => {
    // eerste tik ontgrendelt het geluid op de iPad
    ontgrendelGeluid()
    if (heeftOpname('welkom')) speel('welkom')
    else if (w === 'rekenen') zeg(`Hoi! Ik ben ${heldNaam('spin', data.naam)}. Zullen we rekenen?`)
    else if (w === 'letters') zeg(`Hoi! Ik ben ${heldNaam('ijzer', data.naam)}. Zullen we letters oefenen?`)
    else zeg(`${heldNaam('spin', data.naam)} en ${heldNaam('ijzer', data.naam)} gaan samen op missie!`)
    onStart(w)
  }

  return (
    <main className="start">
      <h1 className="titel">Heldenschool</h1>
      <div className="werelden">
        <WereldKaart held="spin" titel="Rekenen" teken="1 2 3" data={data} pak={pakken.spin} onClick={() => begin('rekenen')} />
        <WereldKaart held="ijzer" titel="Letters" teken="a b c" data={data} pak={pakken.ijzer} onClick={() => begin('letters')} />
      </div>
      <div className="start-knoppen">
        <button className="knop-start knop-mix" onClick={() => begin('mix')}>
          🔀 Mix-missie
        </button>
        <button
          className="knop-zacht"
          onClick={() => {
            ontgrendelGeluid()
            onKast()
          }}
        >
          👕 Pakken
        </button>
      </div>
      <OuderSlot onOpen={onOuders} />
    </main>
  )
}

function WereldKaart({
  held,
  titel,
  teken,
  data,
  pak,
  onClick,
}: {
  held: HeldId
  titel: string
  teken: string
  data: Bewaard
  pak: Pak
  onClick: () => void
}) {
  const { sterren } = data.helden[held]
  const volgend = volgendPak(held, sterren)
  return (
    <button className={`wereld wereld-${held}`} onClick={onClick}>
      <Held pak={pak} className="wereld-held zweef" />
      <span className="wereld-titel">
        {titel} <span className="wereld-teken schoolletter">{teken}</span>
      </span>
      <span className="wereld-naam">{heldNaam(held, data.naam)}</span>
      <span className="sterren-teller klein">
        <Ster /> {sterren}
      </span>
      {volgend && (
        <span className="volgend-pak">
          nog {volgend.sterren - sterren} <Ster /> voor een nieuw pak
        </span>
      )}
    </button>
  )
}

/** Kleine slotknop: 2,5 seconde vasthouden opent het ouderscherm (kinderen tikken er snel op en gaan door). */
function OuderSlot({ onOpen }: { onOpen: () => void }) {
  const [houden, setHouden] = useState(false)
  const timer = useRef<number>()
  const los = () => {
    clearTimeout(timer.current)
    setHouden(false)
  }
  return (
    <button
      className={`ouder-slot ${houden ? 'houden' : ''}`}
      style={{ '--duur': `${OUDER_HOUDEN_MS}ms` } as CSSProperties}
      aria-label="Ouderscherm (vasthouden)"
      onPointerDown={() => {
        setHouden(true)
        timer.current = window.setTimeout(() => {
          setHouden(false)
          onOpen()
        }, OUDER_HOUDEN_MS)
      }}
      onPointerUp={los}
      onPointerLeave={los}
      onPointerCancel={los}
      onContextMenu={(e) => e.preventDefault()}
    >
      🔒
    </button>
  )
}

/** De vraag stellen: voorlezen, plus eventueel klanken of een opgenomen klank. */
async function stelVraag(o: Opdracht) {
  if (o.held === 'ijzer' && o.taak.soort === 'herkennen' && heeftOpname(`klank-${o.taak.letter}`)) {
    await zeg('Welk plaatje begint met')
    return speel(`klank-${o.taak.letter}`)
  }
  await zeg(vraagVan(o))
  if (o.held === 'ijzer' && o.taak.soort === 'hakken') await zegKlanken(o.taak.woord.klanken ?? [])
}

function SpelScherm({
  wereld,
  data,
  pakken,
  updateHeld,
  onSter,
  onKlaar,
  onStop,
}: Pick<Updaters, 'updateHeld'> & {
  wereld: Wereld
  data: Bewaard
  pakken: Record<HeldId, Pak>
  onSter: (h: HeldId) => void
  onKlaar: () => void
  onStop: () => void
}) {
  const [opdracht, setOpdracht] = useState<Opdracht>(() => maakOpdracht(heldVoor(wereld, 0), data))
  const [nr, setNr] = useState(0) // welke opdracht in de ronde (0..9)
  const [fouten, setFouten] = useState<string[]>([]) // weggehaalde foute knoppen
  const [licht, setLicht] = useState(0) // hulp: hoeveel spinnetjes geteld / welk klankje
  const [lichtOptie, setLichtOptie] = useState<string | null>(null) // hulp: welk plaatje oplicht
  const [humeur, setHumeur] = useState<Humeur>('normaal')
  const [goed, setGoed] = useState(false)
  const [melding, setMelding] = useState('')
  const dataRef = useRef(data)
  dataRef.current = data

  const held = opdracht.held
  const heldData = data.helden[held]
  const antwoordKey = antwoordVan(opdracht)

  // nieuwe opdracht → voorlezen
  useEffect(() => {
    const t = setTimeout(() => stelVraag(opdracht), 350)
    return () => clearTimeout(t)
  }, [opdracht])

  useEffect(() => () => stil(), [])

  const telStat = (uitkomst: 'goed' | 'fout') => {
    const stats = dataRef.current.helden[held].stats
    const soort = soortVan(opdracht)
    const huidig = stats[soort] ?? { goed: 0, fout: 0 }
    return { ...stats, [soort]: { ...huidig, [uitkomst]: huidig[uitkomst] + 1 } }
  }

  /** Hulp na een fout antwoord, per soort opdracht. */
  const geefHulp = async (nogOver: string[]) => {
    const beurt = huidigeBeurt()
    if (opdracht.held === 'spin') {
      const som = opdracht.som
      if (som.soort === 'cijfers') return zeg(`Bijna! Zoek het web met ${som.a} spinnetjes.`)
      await zeg('Bijna! Tel maar mee.')
      const aantal = som.soort === 'min' ? som.a - som.b : som.soort === 'plus' ? som.a + som.b : som.a
      for (let i = 1; i <= aantal; i++) {
        if (!nogBezig(beurt)) return
        setLicht(i)
        await zeg(String(i), { snelheid: 1 })
      }
      return
    }
    const taak = opdracht.taak
    switch (taak.soort) {
      case 'beginklank':
        await zeg(`Bijna! Luister goed: ${taak.woord.woord}... ${taak.woord.woord}.`, { snelheid: 0.7 })
        if (nogBezig(beurt) && heeftOpname(`klank-${taak.letter}`)) await zegKlank(taak.letter)
        return
      case 'herkennen':
        // elk plaatje langzaam noemen: dan hoort hij de beginklank
        await zeg('Bijna! Luister maar.')
        for (const w of nogOver) {
          if (!nogBezig(beurt)) return
          setLichtOptie(w)
          await zeg(w, { snelheid: 0.7 })
          await wacht(300)
        }
        if (nogBezig(beurt)) setLichtOptie(null)
        return
      case 'hakken':
        await zeg('Bijna! Luister nog een keer.')
        return zegKlanken(taak.woord.klanken ?? [], 700)
      case 'lezen':
        await zeg('Bijna! We hakken het woord samen.')
        await zegKlanken(taak.woord.klanken ?? [], 500, (i) => setLicht(i + 1))
        return
    }
  }

  const antwoord = (keuze: string) => {
    if (goed) return
    stil()
    const eersteKeer = fouten.length === 0
    const toe = toegestaan(held, dataRef.current)

    if (keuze !== antwoordKey) {
      const nieuweFouten = [...fouten, keuze]
      setFouten(nieuweFouten)
      setHumeur('denk')
      setLicht(0)
      setLichtOptie(null)
      if (eersteKeer) {
        const v = verwerk(dataRef.current.helden[held], false, toe)
        updateHeld(held, { niveau: v.niveau, goedOpRij: v.goedOpRij, foutOpRij: v.foutOpRij, stats: telStat('fout') })
      }
      geefHulp(optiesVan(opdracht).filter((o) => !nieuweFouten.includes(o)))
      return
    }

    // goed!
    setGoed(true)
    setHumeur('blij')
    setLichtOptie(null)
    onSter(held)
    let tekst = kies([...LOF, ...LOF_HELD[held]])
    let nieuwNiveau = false
    const nieuw: Partial<HeldData> = { sterren: dataRef.current.helden[held].sterren + 1 }
    if (eersteKeer) {
      const v = verwerk(dataRef.current.helden[held], true, toe)
      Object.assign(nieuw, { niveau: v.niveau, goedOpRij: v.goedOpRij, foutOpRij: v.foutOpRij, stats: telStat('goed') })
      if (v.veranderd === 1) {
        nieuwNiveau = true
        tekst += ` Je bent naar een nieuw niveau: ${NIVEAU_NAMEN[held][v.niveau]}!`
        setMelding(`Nieuw niveau: ${NIVEAU_NAMEN[held][v.niveau]}!`)
      }
    }
    updateHeld(held, nieuw)

    // eigen opnames af en toe gebruiken, afgewisseld met de iPad-stem
    const opnames = ['lof1', 'lof2', 'lof3'].filter(heeftOpname)
    const lof = !nieuwNiveau && opnames.length && Math.random() < 0.6 ? speel(kies(opnames)) : zeg(tekst)

    lof.then(() => {
      setTimeout(() => {
        if (nr + 1 >= SOMMEN_PER_RONDE) return onKlaar()
        setNr(nr + 1)
        // dataRef is inmiddels bijgewerkt met het eventuele nieuwe niveau
        setOpdracht((vorige) => maakOpdracht(heldVoor(wereld, nr + 1), dataRef.current, vorige))
        setFouten([])
        setLicht(0)
        setGoed(false)
        setHumeur('normaal')
        setMelding('')
      }, 300)
    })
  }

  const breed = opdracht.held === 'spin' ? opdracht.som.soort === 'cijfers' : opdracht.taak.soort !== 'beginklank'

  return (
    <main className={`spel spel-${held}`}>
      <header className="balk">
        <button className="knop-rond" onClick={onStop} aria-label="Naar het begin">
          🏠
        </button>
        <div className="voortgang" aria-label={`Opdracht ${nr + 1} van ${SOMMEN_PER_RONDE}`}>
          {Array.from({ length: SOMMEN_PER_RONDE }, (_, i) => (
            <span
              key={i}
              className={`stip stip-${heldVoor(wereld, i)} ${i < nr || (i === nr && goed) ? 'stip-af' : ''} ${i === nr ? 'stip-nu' : ''}`}
            />
          ))}
        </div>
        <div className="sterren-teller klein">
          <Ster className={goed ? 'ster-pop' : ''} /> <span>{heldData.sterren}</span>
        </div>
        <button
          className="knop-rond"
          onClick={() => {
            stil()
            stelVraag(opdracht)
          }}
          aria-label="Nog een keer voorlezen"
        >
          🔊
        </button>
      </header>

      {melding && <div className="melding">{melding}</div>}

      <section className="speelveld">
        <Held humeur={humeur} pak={pakken[held]} className={`held-klein ${goed ? 'spring' : ''}`} />
        <div className="opgave">
          {opdracht.held === 'spin' ? (
            <SomOpgave som={opdracht.som} licht={licht} />
          ) : (
            <LetterOpgave taak={opdracht.taak} licht={licht} />
          )}
        </div>
      </section>

      <section className={`keuzes ${breed ? 'keuzes-webben' : ''}`}>
        {optiesVan(opdracht).map((o) =>
          fouten.includes(o) ? (
            <span key={o} className="knop-keuze leeg" />
          ) : (
            <button
              key={o}
              className={`knop-keuze ${goed && o === antwoordKey ? 'knop-goed' : ''} ${lichtOptie === o ? 'knop-licht' : ''}`}
              onClick={() => antwoord(o)}
            >
              {opdracht.held === 'spin' ? (
                <SomOptie som={opdracht.som} optie={o} />
              ) : (
                <LetterOptie taak={opdracht.taak} optie={o} />
              )}
            </button>
          ),
        )}
      </section>
    </main>
  )
}

function KlaarScherm({
  wereld,
  sterren,
  naam,
  pakken,
  nieuwePakken,
  onAantrekken,
  onNogEen,
  onStop,
}: {
  wereld: Wereld
  sterren: PerHeld
  naam: string
  pakken: Record<HeldId, Pak>
  nieuwePakken: Pak[]
  onAantrekken: (p: Pak) => void
  onNogEen: () => void
  onStop: () => void
}) {
  // het nieuwste vrijgespeelde pak laten zien (als er een is)
  const [nieuw] = useState(() => nieuwePakken[nieuwePakken.length - 1])
  const [aangetrokken, setAangetrokken] = useState(false)
  const totaal = sterren.spin + sterren.ijzer
  const helden: HeldId[] = wereld === 'rekenen' ? ['spin'] : wereld === 'letters' ? ['ijzer'] : ['spin', 'ijzer']

  useEffect(() => {
    const beurt = huidigeBeurt()
    const gezegd = heeftOpname('klaar')
      ? speel('klaar').then(() => zeg(`Je hebt ${totaal} sterren verdiend.`))
      : zeg(`Missie klaar! Je hebt ${totaal} sterren verdiend. Dankjewel, ${naam || 'superheld'}!`)
    if (nieuw)
      gezegd.then(() => {
        if (nogBezig(beurt)) zeg(`En je hebt een nieuw pak vrijgespeeld: ${nieuw.naam}! Wil je het aantrekken?`)
      })
  }, []) // alleen bij het openen van het scherm

  return (
    <main className="klaar">
      <Confetti />
      <h1 className="titel">Missie klaar!</h1>
      {nieuw && <div className="nieuw-pak">Nieuw pak: {nieuw.naam}!</div>}
      <div className="klaar-helden">
        {nieuw ? (
          <Held humeur="blij" pak={nieuw} className="held-groot spring-steeds" />
        ) : (
          helden.map((h) => <Held key={h} humeur="blij" pak={pakken[h]} className="held-groot spring-steeds" />)
        )}
      </div>
      {nieuw && !aangetrokken && (
        <button
          className="knop-zacht geel"
          onClick={() => {
            stil()
            onAantrekken(nieuw)
            setAangetrokken(true)
            zeg(`Je draagt nu het pak ${nieuw.naam}!`)
          }}
        >
          👕 Aantrekken!
        </button>
      )}
      <div className="ronde-sterren">
        {Array.from({ length: totaal }, (_, i) => (
          <Ster key={i} className="ster-in" />
        ))}
      </div>
      <div className="klaar-knoppen">
        <button className="knop-start" onClick={onNogEen}>
          Nog een missie!
        </button>
        <button className="knop-zacht" onClick={onStop}>
          Stoppen
        </button>
      </div>
    </main>
  )
}

function Confetti() {
  const kleuren = ['#e11d2a', '#1d4ed8', '#facc15', '#16a34a', '#fff']
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 40 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: kleuren[i % kleuren.length],
            animationDelay: `${(i % 10) * 0.15}s`,
            animationDuration: `${2.2 + (i % 5) * 0.4}s`,
          }}
        />
      ))}
    </div>
  )
}
