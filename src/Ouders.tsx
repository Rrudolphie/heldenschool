// Ouderscherm: naam, niveau, voortgang en eigen stemopnames. Alles blijft op dit apparaat.
import { useEffect, useRef, useState } from 'react'
import { NIVEAU_NAAM, NIVEAUS } from './spel'
import { type Bewaard, START } from './opslag'
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
  onTerug,
}: {
  data: Bewaard
  update: (n: Partial<Bewaard>) => void
  onTerug: () => void
}) {
  return (
    <main className="ouders">
      <header className="ouders-kop">
        <h1>Ouderscherm</h1>
        <button className="knop-zacht donker" onClick={onTerug}>
          Klaar
        </button>
      </header>

      <section className="ouders-blok">
        <h2>Naam van de held</h2>
        <label className="naam-veld">
          Spider-
          <input
            value={data.naam}
            maxLength={16}
            placeholder="naam"
            onChange={(e) => update({ naam: e.target.value.trim() ? e.target.value : '' })}
          />
        </label>
        <p className="uitleg">De naam blijft alleen op deze iPad. De held gebruikt hem bij het begroeten.</p>
      </section>

      <section className="ouders-blok">
        <h2>Niveau</h2>
        <div className="niveau-knoppen">
          {NIVEAU_NAAM.map((naam, i) => (
            <button
              key={naam}
              className={`niveau-knop ${data.niveau === i ? 'gekozen' : ''}`}
              onClick={() => update({ niveau: i, goedOpRij: 0, foutOpRij: 0 })}
            >
              {naam}
            </button>
          ))}
        </div>
        <p className="uitleg">Het niveau past zich ook vanzelf aan: 5 keer in één keer goed is omhoog, 3 keer fout op rij is omlaag.</p>
      </section>

      <section className="ouders-blok">
        <h2>Voortgang</h2>
        <p className="uitleg">
          {data.rondes} {data.rondes === 1 ? 'missie' : 'missies'} gespeeld · {data.sterren} sterren
        </p>
        {NIVEAUS.map((soort, i) => {
          const { goed, fout } = data.stats[soort]
          const totaal = goed + fout
          const pct = totaal ? Math.round((goed / totaal) * 100) : 0
          const moeite = totaal >= 5 && pct < 60
          return (
            <div key={soort} className="stat-rij">
              <span className="stat-naam">{NIVEAU_NAAM[i]}</span>
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
      </section>

      <section className="ouders-blok">
        <h2>Eigen stem</h2>
        {kanOpnemen() ? (
          <>
            <p className="uitleg">
              Neem zinnetjes op met je eigen stem (max. {MAX_SECONDEN} seconden). De held speelt ze af in plaats van de
              iPad-stem. Ze blijven alleen op deze iPad.
            </p>
            {OPNAMES.map((o) => (
              <OpnameRij key={o.id} id={o.id} titel={o.titel} voorbeeld={o.voorbeeld} />
            ))}
          </>
        ) : (
          <p className="uitleg">Opnemen werkt niet in deze browser. Open de app in Safari op de iPad.</p>
        )}
      </section>

      <section className="ouders-blok">
        <h2>Opnieuw beginnen</h2>
        <button
          className="knop-gevaar"
          onClick={() => {
            if (confirm('Sterren, pakken, niveau en voortgang terugzetten naar nul? De naam en opnames blijven bewaard.'))
              update({ ...START, naam: data.naam })
          }}
        >
          Voortgang wissen
        </button>
      </section>
    </main>
  )
}

function OpnameRij({ id, titel, voorbeeld }: { id: string; titel: string; voorbeeld: string }) {
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
        <strong>{titel}</strong>
        <span>bijv. "{voorbeeld}"</span>
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
