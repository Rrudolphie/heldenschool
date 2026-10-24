// Ouderscherm: naam, niveaus, letters, voortgang en eigen stemopnames. Alles blijft op dit apparaat.
import { useEffect, useRef, useState } from 'react'
import { NIVEAU_NAAM, NIVEAUS, speelNiveau } from './spel'
import { ALLE_KLANKEN, ALLE_LETTERS, LETTER_NIVEAU_NAAM, LETTER_NIVEAUS } from './letters'
import { type Bewaard, type HeldData, type HeldId, heldNaam, legeHelden, toegestaan } from './opslag'
import {
  bewaarOpname,
  heeftOpname,
  kanOpnemen,
  MAX_SECONDEN,
  OPNAMES,
  speel,
  startOpname,
  verwijderOpname,
} from './opnames'
import { stil } from './stem'

export function OudersScherm({
  data,
  update,
  updateHeld,
  onTerug,
}: {
  data: Bewaard
  update: (n: Partial<Bewaard>) => void
  updateHeld: (h: HeldId, n: Partial<HeldData>) => void
  onTerug: () => void
}) {
  const zetLetter = (l: string) => {
    const aan = data.letters.includes(l)
    if (aan && data.letters.length === 1) return // minstens één letter
    update({ letters: aan ? data.letters.filter((x) => x !== l) : [...data.letters, l].sort() })
  }

  return (
    <main className="ouders">
      <header className="ouders-kop">
        <h1>Ouderscherm</h1>
        <button className="knop-zacht donker" onClick={onTerug}>
          Klaar
        </button>
      </header>

      <section className="ouders-blok">
        <h2>Naam</h2>
        <label className="naam-veld">
          <input
            value={data.naam}
            maxLength={16}
            placeholder="naam van je kind"
            onChange={(e) => update({ naam: e.target.value.trim() ? e.target.value : '' })}
          />
        </label>
        <p className="uitleg">
          De helden heten dan {heldNaam('spin', data.naam)} en {heldNaam('ijzer', data.naam)}. De naam blijft alleen op deze
          iPad.
        </p>
      </section>

      <section className="ouders-blok">
        <h2>Rekenen · spinnenheld</h2>
        <NiveauKeuze held="spin" namen={NIVEAU_NAAM} data={data} updateHeld={updateHeld} />
        <Voortgang held="spin" soorten={NIVEAUS} namen={NIVEAU_NAAM} data={data} />
      </section>

      <section className="ouders-blok">
        <h2>Letters · ijzerheld</h2>
        <h3>Welke letters kent hij al?</h3>
        <div className="letter-raster">
          {ALLE_LETTERS.map((l) => (
            <button
              key={l}
              className={`letter-knop schoolletter ${data.letters.includes(l) ? 'gekozen' : ''}`}
              onClick={() => zetLetter(l)}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="uitleg">
          {data.letters.length} letters gekozen. Alleen deze letters worden geoefend. (De q, x en y ontbreken: daar zijn geen
          goede woorden voor kleuters bij.)
        </p>

        <h3>Moeilijkere oefeningen</h3>
        <Schakelaar
          aan={data.hakkenAan}
          onChange={(v) => update({ hakkenAan: v })}
          titel="Hakken en plakken"
          uitleg="Hij hoort 'm – aa – n' en kiest het plaatje."
        />
        <Schakelaar
          aan={data.lezenAan}
          onChange={(v) => update({ lezenAan: v })}
          titel="Woordjes lezen"
          uitleg="Hij leest een kort woord en kiest het plaatje. Zet dit pas aan als hij kan lezen."
        />

        <h3>Niveau</h3>
        <NiveauKeuze held="ijzer" namen={LETTER_NIVEAU_NAAM} data={data} updateHeld={updateHeld} />
        <Voortgang held="ijzer" soorten={LETTER_NIVEAUS} namen={LETTER_NIVEAU_NAAM} data={data} />
      </section>

      <section className="ouders-blok">
        <h2>Eigen stem</h2>
        {kanOpnemen() ? (
          <>
            <p className="uitleg">
              Neem de naam van je kind en eventueel een paar zinnetjes op met je eigen stem (max. {MAX_SECONDEN} seconden).
              De helden gebruiken ze tussen hun eigen zinnen door. Ze blijven alleen op deze iPad.
            </p>
            {OPNAMES.map((o) => (
              <OpnameRij key={o.id} id={o.id} titel={o.titel} voorbeeld={o.voorbeeld} />
            ))}
          </>
        ) : (
          <p className="uitleg">Opnemen werkt niet in deze browser. Open de app in Safari op de iPad.</p>
        )}
      </section>

      {kanOpnemen() && (
        <section className="ouders-blok">
          <h2>Klanken</h2>
          <p className="uitleg">
            Spreek de klanken uit zoals op school: "mmm", niet "em". Ze worden gebruikt bij hakken en plakken, woordjes lezen
            en bij de hulp. Zonder opname doet de iPad-stem zijn best.
          </p>
          <details>
            <summary>Klanken opnemen ({ALLE_KLANKEN.filter((k) => heeftOpname(`klank-${k}`)).length} van {ALLE_KLANKEN.length})</summary>
            {ALLE_KLANKEN.map((k) => (
              <OpnameRij key={k} id={`klank-${k}`} titel={k} voorbeeld="" groot />
            ))}
          </details>
        </section>
      )}

      <section className="ouders-blok">
        <h2>Opnieuw beginnen</h2>
        <button
          className="knop-gevaar"
          onClick={() => {
            if (confirm('Sterren, pakken, niveaus en voortgang van beide helden terugzetten naar nul? Naam, letters en opnames blijven bewaard.'))
              update({ helden: legeHelden(), rondes: 0 })
          }}
        >
          Voortgang wissen
        </button>
      </section>
    </main>
  )
}

function Schakelaar({
  aan,
  onChange,
  titel,
  uitleg,
}: {
  aan: boolean
  onChange: (v: boolean) => void
  titel: string
  uitleg: string
}) {
  return (
    <label className="schakelaar-rij">
      <span>
        <strong>{titel}</strong>
        <span className="uitleg">{uitleg}</span>
      </span>
      <input type="checkbox" className="schakelaar" checked={aan} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

function NiveauKeuze({
  held,
  namen,
  data,
  updateHeld,
}: {
  held: HeldId
  namen: string[]
  data: Bewaard
  updateHeld: (h: HeldId, n: Partial<HeldData>) => void
}) {
  const toe = toegestaan(held, data)
  const nu = speelNiveau(data.helden[held].niveau, toe)
  return (
    <>
      <div className="niveau-knoppen">
        {namen.map((naam, i) => (
          <button
            key={naam}
            className={`niveau-knop ${nu === i ? 'gekozen' : ''}`}
            disabled={!toe.includes(i)}
            onClick={() => updateHeld(held, { niveau: i, goedOpRij: 0, foutOpRij: 0 })}
          >
            {naam}
          </button>
        ))}
      </div>
      <p className="uitleg">Het niveau past zich ook vanzelf aan: 5 keer in één keer goed is omhoog, 3 keer fout op rij is omlaag.</p>
    </>
  )
}

function Voortgang({ held, soorten, namen, data }: { held: HeldId; soorten: string[]; namen: string[]; data: Bewaard }) {
  const h = data.helden[held]
  return (
    <>
      <p className="uitleg">{h.sterren} sterren verdiend</p>
      {soorten.map((soort, i) => {
        const { goed, fout } = h.stats[soort] ?? { goed: 0, fout: 0 }
        const totaal = goed + fout
        const pct = totaal ? Math.round((goed / totaal) * 100) : 0
        const moeite = totaal >= 5 && pct < 60
        return (
          <div key={soort} className="stat-rij">
            <span className="stat-naam">{namen[i]}</span>
            <div className="stat-balk">
              <div className={`stat-vulling ${moeite ? 'moeite' : ''}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="stat-tekst">
              {totaal ? `${goed} van ${totaal} in één keer goed` : 'nog niet geoefend'}
              {moeite && ' · hier heeft hij nog moeite mee'}
            </span>
          </div>
        )
      })}
    </>
  )
}

function OpnameRij({ id, titel, voorbeeld, groot = false }: { id: string; titel: string; voorbeeld: string; groot?: boolean }) {
  const [heeft, setHeeft] = useState(() => heeftOpname(id))
  const [bezig, setBezig] = useState(false)
  const [tijd, setTijd] = useState(0)
  const [fout, setFout] = useState('')
  const stopRef = useRef<() => void>()

  useEffect(() => {
    if (!bezig) return
    const t = setInterval(() => setTijd((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [bezig])

  const opnemen = async () => {
    if (bezig) return stopRef.current?.()
    stil()
    setFout('')
    try {
      const { stop, klaar } = await startOpname()
      stopRef.current = stop
      setTijd(0)
      setBezig(true)
      const blob = await klaar
      setBezig(false)
      await bewaarOpname(id, blob)
      setHeeft(true)
      speel(id)
    } catch {
      setBezig(false)
      setFout('Geen toegang tot de microfoon. Sta de microfoon toe in Safari en probeer opnieuw.')
    }
  }

  return (
    <div className="opname-rij">
      <div className="opname-tekst">
        <strong className={groot ? 'schoolletter klank-titel' : ''}>{titel}</strong>
        {voorbeeld && <span>{voorbeeld}</span>}
        {fout && <span className="fout">{fout}</span>}
      </div>
      <button className={`knop-mini ${bezig ? 'opnemen' : ''}`} onClick={opnemen}>
        {bezig ? `⏹ Stop (${MAX_SECONDEN - tijd})` : heeft ? '⏺ Opnieuw' : '⏺ Opnemen'}
      </button>
      <button className="knop-mini" disabled={!heeft || bezig} onClick={() => speel(id)}>
        ▶︎
      </button>
      <button
        className="knop-mini"
        disabled={!heeft || bezig}
        onClick={async () => {
          await verwijderOpname(id)
          setHeeft(false)
        }}
        aria-label="Verwijderen"
      >
        🗑
      </button>
    </div>
  )
}
