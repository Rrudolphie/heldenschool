// De helden, de ballen om te tellen en de ster. De helden zijn losgeknipte AI-plaatjes
// (public/beeld/, gemaakt met scripts/maak-flux.py), de ster wordt in code getekend.
import { PAKKEN, type Pak } from './pakken'
import type { HeldId } from './opslag'

export type Humeur = 'normaal' | 'blij' | 'denk'

type HeldProps = { humeur?: Humeur; pak: Pak; className?: string }

let beelden = new Set<string>()

/** Laad de lijst met beschikbare plaatjes (één keer bij het opstarten). */
export async function laadBeelden() {
  try {
    beelden = new Set(await (await fetch('./beeld/index.json')).json())
  } catch {
    // geen lijst: dan valt elke held terug op zijn klassieke pak
  }
}

export const heeftBeeld = (naam: string) => beelden.has(naam)

/** Toont de held in de gevraagde houding; ontbreekt die, dan de gewone houding of het klassieke pak. */
export function Held({ pak, humeur = 'normaal', className = '' }: HeldProps) {
  const foto =
    [`held-${pak.held}-${pak.id}-${humeur}.webp`, `held-${pak.held}-${pak.id}-normaal.webp`].find(heeftBeeld) ??
    `held-${pak.held}-klassiek-${humeur}.webp`
  return (
    <img
      src={`./beeld/${foto}`}
      className={`held held-foto held-${humeur} held-${pak.held} ${className}`}
      alt={pak.held === 'spin' ? 'Super-Kick' : 'Agent Vroem'}
      draggable={false}
    />
  )
}

export const standaardPak = (held: HeldId) => PAKKEN[held][0]

/** Een voetbal om te tellen, met een gekleurde gloed zodat je twee groepen uit elkaar houdt. */
export function Bal({
  kleur = '#2563eb',
  weg = false,
  licht = false,
  label,
}: {
  kleur?: string
  weg?: boolean
  licht?: boolean
  label?: number
}) {
  return (
    <span
      className={`spin ${weg ? 'spin-weg' : ''} ${licht ? 'spin-licht' : ''}`}
      style={{ '--balkleur': kleur } as React.CSSProperties}
    >
      <img src="./beeld/voetbal.webp" alt="" draggable={false} />
      {label !== undefined && <span className="spin-label">{label}</span>}
    </span>
  )
}

export function Ster({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`ster ${className}`} aria-hidden="true">
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
        fill="#facc15"
        stroke="#a16207"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </svg>
  )
}
