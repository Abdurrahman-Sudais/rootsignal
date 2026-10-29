/**
 * Restrained botanical/technical illustrations. Swap for licensed photography
 * in production (see README → Imagery).
 */

export function ChannelCrossSection({ className = '' }: { className?: string }) {
  const plants = [70, 170, 270, 370, 470];
  return (
    <svg viewBox="0 0 540 340" className={className} role="img" aria-label="Cross-section of a hydroponic channel with plants above and roots in the nutrient film below">
      <defs>
        <linearGradient id="water-x" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f4d35" />
          <stop offset="1" stopColor="#10291c" />
        </linearGradient>
      </defs>
      {/* canopy */}
      {plants.map((x, i) => (
        <g key={x} transform={`translate(${x} 118)`}>
          <path d="M0 0 C -28 -6 -40 -34 -26 -52 C -12 -44 -4 -24 0 0Z" fill="#8aa58c" />
          <path d="M0 0 C 30 -8 42 -36 26 -54 C 12 -44 4 -24 0 0Z" fill="#6f8b72" />
          <path d="M0 0 C -8 -26 -2 -56 6 -66 C 14 -50 10 -24 0 0Z" fill="#3f7a58" />
          <circle cx="0" cy="2" r={4 + (i % 2)} fill="#173a28" />
        </g>
      ))}
      {/* channel */}
      <rect x="20" y="120" width="500" height="22" rx="4" fill="#e6dfcd" stroke="#c2b79f" />
      <rect x="20" y="142" width="500" height="150" rx="6" fill="url(#water-x)" />
      <line x1="20" y1="142" x2="520" y2="142" stroke="#c9a24a" strokeDasharray="4 6" strokeWidth="1.2" />
      {/* roots */}
      <g fill="none" stroke="#e9e3d2" strokeLinecap="round" opacity="0.9">
        {plants.map((x, i) => (
          <g key={x}>
            <path d={`M${x} 140 C ${x - 6} 180 ${x + 8} 210 ${x - 4} 270`} strokeWidth="2.2" />
            <path d={`M${x} 150 C ${x - 22} 170 ${x - 34} 200 ${x - 30} 246`} strokeWidth="1.3" />
            <path d={`M${x + 2} 156 C ${x + 24} 178 ${x + 30} 214 ${x + 26} 250`} strokeWidth="1.3" />
            <path d={`M${x - 2} 190 C ${x - 14} 204 ${x - 18} 222 ${x - 16} 236`} strokeWidth="0.9" />
            <path d={`M${x + 4} 206 C ${x + 14} 222 ${x + 12} 240 ${x + 18} 262`} strokeWidth="0.9" />
            {i === 3 && <path d={`M${x} 160 C ${x - 4} 200 ${x + 6} 230 ${x} 280`} strokeWidth="1.6" stroke="#b08a5a" />}
          </g>
        ))}
      </g>
      {/* callouts */}
      <g fontFamily="IBM Plex Mono, monospace" fontSize="11">
        <circle cx="370" cy="232" r="22" fill="none" stroke="#c98a2b" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1="392" y1="232" x2="446" y2="306" stroke="#c98a2b" />
        <text x="400" y="322" fill="#a86d14">visible change</text>
        <line x1="120" y1="292" x2="120" y2="306" stroke="#5b675f" />
        <text x="60" y="322" fill="#5b675f">pH · EC · °C · L/day</text>
        <text x="24" y="34" fill="#5b675f">above: canopy</text>
        <text x="24" y="168" fill="#c2d1bd">below: root zone</text>
      </g>
    </svg>
  );
}

export function UseCaseScene({ kind, className = '' }: { kind: 'hydroponic' | 'greenhouse' | 'nursery'; className?: string }) {
  if (kind === 'hydroponic') {
    return (
      <svg viewBox="0 0 320 180" className={className} role="img" aria-label="Stacked hydroponic channels">
        <rect width="320" height="180" fill="#173a28" />
        {[40, 90, 140].map((y) => (
          <g key={y}>
            <rect x="20" y={y} width="280" height="12" rx="3" fill="#e6dfcd" />
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i} transform={`translate(${36 + i * 31} ${y})`}>
                <ellipse cx="0" cy="-6" rx="11" ry="7" fill={i % 3 === 0 ? '#8aa58c' : '#6f8b72'} />
                <path d="M0 12 v10 M-3 12 l-4 9 M3 12 l4 8" stroke="#e9e3d2" strokeWidth="1" opacity="0.6" />
              </g>
            ))}
          </g>
        ))}
        <rect x="0" y="166" width="320" height="14" fill="#10291c" />
      </svg>
    );
  }
  if (kind === 'greenhouse') {
    return (
      <svg viewBox="0 0 320 180" className={className} role="img" aria-label="Venlo greenhouse with high-wire crop rows">
        <rect width="320" height="180" fill="#e7eee2" />
        <g stroke="#3f7a58" strokeWidth="1.4" fill="none">
          {[0, 64, 128, 192, 256].map((x) => (
            <path key={x} d={`M${x} 60 L${x + 32} 30 L${x + 64} 60`} />
          ))}
          <line x1="0" y1="60" x2="320" y2="60" />
          {[0, 64, 128, 192, 256, 320].map((x) => (
            <line key={x} x1={x} y1="60" x2={x} y2="170" opacity="0.5" />
          ))}
        </g>
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`translate(${22 + i * 38} 0)`}>
            <line x1="0" y1="64" x2="0" y2="152" stroke="#8a6a48" strokeWidth="0.8" />
            <path d="M0 150 C -10 130 10 110 -4 90 C 8 80 -6 72 2 66" stroke="#2d6446" strokeWidth="3" fill="none" />
            <circle cx="6" cy="118" r="4" fill="#b4532a" />
            <circle cx="-6" cy="104" r="3.5" fill="#c98a2b" />
            <rect x="-10" y="152" width="20" height="8" rx="2" fill="#c2b79f" />
          </g>
        ))}
        <rect x="0" y="160" width="320" height="20" fill="#d6e1d1" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 180" className={className} role="img" aria-label="Nursery benches with potted young plants">
      <rect width="320" height="180" fill="#efeadd" />
      {[0, 1, 2].map((row) => (
        <g key={row} transform={`translate(0 ${50 + row * 42})`}>
          <rect x="10" y="22" width="300" height="6" fill="#8a6a48" opacity="0.7" />
          {Array.from({ length: 12 }, (_, i) => (
            <g key={i} transform={`translate(${24 + i * 24} 0)`}>
              <path d="M-7 8 h14 l-2 14 h-10z" fill="#5b4632" />
              <circle cx="-3" cy="2" r="5" fill={(i + row) % 4 === 0 ? '#3f7a58' : '#6f8b72'} />
              <circle cx="4" cy="0" r="5" fill="#8aa58c" />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
