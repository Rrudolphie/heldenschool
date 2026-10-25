// Weergave van de avonturen: verhaalplaatjes, de te redden dingen, de schurk,
// het tekstwolkje en de interactieve held.
import { useEffect, useState } from 'react'
import { Held, heeftBeeld, type Humeur } from './figuren'
import type { HeldId } from './opslag'
import type { Pak } from './pakken'
import { type Spreekt, volgSpreken } from './stem'
import type { Verhaal } from './verhalen'

/** Begin- of eindplaatje van een avontuur (met een eenvoudige reserve zolang er geen plaatje is). */
export function VerhaalBeeld({ verhaal, deel, pak }: { verhaal: Verhaal; deel: 'begin' | 'eind'; pak: Pak }) {
  const naam = `verhaal-${verhaal.id}-${deel}.webp`
  // aan het eind juicht de held mee: het goedgekeurde losgeknipte plaatje (de achtergrond zelf heeft geen held)
  if (heeftBeeld(naam) && deel === 'eind')
    return (
      <div className="verhaal-beeld verhaal-eind">
        <img src={`./beeld/${naam}`} alt={verhaal.schurk} draggable={false} />
        <Held pak={pak} humeur="blij" className="eind-held" />
      </div>
    )
  if (heeftBeeld(naam)) return <img className="verhaal-beeld" src={`./beeld/${naam}`} alt={verhaal.schurk} draggable={false} />
  return (
    <div className={`verhaal-beeld verhaal-reserve verhaal-${verhaal.held}`}>
      <Held pak={pak} humeur={deel === 'eind' ? 'blij' : 'normaal'} className="reserve-held" />
      <span className="reserve-schurk">{verhaal.schurk}</span>
    </div>
  )
}

/** Het verhaal als achtergrond: beweegt langzaam (camera schuift en zoomt, zonder flikkeren)
 *  en gaat met elke redding over van chaos (begin) naar opgelost (eind). */
export function VerhaalAchtergrond({ verhaal, deel }: { verhaal: Verhaal; deel: number }) {
  const begin = `verhaal-${verhaal.id}-begin.webp`
  const eind = `verhaal-${verhaal.id}-eind.webp`
  return (
    <div className={`verhaal-achtergrond achtergrond-${verhaal.held}`} aria-hidden="true">
      {heeftBeeld(begin) && <img src={`./beeld/${begin}`} alt="" draggable={false} />}
      {heeftBeeld(eind) && <img src={`./beeld/${eind}`} alt="" draggable={false} style={{ opacity: deel }} />}
      <div className="achtergrond-sluier" />
    </div>
  )
}

/** De voortgang: een rij bolletjes die vollopen, plus de teller (geen losse icoontjes: één strakke stijl). */
export function Reddingsrij({ verhaal, gered, totaal }: { verhaal: Verhaal; gered: number; totaal: number }) {
  return (
    <div className="reddingsrij" aria-label={`${gered} van de ${totaal} ${verhaal.ding} gered`}>
      <div className="redding-iconen">
        {Array.from({ length: totaal }, (_, i) => (
          <span key={i} className={`redding ${i < gered ? 'gered' : 'kapot'} ${i === gered - 1 ? 'net-gered' : ''}`}>
            {i < gered && (
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 10.5 L8.5 14 L15 6.5" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        ))}
      </div>
      <span className="redding-tekst">
        {gered} van de {totaal} {verhaal.ding}
      </span>
    </div>
  )
}

function SchurkFoto({ verhaal }: { verhaal: Verhaal }) {
  const naam = `schurk-${verhaal.id}.webp`
  return heeftBeeld(naam) ? (
    <img src={`./beeld/${naam}`} alt={verhaal.schurk} draggable={false} />
  ) : (
    <span className="schurk-reserve">{verhaal.icoonKapot}</span>
  )
}

/** De schurk (losgeknipt): wiebelt ondeugend, struikelt bij elke treffer en plaagt als je op hem tikt. */
export function SchurkKaart({
  verhaal,
  geraakt,
  weg,
  spreekt,
  onTik,
}: {
  verhaal: Verhaal
  geraakt: number
  weg: boolean
  spreekt: Spreekt
  onTik: () => void
}) {
  const praat = spreekt?.held === 'schurk' ? spreekt.tekst : ''
  return (
    <button className={`schurk-kaart ${weg ? 'schurk-weg' : ''}`} onClick={onTik} aria-label={`Tik op ${verhaal.schurk}`}>
      {/* nieuwe sleutel = struikel-animatie opnieuw */}
      <span key={geraakt} className={`schurk-lijf ${geraakt > 0 ? 'schurk-struikelt' : ''}`}>
        <SchurkFoto verhaal={verhaal} />
      </span>
      <span className="schurk-naam">{verhaal.schurk.replace(/^de /, 'De ')}</span>
      {praat && (
        <span className="tekstwolk tekstwolk-schurk" key={praat}>
          {praat}
        </span>
      )}
    </button>
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

/** Een rond spinnenweb (voor het vangnet en de strip-aanval). */
function Web({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <g stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2
          return <line key={i} x1={100} y1={100} x2={100 + Math.cos(a) * 98} y2={100 + Math.sin(a) * 98} />
        })}
        {[22, 44, 66, 88].map((r) => (
          <circle key={r} cx={100} cy={100} r={r} />
        ))}
      </g>
    </svg>
  )
}

/** Bij elk goed antwoord: een webdraad of laserstraal van de held naar de schurk. */
export function Schot({ held }: { held: HeldId }) {
  return <div className={`schot schot-${held}`} aria-hidden="true" />
}

/** Stripmoment na 3, 6 en 9 goede antwoorden: groot stripvak waarin de held de schurk aanvalt. */
// (een effen stripachtergrond: in de verhaalplaatjes staat de schurk zelf al, dan zie je hem dubbel)
export function Stripmoment({ verhaal, pak, kreet }: { verhaal: Verhaal; pak: Pak; kreet: string }) {
  return (
    <div className="strip" aria-hidden="true">
      <div className={`strip-vak strip-${pak.held}`}>
        <div className="strip-held">
          <Held pak={pak} humeur="blij" className="held-klein" />
        </div>
        {pak.held === 'spin' ? <div className="strip-straal strip-web" /> : <div className="strip-straal strip-laser" />}
        <div className="strip-schurk">
          <SchurkFoto verhaal={verhaal} />
        </div>
        <div className="strip-knal">{pak.held === 'spin' ? 'PATS!' : 'ZOEF!'}</div>
        <div className="strip-kreet">{kreet}</div>
      </div>
    </div>
  )
}

/** Het einde: de schurk raakt gevangen (web of energienet) en de politieauto neemt hem mee. */
export function Vangst({ verhaal, fase }: { verhaal: Verhaal; fase: 'net' | 'politie' }) {
  const auto = heeftBeeld('politieauto.webp')
  return (
    <div className={`strip vangst vangst-${fase}`} aria-hidden="true">
      <div className={`strip-vak strip-${verhaal.held}`}>
        <div className="vangst-rij">
          <div className="vangst-schurk">
            <SchurkFoto verhaal={verhaal} />
            {verhaal.held === 'spin' ? <Web className="vangst-net" /> : <div className="vangst-net vangst-energie" />}
          </div>
          <div className="vangst-auto">
            {auto ? <img src="./beeld/politieauto.webp" alt="" draggable={false} /> : <span className="vangst-auto-reserve">🚓</span>}
            <span className="zwaailicht" />
          </div>
        </div>
        <div className="vangst-tekst">Gevangen!</div>
      </div>
    </div>
  )
}
