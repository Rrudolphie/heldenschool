// Alle figuren worden in code getekend (SVG), zodat ze scherp zijn en makkelijk aan te passen.
import { useId } from 'react'
import { type IjzerPak, type Pak, PAKKEN, type SpinPak } from './pakken'
import type { HeldId } from './opslag'

export type Humeur = 'normaal' | 'blij' | 'denk'

const LIJN = '#111827'

/** Webpatroon over een vorm: lijnen vanuit het midden + kringen. */
function Web({ cx, cy, r, clip, kleur }: { cx: number; cy: number; r: number; clip: string; kleur: string }) {
  const stralen = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2
    return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} />
  })
  const kringen = [0.25, 0.5, 0.75, 1].map((f) => <circle key={f} cx={cx} cy={cy} r={r * f} />)
  return (
    <g clipPath={`url(#${clip})`} stroke={kleur} strokeWidth={1.4} fill="none" opacity={0.55}>
      {stralen}
      {kringen}
    </g>
  )
}

/** Kleine spin op de borst. */
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

/** Tekent de held die bij het pak hoort (spinnenheld of ijzerheld). */
export function Held({ pak, ...rest }: HeldProps) {
  return pak.held === 'spin' ? <SpinHeld pak={pak} {...rest} /> : <IjzerHeld pak={pak} {...rest} />
}

export const standaardPak = (held: HeldId) => PAKKEN[held][0]

function SpinHeld({ humeur = 'normaal', pak, className = '' }: HeldProps & { pak: SpinPak }) {
  // unieke namen, zodat meerdere helden op één scherm (kledingkast) elkaar niet storen
  const id = useId().replace(/:/g, '')
  const hoofdClip = `hoofd-${id}`
  const lijfClip = `lijf-${id}`
  const { hoofd, zijkant, web, embleem } = pak
  const armHoek = humeur === 'blij' ? 150 : humeur === 'denk' ? 35 : 18
  const ogen =
    humeur === 'blij'
      ? // blije, iets dichtgeknepen ogen
        ['M94 72 C86 58, 66 52, 54 56 C58 70, 76 78, 94 72 Z', 'M106 72 C114 58, 134 52, 146 56 C142 70, 124 78, 106 72 Z']
      : ['M94 74 C86 50, 64 42, 52 48 C54 70, 74 88, 94 74 Z', 'M106 74 C114 50, 136 42, 148 48 C146 70, 126 88, 106 74 Z']

  return (
    <svg viewBox="0 0 200 250" className={`held held-${humeur} ${className}`} role="img" aria-label="Spinnenheld">
      <defs>
        <clipPath id={hoofdClip}>
          <ellipse cx={100} cy={70} rx={58} ry={62} />
        </clipPath>
        <clipPath id={lijfClip}>
          <path d="M60 128 Q100 116 140 128 L146 208 Q100 220 54 208 Z" />
        </clipPath>
      </defs>

      {/* benen */}
      <rect x={66} y={196} width={28} height={44} rx={10} fill={zijkant} stroke={LIJN} strokeWidth={3} />
      <rect x={106} y={196} width={28} height={44} rx={10} fill={zijkant} stroke={LIJN} strokeWidth={3} />
      <rect x={63} y={226} width={34} height={18} rx={8} fill={hoofd} stroke={LIJN} strokeWidth={3} />
      <rect x={103} y={226} width={34} height={18} rx={8} fill={hoofd} stroke={LIJN} strokeWidth={3} />

      {/* armen */}
      <g className="arm arm-links" style={{ transform: `rotate(${armHoek}deg)`, transformOrigin: '62px 138px' }}>
        <rect x={50} y={132} width={24} height={66} rx={12} fill={zijkant} stroke={LIJN} strokeWidth={3} />
        <circle cx={62} cy={200} r={13} fill={hoofd} stroke={LIJN} strokeWidth={3} />
      </g>
      <g className="arm arm-rechts" style={{ transform: `rotate(${-armHoek}deg)`, transformOrigin: '138px 138px' }}>
        <rect x={126} y={132} width={24} height={66} rx={12} fill={zijkant} stroke={LIJN} strokeWidth={3} />
        <circle cx={138} cy={200} r={13} fill={hoofd} stroke={LIJN} strokeWidth={3} />
      </g>

      {/* lijf: zijkanten, midden met web */}
      <path d="M60 128 Q100 116 140 128 L146 208 Q100 220 54 208 Z" fill={zijkant} stroke={LIJN} strokeWidth={3} />
      <path d="M72 124 Q100 118 128 124 L132 210 Q100 218 68 210 Z" fill={hoofd} />
      <Web cx={100} cy={150} r={70} clip={lijfClip} kleur={web} />
      <path d="M60 128 Q100 116 140 128 L146 208 Q100 220 54 208 Z" fill="none" stroke={LIJN} strokeWidth={3} />
      <rect x={58} y={194} width={84} height={10} rx={4} fill={hoofd} stroke={LIJN} strokeWidth={2.5} />
      <Embleem x={100} y={160} s={1.3} kleur={embleem} />

      {/* hoofd */}
      <ellipse cx={100} cy={70} rx={58} ry={62} fill={hoofd} />
      <Web cx={100} cy={78} r={80} clip={hoofdClip} kleur={web} />
      <ellipse cx={100} cy={70} rx={58} ry={62} fill="none" stroke={LIJN} strokeWidth={4} />
      {ogen.map((d) => (
        <path key={d} d={d} fill="#fff" stroke={LIJN} strokeWidth={5} strokeLinejoin="round" />
      ))}
      {humeur === 'denk' && <path d="M84 104 Q100 98 116 104" stroke={web} strokeWidth={3} fill="none" strokeLinecap="round" />}
    </svg>
  )
}

function IjzerHeld({ humeur = 'normaal', pak, className = '' }: HeldProps & { pak: IjzerPak }) {
  const id = useId().replace(/:/g, '')
  const gloed = `gloed-${id}`
  const { harnas, accent, licht } = pak
  const armHoek = humeur === 'blij' ? 150 : humeur === 'denk' ? 35 : 18
  const ogen =
    humeur === 'blij'
      ? // blije, omhoog gebogen ogen
        ['M68 78 Q80 68 93 77 L91 81 Q80 74 70 82 Z', 'M132 78 Q120 68 107 77 L109 81 Q120 74 130 82 Z']
      : ['M67 70 L93 75 L91 82 L69 78 Z', 'M133 70 L107 75 L109 82 L131 78 Z']
  const lichtGlow = { filter: `url(#${gloed})` }

  return (
    <svg viewBox="0 0 200 250" className={`held held-${humeur} ${className}`} role="img" aria-label="IJzerheld">
      <defs>
        <filter id={gloed} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* benen: gouden scheenplaten, laarzen in harnaskleur */}
      <rect x={66} y={196} width={28} height={44} rx={10} fill={accent} stroke={LIJN} strokeWidth={3} />
      <rect x={106} y={196} width={28} height={44} rx={10} fill={accent} stroke={LIJN} strokeWidth={3} />
      <rect x={63} y={226} width={34} height={18} rx={8} fill={harnas} stroke={LIJN} strokeWidth={3} />
      <rect x={103} y={226} width={34} height={18} rx={8} fill={harnas} stroke={LIJN} strokeWidth={3} />

      {/* armen met handpalm-lampjes */}
      <g className="arm arm-links" style={{ transform: `rotate(${armHoek}deg)`, transformOrigin: '62px 138px' }}>
        <rect x={50} y={132} width={24} height={66} rx={12} fill={harnas} stroke={LIJN} strokeWidth={3} />
        <rect x={52} y={160} width={20} height={10} rx={4} fill={accent} stroke={LIJN} strokeWidth={2} />
        <circle cx={62} cy={200} r={13} fill={harnas} stroke={LIJN} strokeWidth={3} />
        <circle cx={62} cy={203} r={5} fill={licht} style={lichtGlow} />
      </g>
      <g className="arm arm-rechts" style={{ transform: `rotate(${-armHoek}deg)`, transformOrigin: '138px 138px' }}>
        <rect x={126} y={132} width={24} height={66} rx={12} fill={harnas} stroke={LIJN} strokeWidth={3} />
        <rect x={128} y={160} width={20} height={10} rx={4} fill={accent} stroke={LIJN} strokeWidth={2} />
        <circle cx={138} cy={200} r={13} fill={harnas} stroke={LIJN} strokeWidth={3} />
        <circle cx={138} cy={203} r={5} fill={licht} style={lichtGlow} />
      </g>

      {/* lijf: harnas met gouden buikplaten en een gloeiende borstlamp */}
      <path d="M60 128 Q100 116 140 128 L146 208 Q100 220 54 208 Z" fill={harnas} stroke={LIJN} strokeWidth={3} />
      <path d="M74 134 Q100 128 126 134 L122 146 Q100 142 78 146 Z" fill={accent} stroke={LIJN} strokeWidth={2} />
      {[176, 190].map((y) => (
        <g key={y}>
          <rect x={80} y={y} width={18} height={11} rx={4} fill={accent} stroke={LIJN} strokeWidth={2} />
          <rect x={102} y={y} width={18} height={11} rx={4} fill={accent} stroke={LIJN} strokeWidth={2} />
        </g>
      ))}
      <rect x={58} y={200} width={84} height={9} rx={4} fill={accent} stroke={LIJN} strokeWidth={2.5} />
      <circle cx={100} cy={160} r={13} fill="#e5e7eb" stroke={LIJN} strokeWidth={3} />
      <circle cx={100} cy={160} r={8} fill={licht} style={lichtGlow} />

      {/* helm met gouden gezichtsmasker */}
      <path d="M44 72 Q44 10 100 10 Q156 10 156 72 Q156 118 130 128 L70 128 Q44 118 44 72 Z" fill={harnas} stroke={LIJN} strokeWidth={4} />
      <path d="M60 54 Q100 42 140 54 L137 100 Q128 122 100 124 Q72 122 63 100 Z" fill={accent} stroke={LIJN} strokeWidth={3} />
      <path d="M100 44 L100 56" stroke={LIJN} strokeWidth={2} />
      {ogen.map((d) => (
        <path key={d} d={d} fill={licht} stroke={LIJN} strokeWidth={2} strokeLinejoin="round" style={lichtGlow} />
      ))}
      <path d={humeur === 'blij' ? 'M86 106 Q100 114 114 106' : 'M87 108 L113 108'} stroke={LIJN} strokeWidth={3} fill="none" strokeLinecap="round" />
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

/** Decoratief spinnenweb voor in de hoek van het scherm. */
export function HoekWeb({ className = '' }: { className?: string }) {
  const stralen = Array.from({ length: 7 }, (_, i) => (i / 6) * (Math.PI / 2))
  const ringen = [40, 80, 120, 160, 200]
  return (
    <svg viewBox="0 0 220 220" className={`hoekweb ${className}`} aria-hidden="true">
      <g stroke="#fff" strokeWidth={2} fill="none" opacity={0.35}>
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
