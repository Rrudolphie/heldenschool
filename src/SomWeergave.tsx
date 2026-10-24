// Weergave van de rekenopdrachten (spinnenheld).
import type { CSSProperties } from 'react'
import { Spinnetje } from './figuren'
import type { Som } from './spel'

// plussommen: twee duidelijk verschillende kleuren, net als het pak van de held
const EERSTE_KLEUR = '#e11d2a'
const TWEEDE_KLEUR = '#2563eb'

/** Spinnetjes in rijen van 5, zoals een rekenrek. */
export function Spinnen({
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

export function SomOpgave({ som, licht }: { som: Som; licht: number }) {
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
    case 'plus20':
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
    case 'min20':
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

/** Inhoud van een antwoordknop. */
export function SomOptie({ som, optie }: { som: Som; optie: string }) {
  return som.soort === 'cijfers' ? <Spinnen aantal={Number(optie)} kleur={som.kleur} klein /> : <>{optie}</>
}
