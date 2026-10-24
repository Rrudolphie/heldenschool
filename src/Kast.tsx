// Kledingkast: per held pakken bekijken en aantrekken.
import { useState } from 'react'
import { Held, Ster } from './figuren'
import { isVrij, PAKKEN } from './pakken'
import type { Bewaard, HeldData, HeldId } from './opslag'
import { stil, zeg } from './stem'
import { Z } from './zinnen'
import { IcoonSlot, IcoonTerug } from './iconen'

export function KastScherm({
  data,
  updateHeld,
  onTerug,
}: {
  data: Bewaard
  updateHeld: (h: HeldId, n: Partial<HeldData>) => void
  onTerug: () => void
}) {
  const [held, setHeld] = useState<HeldId>('spin')
  const { sterren, pak: aan } = data.helden[held]

  return (
    <main className="kast">
      <header className="balk">
        <button className="knop-rond" onClick={onTerug} aria-label="Terug">
          <IcoonTerug />
        </button>
        <div className="kast-tabs">
          {(['spin', 'ijzer'] as HeldId[]).map((h) => (
            <button
              key={h}
              className={`kast-tab ${held === h ? 'gekozen' : ''}`}
              onClick={() => {
                stil()
                setHeld(h)
              }}
            >
              <Held pak={PAKKEN[h].find((p) => p.id === data.helden[h].pak) ?? PAKKEN[h][0]} className="tab-held" />
              {h === 'spin' ? 'Spinnenheld' : 'IJzerheld'}
            </button>
          ))}
        </div>
        <div className="sterren-teller klein">
          <Ster /> <span>{sterren}</span>
        </div>
      </header>

      <div className="kast-rek">
        {PAKKEN[held].map((pak) => {
          const vrij = isVrij(pak, sterren)
          const gekozen = aan === pak.id
          return (
            <button
              key={pak.id}
              className={`pak-kaart ${vrij ? '' : 'op-slot'} ${gekozen ? 'pak-aan' : ''}`}
              onClick={() => {
                stil()
                if (vrij) {
                  updateHeld(held, { pak: pak.id })
                  zeg(Z.draagtPak(pak.naam), held)
                } else zeg(Z.opSlot, held)
              }}
            >
              <Held pak={pak} humeur={gekozen ? 'blij' : 'normaal'} className="pak-held" />
              <span className="pak-naam">{pak.naam}</span>
              {!vrij && (
                <span className="pak-slot">
                  <IcoonSlot /> <Ster /> {pak.sterren}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </main>
  )
}
