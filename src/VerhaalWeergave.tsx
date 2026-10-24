// Weergave van de avonturen: verhaalplaatjes, de te redden dingen, de schurk,
// het tekstwolkje en de interactieve held.
import { useEffect, useState } from 'react'
import { Held, heeftBeeld, type Humeur, levend } from './figuren'
import type { HeldId } from './opslag'
import type { Pak } from './pakken'
import { type Spreekt, volgSpreken } from './stem'
import type { Verhaal } from './verhalen'

/** Begin- of eindplaatje van een avontuur (met een eenvoudige reserve zolang er geen plaatje is). */
export function VerhaalBeeld({ verhaal, deel, pak }: { verhaal: Verhaal; deel: 'begin' | 'eind'; pak: Pak }) {
  const naam = levend(`verhaal-${verhaal.id}-${deel}.webp`)
  if (heeftBeeld(naam)) return <img className="verhaal-beeld" src={`./beeld/${naam}`} alt={verhaal.schurk} draggable={false} />
  return (
    <div className={`verhaal-beeld verhaal-reserve verhaal-${verhaal.held}`}>
      <Held pak={pak} humeur={deel === 'eind' ? 'blij' : 'normaal'} className="reserve-held" />
      <span className="reserve-schurk">{verhaal.schurk}</span>
    </div>
  )
}

/** Het verhaal als achtergrond: schuift met elke redding van chaos (begin) naar opgelost (eind). */
export function VerhaalAchtergrond({ verhaal, deel }: { verhaal: Verhaal; deel: number }) {
  const begin = levend(`verhaal-${verhaal.id}-begin.webp`)
  const eind = `verhaal-${verhaal.id}-eind.webp`
  return (
    <div className={`verhaal-achtergrond achtergrond-${verhaal.held}`} aria-hidden="true">
      {heeftBeeld(begin) && <img src={`./beeld/${begin}`} alt="" draggable={false} />}
      {heeftBeeld(eind) && <img src={`./beeld/${eind}`} alt="" draggable={false} style={{ opacity: deel }} />}
      <div className="achtergrond-sluier" />
    </div>
  )
}

/** De rij met dingen die gered moeten worden, plus de teller. */
export function Reddingsrij({ verhaal, gered, totaal }: { verhaal: Verhaal; gered: number; totaal: number }) {
  return (
    <div className="reddingsrij" aria-label={`${gered} van de ${totaal} ${verhaal.ding} gered`}>
      <div className="redding-iconen">
        {Array.from({ length: totaal }, (_, i) => (
          <span key={i} className={`redding ${i < gered ? 'gered' : 'kapot'} ${i === gered - 1 ? 'net-gered' : ''}`}>
            {i < gered ? verhaal.icoon : verhaal.icoonKapot}
          </span>
        ))}
      </div>
      <span className="redding-tekst">
        {gered} van de {totaal} {verhaal.ding}
      </span>
    </div>
  )
}

/** De schurk als stripkaart: schudt bij elke redding, wordt geraakt door de superkracht en vlucht aan het eind. */
export function SchurkKaart({ verhaal, schrik, geraakt, verslagen }: { verhaal: Verhaal; schrik: number; geraakt: boolean; verslagen: boolean }) {
  const naam = levend(`schurk-${verhaal.id}.webp`)
  return (
    <div
      key={schrik} // nieuwe sleutel = schud-animatie opnieuw
      className={`schurk-kaart ${schrik > 0 ? 'schurk-schrikt' : ''} ${geraakt ? 'schurk-geraakt' : ''} ${verslagen ? 'schurk-vlucht' : ''}`}
    >
      {heeftBeeld(naam) ? (
        <img src={`./beeld/${naam}`} alt={verhaal.schurk} draggable={false} />
      ) : (
        <span className="schurk-reserve">{verhaal.icoonKapot}</span>
      )}
      <span className="schurk-naam">{verhaal.schurk.replace(/^de /, 'De ')}</span>
    </div>
  )
}

/** Volgt wat er gezegd wordt (voor het tekstwolkje). */
export function useSpreekt(): Spreekt {
  const [spreekt, setSpreekt] = useState<Spreekt>(null)
  useEffect(() => volgSpreken(setSpreekt), [])
  return spreekt
}

/** De held als interactieve kaart: ademt, springt, schudt, en praat met een tekstwolkje. Tikken mag. */
export function HeldKaart({
  pak,
  humeur,
  reactie,
  spreekt,
  onTik,
}: {
  pak: Pak
  humeur: Humeur
  reactie: 'spring' | 'schud' | ''
  spreekt: Spreekt
  onTik: () => void
}) {
  const praat = spreekt && spreekt.held === pak.held ? spreekt.tekst : ''
  return (
    <button className={`held-kaart ${reactie}`} onClick={onTik} aria-label="Tik op de held">
      <Held pak={pak} humeur={humeur} className="held-klein adem" />
      {praat && (
        <span className="tekstwolk" key={praat}>
          {praat}
        </span>
      )}
    </button>
  )
}

/** Superkracht over het hele scherm: een spinnenweb of een laserstraal. */
export function Superkracht({ held }: { held: HeldId }) {
  return (
    <div className={`superkracht kracht-${held}`} aria-hidden="true">
      {held === 'spin' ? (
        <svg viewBox="0 0 200 200" className="kracht-web">
          <g stroke="#fff" strokeWidth={2.5} fill="none">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2
              return <line key={i} x1={100} y1={100} x2={100 + Math.cos(a) * 100} y2={100 + Math.sin(a) * 100} />
            })}
            {[20, 40, 60, 80, 100].map((r) => (
              <circle key={r} cx={100} cy={100} r={r} />
            ))}
          </g>
        </svg>
      ) : (
        <div className="kracht-laser" />
      )}
    </div>
  )
}
