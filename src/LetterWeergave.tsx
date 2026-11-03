// Weergave van de letteropdrachten (Agent Vroem).
import type { LetterTaak } from './letters'
import { IcoonLuidspreker } from './iconen'

/** Een woord als tekst (geen emoji: één strakke stijl). */
function WoordTekst({ woord }: { woord: string }) {
  return <span className="woord-tekst schoolletter">{woord}</span>
}

export function LetterOpgave({ taak, licht }: { taak: LetterTaak; licht: number }) {
  switch (taak.soort) {
    case 'beginklank':
      return (
        <>
          <div className="luister" aria-hidden="true">
            <IcoonLuidspreker />
          </div>
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

/** Inhoud van een antwoordknop: een letter of een woord. */
export function LetterOptie({ taak, optie }: { taak: LetterTaak; optie: string }) {
  return taak.soort === 'beginklank' ? <span className="schoolletter">{optie}</span> : <WoordTekst woord={optie} />
}
