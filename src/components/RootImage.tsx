import { memo, useId, useMemo } from 'react';
import { diffObservations, generateRootTree, IMAGE_H, IMAGE_W, isVisible, segmentColor, type RootImageParams } from '../lib/rootModel';

interface Props {
  params: RootImageParams;
  medium?: 'water' | 'substrate';
  /** When supplied, regions that differ from this observation are outlined. */
  compareTo?: Pick<RootImageParams, 'density' | 'browning'>;
  uploadedUrl?: string;
  label: string;
  className?: string;
  showScale?: boolean;
}

function mulberry(seed: number) {
  let a = seed;
  return () => {
    a = (a * 9301 + 49297) % 233280;
    return a / 233280;
  };
}

/**
 * Renders a procedural root-zone image (sample imagery) or an uploaded photo.
 */
export const RootImage = memo(function RootImage({ params, medium = 'water', compareTo, uploadedUrl, label, className = '', showScale = false }: Props) {
  const id = useId().replace(/:/g, '');
  const segments = generateRootTree(params.seed);
  const particles = useMemo(() => {
    const r = mulberry(params.seed);
    return Array.from({ length: medium === 'substrate' ? 140 : 40 }, () => ({ x: r() * IMAGE_W, y: r() * IMAGE_H, s: 0.4 + r() * (medium === 'substrate' ? 2.2 : 1.2), o: 0.08 + r() * 0.2 }));
  }, [params.seed, medium]);
  const diff = useMemo(() => (compareTo ? diffObservations(params.seed, compareTo, params) : null), [compareTo, params]);
  const poor = params.quality === 'poor';

  if (uploadedUrl) {
    return <img src={uploadedUrl} alt={label} className={`aspect-[4/3] w-full object-cover ${className}`} />;
  }

  return (
    <svg viewBox={`0 0 ${IMAGE_W} ${IMAGE_H}`} className={`block aspect-[4/3] w-full ${className}`} role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          {medium === 'water' ? (
            <>
              <stop offset="0" stopColor="#173029" />
              <stop offset="1" stopColor="#0b1714" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#2c241b" />
              <stop offset="1" stopColor="#17120d" />
            </>
          )}
        </linearGradient>
        <radialGradient id={`vig-${id}`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
        <filter id={`blur-${id}`}>
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <rect width={IMAGE_W} height={IMAGE_H} fill={`url(#bg-${id})`} />
      <g opacity={medium === 'substrate' ? 1 : 0.7}>
        {particles.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.s} fill={medium === 'substrate' ? '#6b5a44' : '#3d5a52'} opacity={p.o} />
        ))}
      </g>
      <g filter={poor ? `url(#blur-${id})` : undefined} strokeLinecap="round" fill="none">
        {segments.map((s, i) =>
          isVisible(s, params.density) ? <path key={i} d={s.d} stroke={segmentColor(s, params.browning)} strokeWidth={s.width} opacity={0.92} /> : null,
        )}
      </g>
      {poor && <rect width={IMAGE_W} height={IMAGE_H} fill="#d8e0dc" opacity="0.28" />}
      <rect width={IMAGE_W} height={IMAGE_H} fill={`url(#vig-${id})`} />
      {diff?.cells.map((c, i) => (
        <g key={i}>
          <rect x={c.x + 3} y={c.y + 3} width={c.w - 6} height={c.h - 6} rx="6" fill="#c98a2b" fillOpacity={0.08 + c.score * 0.12} stroke="#e7b45a" strokeWidth="1.6" strokeDasharray="5 4" />
        </g>
      ))}
      {showScale && (
        <g fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="#e9e3d2" opacity="0.85">
          <line x1="16" y1={IMAGE_H - 16} x2="76" y2={IMAGE_H - 16} stroke="#e9e3d2" strokeWidth="1.5" />
          <line x1="16" y1={IMAGE_H - 20} x2="16" y2={IMAGE_H - 12} stroke="#e9e3d2" strokeWidth="1.5" />
          <line x1="76" y1={IMAGE_H - 20} x2="76" y2={IMAGE_H - 12} stroke="#e9e3d2" strokeWidth="1.5" />
          <text x="84" y={IMAGE_H - 12}>10 mm</text>
        </g>
      )}
    </svg>
  );
});
