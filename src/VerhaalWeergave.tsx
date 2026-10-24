// Weergave van de avonturen: het verhaalplaatje en het pad naar de schurk.
import { Held, heeftBeeld, Ster } from './figuren'
import type { Pak } from './pakken'
import type { Verhaal } from './verhalen'

/** Begin- of eindplaatje van een avontuur (met een eenvoudige reserve zolang er geen plaatje is). */
export function VerhaalBeeld({ verhaal, deel, pak }: { verhaal: Verhaal; deel: 'begin' | 'eind'; pak: Pak }) {
  const naam = `verhaal-${verhaal.id}-${deel}.webp`
  if (heeftBeeld(naam)) return <img className="verhaal-beeld" src={`./beeld/${naam}`} alt={verhaal.schurk} draggable={false} />
  return (
    <div className={`verhaal-beeld verhaal-reserve verhaal-${verhaal.held}`}>
      <Held pak={pak} humeur={deel === 'eind' ? 'blij' : 'normaal'} className="reserve-held" />
      <span className="reserve-schurk">{verhaal.schurk}</span>
    </div>
  )
}

/** Het pad van 10 stappen: de held loopt bij elke goede beurt een stap verder naar het doel. */
export function Pad({ stap, totaal, pak, kleuren }: { stap: number; totaal: number; pak: Pak; kleuren: string[] }) {
  const deel = Math.min(stap / totaal, 1)
  return (
    <div className="pad" aria-label={`Stap ${stap} van ${totaal}`}>
      <div className="pad-baan">
        <div className="pad-vulling" style={{ width: `${deel * 100}%` }} />
        {Array.from({ length: totaal }, (_, i) => (
          <span
            key={i}
            className={`pad-stap ${i < stap ? 'pad-af' : ''}`}
            style={{ left: `${((i + 1) / totaal) * 100}%`, ...(i < stap ? { background: kleuren[i] } : {}) }}
          />
        ))}
        <span className="pad-held" style={{ left: `${deel * 100}%` }}>
          <Held pak={pak} humeur="normaal" className="pad-held-figuur" />
        </span>
      </div>
      <span className="pad-doel">
        <Ster />
      </span>
    </div>
  )
}
