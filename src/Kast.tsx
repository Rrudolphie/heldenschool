// Kledingkast: pakken bekijken en aantrekken.
import { Held, Ster } from './figuren'
import { isVrij, PAKKEN } from './pakken'
import type { Bewaard } from './opslag'
import { stil, zeg } from './stem'

export function KastScherm({
  data,
  update,
  onTerug,
}: {
  data: Bewaard
  update: (n: Partial<Bewaard>) => void
  onTerug: () => void
}) {
  return (
    <main className="kast">
      <header className="balk">
        <button className="knop-rond" onClick={onTerug} aria-label="Terug">
          ⬅️
        </button>
        <h1 className="kast-titel">Pakken</h1>
        <div className="sterren-teller klein">
          <Ster /> <span>{data.sterren}</span>
        </div>
      </header>

      <div className="kast-rek">
        {PAKKEN.map((pak) => {
          const vrij = isVrij(pak, data.sterren)
          const aan = data.pak === pak.id
          return (
            <button
              key={pak.id}
              className={`pak-kaart ${vrij ? '' : 'op-slot'} ${aan ? 'pak-aan' : ''}`}
              onClick={() => {
                stil()
                if (vrij) {
                  update({ pak: pak.id })
                  zeg(`Je draagt nu het pak ${pak.naam}!`)
                } else {
                  const nog = pak.sterren - data.sterren
                  zeg(`Nog ${nog} ${nog === 1 ? 'ster' : 'sterren'} verzamelen voor dit pak!`)
                }
              }}
            >
              <Held pak={pak} humeur={aan ? 'blij' : 'normaal'} className="pak-held" />
              <span className="pak-naam">{pak.naam}</span>
              {!vrij && (
                <span className="pak-slot">
                  🔒 <Ster /> {pak.sterren}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </main>
  )
}
