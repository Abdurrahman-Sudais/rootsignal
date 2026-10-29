import { useEffect, useId, useRef, useState } from 'react';
import { formatShort } from '../lib/dates';

export interface ChartPoint {
  date: string;
  value?: number;
}

interface Props {
  points: ChartPoint[];
  label: string;
  unit: string;
  digits?: number;
  height?: number;
  color?: string;
  /** Optional reference band, e.g. a target range supplied by the grower. */
  band?: [number, number];
}

/**
 * Small responsive single-series line chart with a crosshair tooltip,
 * keyboard navigation (arrow keys) and a screen-reader table.
 * Missing values break the line rather than being interpolated.
 */
export function LineChart({ points, label, unit, digits = 1, height = 140, color = '#2d6446', band }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(140, Math.floor(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const values = points.map((p) => p.value).filter((v): v is number => v !== undefined);
  if (!values.length) {
    return (
      <div className="flex h-[140px] items-center justify-center rounded-lg border border-dashed border-line text-sm text-muted">
        No {label.toLowerCase()} values supplied
      </div>
    );
  }
  const pad = { l: 40, r: 12, t: 12, b: 22 };
  const lo = Math.min(...values, ...(band ?? []));
  const hi = Math.max(...values, ...(band ?? []));
  const span = hi - lo || Math.abs(hi) * 0.1 || 1;
  const yMin = lo - span * 0.15;
  const yMax = hi + span * 0.15;
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const x = (i: number) => pad.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - ((v - yMin) / (yMax - yMin)) * ih;

  let d = '';
  let pen = false;
  points.forEach((p, i) => {
    if (p.value === undefined) {
      pen = false;
      return;
    }
    d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`;
    pen = true;
  });
  const ticks = [yMin + (yMax - yMin) * 0.15, (yMin + yMax) / 2, yMax - (yMax - yMin) * 0.15];
  const fmt = (v: number) => v.toFixed(digits);
  const a = active !== null ? points[active] : null;
  const lastIdx = points.map((p) => p.value !== undefined).lastIndexOf(true);

  const onMove = (clientX: number) => {
    const rect = wrap.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = (clientX - rect.left - pad.l) / iw;
    setActive(Math.max(0, Math.min(points.length - 1, Math.round(rel * (points.length - 1)))));
  };

  return (
    <div ref={wrap} className="relative w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="block touch-none select-none"
        role="img"
        aria-labelledby={titleId}
        tabIndex={0}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setActive(null)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onBlur={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setActive((i) => Math.min(points.length - 1, (i ?? -1) + 1));
          if (e.key === 'ArrowLeft') setActive((i) => Math.max(0, (i ?? points.length) - 1));
          if (e.key === 'Escape') setActive(null);
        }}
      >
        <title id={titleId}>{`${label} (${unit}), ${points.length} sample readings. Use arrow keys to step through values.`}</title>
        {band && <rect x={pad.l} width={iw} y={y(band[1])} height={y(band[0]) - y(band[1])} fill="#8aa58c" opacity="0.14" />}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="#ddd5c2" strokeWidth="1" />
            <text x={pad.l - 6} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#7d877f" className="tnum">
              {fmt(t)}
            </text>
          </g>
        ))}
        <text x={pad.l} y={height - 6} fontSize="10" fill="#7d877f">
          {formatShort(points[0].date)}
        </text>
        <text x={width - pad.r} y={height - 6} fontSize="10" fill="#7d877f" textAnchor="end">
          {formatShort(points[points.length - 1].date)}
        </text>
        <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {lastIdx >= 0 && <circle cx={x(lastIdx)} cy={y(points[lastIdx].value!)} r="4" fill={color} stroke="#fffdf8" strokeWidth="2" />}
        {a && (
          <g>
            <line x1={x(active!)} x2={x(active!)} y1={pad.t} y2={pad.t + ih} stroke="#1b2420" strokeOpacity="0.25" />
            {a.value !== undefined && <circle cx={x(active!)} cy={y(a.value)} r="4.5" fill={color} stroke="#fffdf8" strokeWidth="2" />}
          </g>
        )}
      </svg>
      {a && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-md bg-forest-950 px-2 py-1 text-xs text-root shadow"
          style={{ left: Math.min(Math.max(x(active!) - 50, 0), width - 110) }}
        >
          <span className="text-sage-300">{formatShort(a.date)}</span>{' '}
          <span className="tnum font-medium">{a.value === undefined ? 'Not supplied' : `${fmt(a.value)} ${unit === 'pH' ? '' : unit}`}</span>
        </div>
      )}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Value ({unit})</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.date}>
              <td>{p.date}</td>
              <td>{p.value === undefined ? 'Not supplied' : fmt(p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
