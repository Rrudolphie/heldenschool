import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react'
import { HoekWeb, Held, type Humeur, Spinnetje, Ster } from './figuren'
import { maakSom, NIVEAU_NAAM, NIVEAUS, type Som, SOMMEN_PER_RONDE, verwerk, vraagTekst } from './spel'
import { bewaar, laad, type Bewaard } from './opslag'
import { huidigeBeurt, nogBezig, stil, zeg } from './stem'
import { nieuwVrij, type Pak, pakVan, volgendPak } from './pakken'
import { heeftOpname, laadOpnames, ontgrendelGeluid, speel } from './opnames'
import { KastScherm } from './Kast'
import { OudersScherm } from './Ouders'

type Scherm = 'start' | 'spel' | 'klaar' | 'kast' | 'ouders'

const LOF = ['Super!', 'Goed zo!', 'Spinnentastisch!', 'Wauw, knap!', 'Helemaal goed!', 'Top gedaan!']
const OUDER_HOUDEN_MS = 2500
// plussommen: twee duidelijk verschillende kleuren, net als het pak van de held
const EERSTE_KLEUR = '#e11d2a'
const TWEEDE_KLEUR = '#2563eb'

const kies = <T,>(l: T[]) => l[Math.floor(Math.random() * l.length)]
const heldNaam = (naam: string) => (naam ? `Spider-${naam}` : 'Spider-held')

export default function App() {
  const [data, setData] = useState<Bewaard>(laad)
  const [scherm, setScherm] = useState<Scherm>('start')
  const [rondeSterren, setRondeSterren] = useState(0)
  const [sterrenBijStart, setSterrenBijStart] = useState(0)

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

  const start = () => {
    setRondeSterren(0)
    setSterrenBijStart(data.sterren)
    setScherm('spel')
  }

  const naarStart = () => {
    stil()
    setScherm('start')
  }

  const pak = pakVan(data.pak)

  return (
    <div className="app">
      <HoekWeb className="hoek-lb" />
      <HoekWeb className="hoek-rb" />
      {scherm === 'start' && (
        <StartScherm data={data} pak={pak} onStart={start} onKast={() => setScherm('kast')} onOuders={() => setScherm('ouders')} />
      )}
      {scherm === 'spel' && (
        <SpelScherm
          data={data}
          pak={pak}
          update={update}
          onSter={() => setRondeSterren((s) => s + 1)}
          onKlaar={() => {
            update({ rondes: data.rondes + 1 })
            setScherm('klaar')
          }}
          onStop={naarStart}
        />
      )}
      {scherm === 'klaar' && (
        <KlaarScherm
          sterren={rondeSterren}
          naam={data.naam}
          pak={pak}
          nieuwePakken={nieuwVrij(sterrenBijStart, data.sterren)}
          onAantrekken={(p) => update({ pak: p.id })}
          onNogEen={start}
          onStop={naarStart}
        />
      )}
      {scherm === 'kast' && <KastScherm data={data} update={update} onTerug={naarStart} />}
      {scherm === 'ouders' && <OudersScherm data={data} update={update} onTerug={naarStart} />}
    </div>
  )
}

function StartScherm({
  data,
  pak,
  onStart,
  onKast,
  onOuders,
}: {
  data: Bewaard
  pak: Pak
  onStart: () => void
  onKast: () => void
  onOuders: () => void
}) {
  const volgend = volgendPak(data.sterren)
  return (
    <main className="start">
      <h1 className="titel">Spider Sommen</h1>
      {data.naam && <p className="held-naam">{heldNaam(data.naam)}</p>}
      <Held humeur="normaal" pak={pak} className="held-groot zweef" />
      <div className="sterren-teller">
        <Ster /> <span>{data.sterren}</span>
      </div>
      {volgend && (
        <p className="volgend-pak">
          Nog {volgend.sterren - data.sterren} <Ster /> voor een nieuw pak
        </p>
      )}
      <div className="start-knoppen">
        <button
          className="knop-start"
          onClick={() => {
            // eerste tik ontgrendelt het geluid op de iPad
            ontgrendelGeluid()
            if (heeftOpname('welkom')) speel('welkom')
            else zeg(`Hoi! Ik ben ${heldNaam(data.naam)}. Help jij mij met rekenen?`)
            onStart()
          }}
        >
          Start missie!
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

function SpelScherm({
  data,
  pak,
  update,
  onSter,
  onKlaar,
  onStop,
}: {
  data: Bewaard
  pak: Pak
  update: (n: Partial<Bewaard>) => void
  onSter: () => void
  onKlaar: () => void
  onStop: () => void
}) {
  const [som, setSom] = useState<Som>(() => maakSom(NIVEAUS[data.niveau]))
  const [nr, setNr] = useState(0) // welke som in de ronde (0..9)
  const [fouten, setFouten] = useState<number[]>([]) // weggehaalde foute knoppen
  const [licht, setLicht] = useState(0) // hoeveel spinnetjes al geteld zijn bij de hulp
  const [humeur, setHumeur] = useState<Humeur>('normaal')
  const [goed, setGoed] = useState(false)
  const [melding, setMelding] = useState('')
  const dataRef = useRef(data)
  dataRef.current = data

  // nieuwe som → voorlezen
  useEffect(() => {
    const t = setTimeout(() => zeg(vraagTekst(som)), 350)
    return () => clearTimeout(t)
  }, [som])

  useEffect(() => () => stil(), [])

  const telStat = (s: Som, uitkomst: 'goed' | 'fout') => {
    const stats = dataRef.current.stats
    return { ...stats, [s.soort]: { ...stats[s.soort], [uitkomst]: stats[s.soort][uitkomst] + 1 } }
  }

  const telMee = async (aantal: number) => {
    const beurt = huidigeBeurt()
    await zeg('Bijna! Tel maar mee.')
    for (let i = 1; i <= aantal; i++) {
      if (!nogBezig(beurt)) return
      setLicht(i)
      await zeg(String(i), { snelheid: 1 })
    }
  }

  const antwoord = (keuze: number) => {
    if (goed) return
    stil()
    const eersteKeer = fouten.length === 0

    if (keuze !== som.antwoord) {
      setFouten((f) => [...f, keuze])
      setHumeur('denk')
      setLicht(0)
      if (eersteKeer) {
        const v = verwerk(dataRef.current, false)
        update({ niveau: v.niveau, goedOpRij: v.goedOpRij, foutOpRij: v.foutOpRij, stats: telStat(som, 'fout') })
      }
      if (som.soort === 'cijfers') zeg(`Bijna! Zoek het web met ${som.a} spinnetjes.`)
      else telMee(som.soort === 'min' ? som.a - som.b : som.a + som.b)
      return
    }

    // goed!
    setGoed(true)
    setHumeur('blij')
    onSter()
    let tekst = kies(LOF)
    let nieuwNiveau = false
    const nieuw: Partial<Bewaard> = { sterren: dataRef.current.sterren + 1 }
    if (eersteKeer) {
      const v = verwerk(dataRef.current, true)
      Object.assign(nieuw, { niveau: v.niveau, goedOpRij: v.goedOpRij, foutOpRij: v.foutOpRij, stats: telStat(som, 'goed') })
      if (v.veranderd === 1) {
        nieuwNiveau = true
        tekst += ` Je bent naar een nieuw niveau: ${NIVEAU_NAAM[v.niveau]}!`
        setMelding(`Nieuw niveau: ${NIVEAU_NAAM[v.niveau]}!`)
      }
    }
    update(nieuw)
    const niveau = nieuw.niveau ?? dataRef.current.niveau

    // eigen opnames af en toe gebruiken, afgewisseld met de iPad-stem
    const opnames = ['lof1', 'lof2', 'lof3'].filter(heeftOpname)
    const lof = !nieuwNiveau && opnames.length && Math.random() < 0.6 ? speel(kies(opnames)) : zeg(tekst)

    lof.then(() => {
      setTimeout(() => {
        if (nr + 1 >= SOMMEN_PER_RONDE) return onKlaar()
        setNr(nr + 1)
        setSom((vorige) => maakSom(NIVEAUS[niveau], vorige))
        setFouten([])
        setLicht(0)
        setGoed(false)
        setHumeur('normaal')
        setMelding('')
      }, 300)
    })
  }

  return (
    <main className="spel">
      <header className="balk">
        <button className="knop-rond" onClick={onStop} aria-label="Naar het begin">
          🏠
        </button>
        <div className="voortgang" aria-label={`Som ${nr + 1} van ${SOMMEN_PER_RONDE}`}>
          {Array.from({ length: SOMMEN_PER_RONDE }, (_, i) => (
            <span key={i} className={`stip ${i < nr || (i === nr && goed) ? 'stip-af' : ''} ${i === nr ? 'stip-nu' : ''}`} />
          ))}
        </div>
        <div className="sterren-teller klein">
          <Ster className={goed ? 'ster-pop' : ''} /> <span>{data.sterren}</span>
        </div>
        <button
          className="knop-rond"
          onClick={() => {
            stil()
            zeg(vraagTekst(som))
          }}
          aria-label="Nog een keer voorlezen"
        >
          🔊
        </button>
      </header>

      {melding && <div className="melding">{melding}</div>}

      <section className="speelveld">
        <Held humeur={humeur} pak={pak} className={`held-klein ${goed ? 'spring' : ''}`} />
        <div className="opgave">
          <Opgave som={som} licht={licht} />
        </div>
      </section>

      <section className={`keuzes ${som.soort === 'cijfers' ? 'keuzes-webben' : ''}`}>
        {som.opties.map((o) =>
          fouten.includes(o) ? (
            <span key={o} className="knop-keuze leeg" />
          ) : (
            <button
              key={o}
              className={`knop-keuze ${goed && o === som.antwoord ? 'knop-goed' : ''}`}
              onClick={() => antwoord(o)}
            >
              {som.soort === 'cijfers' ? <Spinnen aantal={o} kleur={som.kleur} klein /> : o}
            </button>
          ),
        )}
      </section>
    </main>
  )
}

/** Spinnetjes in rijen van 5, zoals een rekenrek. */
function Spinnen({
  aantal,
  kleur,
  klein = false,
  vanaf = 0,
  licht = 0,
  weg = 0,
}: {
  aantal: number
  kleur: string
  klein?: boolean
  vanaf?: number // nummering loopt door vanaf dit getal (voor plussommen)
  licht?: number
  weg?: number // de laatste zoveel slingeren weg (minsommen)
}) {
  return (
    <div
      className={`spinnen ${klein ? 'spinnen-klein' : ''}`}
      style={{ gridTemplateColumns: `repeat(${Math.min(Math.max(aantal, 1), 5)}, var(--s))` }}
    >
      {Array.from({ length: aantal }, (_, i) => {
        const nummer = vanaf + i + 1
        const isWeg = i >= aantal - weg
        const geteld = !isWeg && nummer <= licht
        return <Spinnetje key={i} kleur={kleur} weg={isWeg} licht={geteld} label={geteld ? nummer : undefined} />
      })}
    </div>
  )
}

/** Spingrootte: hoe minder spinnetjes naast elkaar, hoe groter ze worden. */
const kolommen = (n: number) => Math.min(n, 5)
const maat = (kol: number) => ({ '--s': `min(calc(var(--breed) / ${Math.max(kol, 1)}), 15vh)` }) as CSSProperties

function Opgave({ som, licht }: { som: Som; licht: number }) {
  switch (som.soort) {
    case 'tellen':
      return (
        <>
          <p className="vraag">Hoeveel?</p>
          <div style={maat(kolommen(som.a))}>
            <Spinnen aantal={som.a} kleur={som.kleur} licht={licht} />
          </div>
        </>
      )
    case 'cijfers':
      return (
        <>
          <p className="vraag">Waar zitten er</p>
          <div className="groot-cijfer">{som.a}</div>
        </>
      )
    case 'plus':
      return (
        <>
          <p className="som">
            {som.a} + {som.b} = ?
          </p>
          <div className="groepen" style={maat(kolommen(som.a) + kolommen(som.b) + 1)}>
            <Spinnen aantal={som.a} kleur={EERSTE_KLEUR} licht={licht} />
            <span className="teken">+</span>
            <Spinnen aantal={som.b} kleur={TWEEDE_KLEUR} vanaf={som.a} licht={licht} />
          </div>
        </>
      )
    case 'min':
      return (
        <>
          <p className="som">
            {som.a} − {som.b} = ?
          </p>
          <div style={maat(kolommen(som.a))}>
            <Spinnen aantal={som.a} kleur={som.kleur} weg={som.b} licht={licht} />
          </div>
        </>
      )
  }
}

function KlaarScherm({
  sterren,
  naam,
  pak,
  nieuwePakken,
  onAantrekken,
  onNogEen,
  onStop,
}: {
  sterren: number
  naam: string
  pak: Pak
  nieuwePakken: Pak[]
  onAantrekken: (p: Pak) => void
  onNogEen: () => void
  onStop: () => void
}) {
  // het nieuwste vrijgespeelde pak laten zien (als er een is)
  const [nieuw] = useState(() => nieuwePakken[nieuwePakken.length - 1])
  const [aangetrokken, setAangetrokken] = useState(false)

  useEffect(() => {
    const beurt = huidigeBeurt()
    const gezegd = heeftOpname('klaar')
      ? speel('klaar').then(() => zeg(`Je hebt ${sterren} sterren verdiend.`))
      : zeg(`Missie klaar! Je hebt ${sterren} sterren verdiend. Dankjewel, ${naam || 'superheld'}!`)
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
      <Held humeur="blij" pak={nieuw ?? pak} className="held-groot spring-steeds" />
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
        {Array.from({ length: sterren }, (_, i) => (
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
