// Weergave van de letteropdrachten (ijzerheld).
import { type LetterTaak, optieWoord } from './letters'
import { IcoonLuidspreker } from './iconen'

/** Een woord met plaatje (emoji). */
function Plaatje({ woord, groot = false }: { woord: string; groot?: boolean }) {
  return (
    <span className={`plaatje ${groot ? 'plaatje-groot' : ''}`} role="img" aria-label={woord}>
      {optieWoord(woord).emoji}
    </span>
  )
}

export function LetterOpgave({ taak, licht }: { taak: LetterTaak; licht: number }) {
  switch (taak.soort) {
    case 'beginklank':
      return (
        <>
          <Plaatje woord={taak.woord.woord} groot />
          <p className="vraag">
            <span className="schoolletter vraag-gat">_</span>
            <span className="schoolletter">{taak.woord.woord.slice(1)}</span>
          </p>
        </>
      )
    case 'herkennen':
      return <div className="groot-cijfer schoolletter letter-groot">{taak.letter}</div>
    case 'hakken':
      return (
        <>
          <div className="luister" aria-hidden="true">
            <IcoonLuidspreker />
          </div>
          <p className="vraag">Luister goed!</p>
        </>
      )
    case 'lezen': {
      // het woord in klankgroepjes, zodat de hulp elk klankje kan laten oplichten
      const klanken = taak.woord.klanken ?? [...taak.woord.woord]
      return (
        <p className="leeswoord schoolletter">
          {klanken.map((k, i) => (
            <span key={i} className={licht === i + 1 ? 'klank-licht' : ''}>
              {k}
            </span>
          ))}
        </p>
      )
    }
  }
}

/** Inhoud van een antwoordknop: een letter of een plaatje. */
export function LetterOptie({ taak, optie }: { taak: LetterTaak; optie: string }) {
  return taak.soort === 'beginklank' ? <span className="schoolletter">{optie}</span> : <Plaatje woord={optie} />
}
