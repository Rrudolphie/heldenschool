// Alle figuren worden in code getekend (SVG), zodat ze scherp zijn en makkelijk aan te passen.
// De helden hebben heldhaftige verhoudingen (breed, gespierd, kleiner hoofd) met schaduw en glans.
import { type ReactNode, useId } from 'react'
import { type IjzerPak, type Pak, PAKKEN, type SpinPak } from './pakken'
import type { HeldId } from './opslag'

export type Humeur = 'normaal' | 'blij' | 'denk'

const LIJN = '#1b1f2e'

type Punt = [number, number]

/** Houding van de armen: [schouder, elleboog, hand] per arm. */
const ARMEN: Record<Humeur, { links: Punt[]; rechts: Punt[] }> = {
  // handen in de zij
  normaal: { links: [[57, 100], [36, 140], [70, 170]], rechts: [[143, 100], [164, 140], [130, 170]] },
  // vuist omhoog
  blij: { links: [[57, 100], [36, 140], [70, 170]], rechts: [[143, 100], [168, 66], [158, 26]] },
  // hand aan de kin
  denk: { links: [[57, 100], [36, 140], [70, 170]], rechts: [[143, 100], [152, 146], [114, 82]] },
}

const pad = (punten: Punt[]) => `M${punten.map((p) => p.join(' ')).join(' L')}`

/** Een gespierde arm als dikke lijnen: bovenarm, onderarm en hand, met een glanslijn. */
function Arm({
  punten,
  boven,
  onder,
  hand,
  extra,
}: {
  punten: Punt[]
  boven: string
  onder: string
  hand: string
  extra?: ReactNode
}) {
  const [s, e, h] = punten
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" className="arm">
      <path d={pad([s, e])} stroke={LIJN} strokeWidth={25} />
      <path d={pad([e, h])} stroke={LIJN} strokeWidth={22} />
      <path d={pad([s, e])} stroke={boven} strokeWidth={20} />
      <path d={pad([e, h])} stroke={onder} strokeWidth={17} />
      <path d={pad([s, e])} stroke="#fff" strokeOpacity={0.22} strokeWidth={5} transform="translate(-3 -2)" />
      <circle cx={h[0]} cy={h[1]} r={11} fill={hand} stroke={LIJN} strokeWidth={2.5} />
      {extra}
    </g>
  )
}

/** Gedeelde verlopen: licht van linksboven, schaduw rechtsonder. */
function Licht({ id }: { id: string }) {
  return (
    <>
      <linearGradient id={`schaduw-${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.28} />
        <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.28} />
      </linearGradient>
      <radialGradient id={`glans-${id}`} cx="0.35" cy="0.3" r="0.7">
        <stop offset="0" stopColor="#fff" stopOpacity={0.45} />
        <stop offset="0.5" stopColor="#fff" stopOpacity={0} />
      </radialGradient>
    </>
  )
}

// gedeelde vormen
const ROMP = 'M57 92 Q100 78 143 92 L136 150 Q118 172 112 182 L88 182 Q82 172 64 150 Z'
const HEUP = 'M76 178 L124 178 L130 202 L70 202 Z'
const BEEN_L = 'M71 196 L100 196 L94 248 L90 290 L66 290 L68 248 Z'
const BEEN_R = 'M100 196 L129 196 L132 248 L134 290 L110 290 L106 248 Z'

/** Webpatroon over een vorm: lijnen vanuit het midden + kringen. */
function Web({ cx, cy, r, clip, kleur, dik = 1 }: { cx: number; cy: number; r: number; clip: string; kleur: string; dik?: number }) {
  const stralen = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2
    return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} />
  })
  const kringen = [0.2, 0.4, 0.6, 0.8, 1].map((f) => <circle key={f} cx={cx} cy={cy} r={r * f} />)
  return (
    <g clipPath={`url(#${clip})`} stroke={kleur} strokeWidth={dik} fill="none" opacity={0.5}>
      {stralen}
      {kringen}
    </g>
  )
}

/** Spin op de borst. */
function Embleem({ x, y, s = 1, kleur }: { x: number; y: number; s?: number; kleur: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={kleur} strokeWidth={2.2} strokeLinecap="round" fill="none">
      <path d="M-4 -4 L-14 -12 M-4 -1 L-16 -2 M-4 2 L-15 9 M-3 5 L-10 15" />
      <path d="M4 -4 L14 -12 M4 -1 L16 -2 M4 2 L15 9 M3 5 L10 15" />
      <ellipse cx={0} cy={-3} rx={4} ry={4} fill={kleur} />
      <ellipse cx={0} cy={6} rx={5} ry={7} fill={kleur} />
    </g>
  )
}

type HeldProps = { humeur?: Humeur; pak: Pak; className?: string }

// ---------- AI-plaatjes (public/beeld/, gemaakt met scripts/maak-beeld.py) ----------

let beelden = new Set<string>()

/** Laad de lijst met beschikbare plaatjes (één keer bij het opstarten). */
export async function laadBeelden() {
  try {
    beelden = new Set(await (await fetch('./beeld/index.json')).json())
  } catch {
    // nog geen plaatjes: dan de getekende helden
  }
}

export const heeftBeeld = (naam: string) => beelden.has(naam)

/** De bewegende versie (gemaakt met scripts/maak-film.py) als die er is, anders het stilstaande plaatje. */
export const levend = (naam: string) => {
  const anim = naam.replace(/\.webp$/, '.anim.webp')
  return beelden.has(anim) ? anim : naam
}

/** Toont de held: het AI-plaatje als dat er is, anders de getekende versie. */
export function Held({ pak, humeur = 'normaal', className = '' }: HeldProps) {
  const foto = levend(`held-${pak.held}-${pak.id}-${humeur}.webp`)
  if (heeftBeeld(foto))
    return (
      <img
        src={`./beeld/${foto}`}
        className={`held held-foto held-${humeur} ${className}`}
        alt={pak.held === 'spin' ? 'Spinnenheld' : 'IJzerheld'}
        draggable={false}
      />
    )
  return pak.held === 'spin' ? (
    <SpinHeld pak={pak} humeur={humeur} className={className} />
  ) : (
    <IjzerHeld pak={pak} humeur={humeur} className={className} />
  )
}

export const standaardPak = (held: HeldId) => PAKKEN[held][0]

function SpinHeld({ humeur = 'normaal', pak, className = '' }: HeldProps & { pak: SpinPak }) {
  // unieke namen, zodat meerdere helden op één scherm (kledingkast) elkaar niet storen
  const id = useId().replace(/:/g, '')
  const { hoofd, zijkant, web, embleem } = pak
  const armen = ARMEN[humeur]
  const ogen =
    humeur === 'blij'
      ? ['M98 47 C94 39, 83 36, 77 39 C79 46, 87 51, 98 47 Z', 'M102 47 C106 39, 117 36, 123 39 C121 46, 113 51, 102 47 Z']
      : humeur === 'denk'
        ? ['M98 48 C94 37, 82 33, 76 37 C77 46, 86 54, 98 48 Z', 'M102 46 C106 41, 117 39, 123 41 C121 47, 113 50, 102 46 Z']
        : ['M98 48 C94 36, 82 32, 76 36 C77 46, 86 54, 98 48 Z', 'M102 48 C106 36, 118 32, 124 36 C123 46, 114 54, 102 48 Z']

  return (
    <svg viewBox="0 0 200 300" className={`held held-${humeur} ${className}`} role="img" aria-label="Spinnenheld">
      <defs>
        <Licht id={id} />
        <clipPath id={`hoofd-${id}`}>
          <ellipse cx={100} cy={46} rx={24} ry={28} />
        </clipPath>
        <clipPath id={`borst-${id}`}>
          <path d="M66 92 Q100 82 134 92 L126 150 Q110 170 104 182 L96 182 Q90 170 74 150 Z" />
        </clipPath>
      </defs>

      {/* benen met laarzen */}
      <path d={HEUP} fill={zijkant} stroke={LIJN} strokeWidth={2.5} />
      <path d={BEEN_L} fill={zijkant} stroke={LIJN} strokeWidth={2.5} />
      <path d={BEEN_R} fill={zijkant} stroke={LIJN} strokeWidth={2.5} />
      <path d="M67 256 L93 256 L90 290 L66 290 Z M107 256 L133 256 L134 290 L110 290 Z" fill={hoofd} stroke={LIJN} strokeWidth={2.5} />
      <path d={`${BEEN_L} ${BEEN_R}`} fill={`url(#schaduw-${id})`} />
      <path d="M86 205 Q84 228 82 246 M114 205 Q116 228 118 246" stroke={LIJN} strokeOpacity={0.25} strokeWidth={1.5} fill="none" />

      {/* romp: zijkanten, rood borstpaneel met web, spin */}
      <path d={ROMP} fill={zijkant} stroke={LIJN} strokeWidth={2.5} />
      <path d="M66 92 Q100 82 134 92 L126 150 Q110 170 104 182 L96 182 Q90 170 74 150 Z" fill={hoofd} />
      <Web cx={100} cy={112} r={80} clip={`borst-${id}`} kleur={web} />
      <path d={ROMP} fill={`url(#schaduw-${id})`} stroke={LIJN} strokeWidth={2.5} />
      <path d="M76 122 Q88 131 100 124 Q112 131 124 122" stroke={LIJN} strokeOpacity={0.3} strokeWidth={1.6} fill="none" />
      <path d="M92 140 L108 140 M93 152 L107 152 M95 164 L105 164" stroke={LIJN} strokeOpacity={0.18} strokeWidth={1.4} />
      <Embleem x={100} y={110} s={1.25} kleur={embleem} />

      {/* armen */}
      <Arm punten={armen.links} boven={hoofd} onder={hoofd} hand={hoofd} />
      <Arm punten={armen.rechts} boven={hoofd} onder={hoofd} hand={hoofd} />
      <circle cx={57} cy={100} r={15} fill={hoofd} stroke={LIJN} strokeWidth={2.5} />
      <circle cx={143} cy={100} r={15} fill={hoofd} stroke={LIJN} strokeWidth={2.5} />
      <circle cx={57} cy={100} r={15} fill={`url(#glans-${id})`} />
      <circle cx={143} cy={100} r={15} fill={`url(#glans-${id})`} />

      {/* hals en hoofd */}
      <rect x={91} y={66} width={18} height={18} rx={6} fill={hoofd} stroke={LIJN} strokeWidth={2.5} />
      <ellipse cx={100} cy={46} rx={24} ry={28} fill={hoofd} stroke={LIJN} strokeWidth={2.5} />
      <Web cx={100} cy={50} r={34} clip={`hoofd-${id}`} kleur={web} dik={0.8} />
      <ellipse cx={100} cy={46} rx={24} ry={28} fill={`url(#glans-${id})`} />
      {ogen.map((d) => (
        <path key={d} d={d} fill="#fff" stroke={LIJN} strokeWidth={3} strokeLinejoin="round" />
      ))}
    </svg>
  )
}

function IjzerHeld({ humeur = 'normaal', pak, className = '' }: HeldProps & { pak: IjzerPak }) {
  const id = useId().replace(/:/g, '')
  const gloed = `gloed-${id}`
  const { harnas, accent, licht } = pak
  const armen = ARMEN[humeur]
  const lichtGlow = { filter: `url(#${gloed})` }
  const ogen =
    humeur === 'blij'
      ? ['M86 48 Q91 43 97 47 L96 50 Q91 47 87 51 Z', 'M114 48 Q109 43 103 47 L104 50 Q109 47 113 51 Z']
      : humeur === 'denk'
        ? ['M86 44 L97 46 L96 50 L87 48 Z', 'M114 46 L103 47 L104 49.5 L113 49 Z']
        : ['M86 44 L97 46 L96 50 L87 48 Z', 'M114 44 L103 46 L104 50 L113 48 Z']
  const palm = (h: Punt) => <circle cx={h[0]} cy={h[1]} r={4.5} fill={licht} style={lichtGlow} />

  return (
    <svg viewBox="0 0 200 300" className={`held held-${humeur} ${className}`} role="img" aria-label="IJzerheld">
      <defs>
        <Licht id={id} />
        <filter id={gloed} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* benen: gouden dijen, rode schenen en laarzen */}
      <path d={HEUP} fill={harnas} stroke={LIJN} strokeWidth={2.5} />
      <path d={BEEN_L} fill={harnas} stroke={LIJN} strokeWidth={2.5} />
      <path d={BEEN_R} fill={harnas} stroke={LIJN} strokeWidth={2.5} />
      <path d="M71 200 L99 200 L96 236 L69 236 Z M101 200 L129 200 L131 236 L104 236 Z" fill={accent} stroke={LIJN} strokeWidth={2} />
      <path d="M69 242 Q81 238 95 242 M105 242 Q119 238 131 242" stroke={LIJN} strokeWidth={2} fill="none" />
      <path d={`${BEEN_L} ${BEEN_R}`} fill={`url(#schaduw-${id})`} />

      {/* romp met gouden kraag, buikplaten, riem en gloeiende borstlamp */}
      <path d={ROMP} fill={harnas} stroke={LIJN} strokeWidth={2.5} />
      <path d="M72 94 Q100 86 128 94 L124 104 Q100 98 76 104 Z" fill={accent} stroke={LIJN} strokeWidth={2} />
      <path d="M70 110 Q84 104 96 110 L94 130 Q82 134 72 128 Z M130 110 Q116 104 104 110 L106 130 Q118 134 128 128 Z" fill="none" stroke={LIJN} strokeOpacity={0.35} strokeWidth={1.6} />
      {[140, 153, 166].map((y) => (
        <g key={y}>
          <rect x={86} y={y} width={13} height={10} rx={3} fill={accent} stroke={LIJN} strokeWidth={1.6} />
          <rect x={101} y={y} width={13} height={10} rx={3} fill={accent} stroke={LIJN} strokeWidth={1.6} />
        </g>
      ))}
      <rect x={76} y={177} width={48} height={8} rx={3} fill={accent} stroke={LIJN} strokeWidth={2} />
      <path d={ROMP} fill={`url(#schaduw-${id})`} />
      <circle cx={100} cy={118} r={10} fill="#e5e7eb" stroke={LIJN} strokeWidth={2.5} />
      <circle cx={100} cy={118} r={6.5} fill={licht} style={lichtGlow} />

      {/* armen: rood harnas, gouden ellebogen, gloeiende handpalmen */}
      <Arm punten={armen.links} boven={harnas} onder={harnas} hand={harnas} extra={palm(armen.links[2])} />
      <Arm punten={armen.rechts} boven={harnas} onder={harnas} hand={harnas} extra={palm(armen.rechts[2])} />
      <circle cx={armen.links[1][0]} cy={armen.links[1][1]} r={6} fill={accent} stroke={LIJN} strokeWidth={1.8} />
      <circle cx={armen.rechts[1][0]} cy={armen.rechts[1][1]} r={6} fill={accent} stroke={LIJN} strokeWidth={1.8} />
      <circle cx={57} cy={100} r={16} fill={harnas} stroke={LIJN} strokeWidth={2.5} />
      <circle cx={143} cy={100} r={16} fill={harnas} stroke={LIJN} strokeWidth={2.5} />
      <circle cx={57} cy={100} r={16} fill={`url(#glans-${id})`} />
      <circle cx={143} cy={100} r={16} fill={`url(#glans-${id})`} />

      {/* helm met gouden gezichtsmasker */}
      <rect x={90} y={66} width={20} height={18} rx={5} fill={accent} stroke={LIJN} strokeWidth={2.5} />
      <path d="M75 46 Q75 16 100 16 Q125 16 125 46 Q125 70 113 77 L87 77 Q75 70 75 46 Z" fill={harnas} stroke={LIJN} strokeWidth={2.5} />
      <path d="M83 34 Q100 28 117 34 L115 58 Q111 73 100 74 Q89 73 85 58 Z" fill={accent} stroke={LIJN} strokeWidth={2.2} />
      <path d="M75 46 Q75 16 100 16 Q125 16 125 46 Q125 70 113 77 L87 77 Q75 70 75 46 Z" fill={`url(#glans-${id})`} />
      <path d="M100 29 L100 36" stroke={LIJN} strokeWidth={1.6} />
      {ogen.map((d) => (
        <path key={d} d={d} fill={licht} stroke={LIJN} strokeWidth={1.4} strokeLinejoin="round" style={lichtGlow} />
      ))}
      <path d={humeur === 'blij' ? 'M93 63 Q100 68 107 63' : 'M93 64 L107 64'} stroke={LIJN} strokeWidth={2} fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** Een vrolijk spinnetje om te tellen. */
export function Spinnetje({
  kleur = '#7c3aed',
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
    <span className={`spin ${weg ? 'spin-weg' : ''} ${licht ? 'spin-licht' : ''}`}>
      <svg viewBox="0 0 60 56" aria-hidden="true">
        {weg && <line x1={30} y1={0} x2={30} y2={18} stroke="#94a3b8" strokeWidth={1.5} />}
        <g stroke={LIJN} strokeWidth={2.6} strokeLinecap="round" fill="none">
          <path d="M20 26 Q10 14 4 18 M19 31 Q8 28 2 32 M20 35 Q9 40 5 48 M23 38 Q16 48 14 54" />
          <path d="M40 26 Q50 14 56 18 M41 31 Q52 28 58 32 M40 35 Q51 40 55 48 M37 38 Q44 48 46 54" />
        </g>
        <circle cx={30} cy={32} r={15} fill={kleur} stroke={LIJN} strokeWidth={2.5} />
        <circle cx={24.5} cy={28} r={5} fill="#fff" />
        <circle cx={35.5} cy={28} r={5} fill="#fff" />
        <circle cx={25.5} cy={29} r={2.4} fill={LIJN} />
        <circle cx={36.5} cy={29} r={2.4} fill={LIJN} />
        <path d="M24 37 Q30 42 36 37" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" />
      </svg>
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

/** Decoratief spinnenweb voor in de hoek van het scherm (kleur via CSS). */
export function HoekWeb({ className = '' }: { className?: string }) {
  const stralen = Array.from({ length: 7 }, (_, i) => (i / 6) * (Math.PI / 2))
  const ringen = [40, 80, 120, 160, 200]
  return (
    <svg viewBox="0 0 220 220" className={`hoekweb ${className}`} aria-hidden="true">
      <g stroke="currentColor" strokeWidth={2} fill="none">
        {stralen.map((a) => (
          <line key={a} x1={0} y1={0} x2={Math.cos(a) * 220} y2={Math.sin(a) * 220} />
        ))}
        {ringen.map((r) => (
          <polyline
            key={r}
            points={stralen.map((a) => `${Math.cos(a) * r},${Math.sin(a) * r}`).join(' ')}
          />
        ))}
      </g>
    </svg>
  )
}
