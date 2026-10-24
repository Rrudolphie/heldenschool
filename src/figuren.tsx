// Alle figuren worden in code getekend (SVG), zodat ze scherp zijn en makkelijk aan te passen.

export type Humeur = 'normaal' | 'blij' | 'denk'

const ROOD = '#e11d2a'
const BLAUW = '#1d4ed8'
const LIJN = '#111827'

/** Webpatroon over een vorm: lijnen vanuit het midden + kringen. */
function Web({ cx, cy, r, clip }: { cx: number; cy: number; r: number; clip: string }) {
  const stralen = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2
    return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} />
  })
  const kringen = [0.25, 0.5, 0.75, 1].map((f) => <circle key={f} cx={cx} cy={cy} r={r * f} />)
  return (
    <g clipPath={`url(#${clip})`} stroke={LIJN} strokeWidth={1.4} fill="none" opacity={0.55}>
      {stralen}
      {kringen}
    </g>
  )
}

/** Kleine spin op de borst. */
function Embleem({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={LIJN} strokeWidth={2.2} strokeLinecap="round" fill="none">
      <path d="M-4 -4 L-14 -12 M-4 -1 L-16 -2 M-4 2 L-15 9 M-3 5 L-10 15" />
      <path d="M4 -4 L14 -12 M4 -1 L16 -2 M4 2 L15 9 M3 5 L10 15" />
      <ellipse cx={0} cy={-3} rx={4} ry={4} fill={LIJN} />
      <ellipse cx={0} cy={6} rx={5} ry={7} fill={LIJN} />
    </g>
  )
}

export function Held({ humeur = 'normaal', className = '' }: { humeur?: Humeur; className?: string }) {
  const armHoek = humeur === 'blij' ? 150 : humeur === 'denk' ? 35 : 18
  const ogen =
    humeur === 'blij'
      ? // blije, iets dichtgeknepen ogen
        ['M94 72 C86 58, 66 52, 54 56 C58 70, 76 78, 94 72 Z', 'M106 72 C114 58, 134 52, 146 56 C142 70, 124 78, 106 72 Z']
      : ['M94 74 C86 50, 64 42, 52 48 C54 70, 74 88, 94 74 Z', 'M106 74 C114 50, 136 42, 148 48 C146 70, 126 88, 106 74 Z']

  return (
    <svg viewBox="0 0 200 250" className={`held held-${humeur} ${className}`} role="img" aria-label="Spinnenheld">
      <defs>
        <clipPath id="hoofd-clip">
          <ellipse cx={100} cy={70} rx={58} ry={62} />
        </clipPath>
        <clipPath id="lijf-clip">
          <path d="M60 128 Q100 116 140 128 L146 208 Q100 220 54 208 Z" />
        </clipPath>
      </defs>

      {/* benen */}
      <rect x={66} y={196} width={28} height={44} rx={10} fill={BLAUW} stroke={LIJN} strokeWidth={3} />
      <rect x={106} y={196} width={28} height={44} rx={10} fill={BLAUW} stroke={LIJN} strokeWidth={3} />
      <rect x={63} y={226} width={34} height={18} rx={8} fill={ROOD} stroke={LIJN} strokeWidth={3} />
      <rect x={103} y={226} width={34} height={18} rx={8} fill={ROOD} stroke={LIJN} strokeWidth={3} />

      {/* armen */}
      <g className="arm arm-links" style={{ transform: `rotate(${armHoek}deg)`, transformOrigin: '62px 138px' }}>
        <rect x={50} y={132} width={24} height={66} rx={12} fill={BLAUW} stroke={LIJN} strokeWidth={3} />
        <circle cx={62} cy={200} r={13} fill={ROOD} stroke={LIJN} strokeWidth={3} />
      </g>
      <g className="arm arm-rechts" style={{ transform: `rotate(${-armHoek}deg)`, transformOrigin: '138px 138px' }}>
        <rect x={126} y={132} width={24} height={66} rx={12} fill={BLAUW} stroke={LIJN} strokeWidth={3} />
        <circle cx={138} cy={200} r={13} fill={ROOD} stroke={LIJN} strokeWidth={3} />
      </g>

      {/* lijf: blauwe zijkanten, rood midden met web */}
      <path d="M60 128 Q100 116 140 128 L146 208 Q100 220 54 208 Z" fill={BLAUW} stroke={LIJN} strokeWidth={3} />
      <path d="M72 124 Q100 118 128 124 L132 210 Q100 218 68 210 Z" fill={ROOD} />
      <Web cx={100} cy={150} r={70} clip="lijf-clip" />
      <path d="M60 128 Q100 116 140 128 L146 208 Q100 220 54 208 Z" fill="none" stroke={LIJN} strokeWidth={3} />
      <rect x={58} y={194} width={84} height={10} rx={4} fill={ROOD} stroke={LIJN} strokeWidth={2.5} />
      <Embleem x={100} y={160} s={1.3} />

      {/* hoofd */}
      <ellipse cx={100} cy={70} rx={58} ry={62} fill={ROOD} />
      <Web cx={100} cy={78} r={80} clip="hoofd-clip" />
      <ellipse cx={100} cy={70} rx={58} ry={62} fill="none" stroke={LIJN} strokeWidth={4} />
      {ogen.map((d) => (
        <path key={d} d={d} fill="#fff" stroke={LIJN} strokeWidth={5} strokeLinejoin="round" />
      ))}
      {humeur === 'denk' && <path d="M84 104 Q100 98 116 104" stroke={LIJN} strokeWidth={3} fill="none" strokeLinecap="round" />}
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
