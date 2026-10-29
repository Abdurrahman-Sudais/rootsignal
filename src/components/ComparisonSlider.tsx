import { useId, useState } from 'react';
import type { Observation } from '../data/types';
import { formatDate } from '../lib/dates';
import { RootImage } from './RootImage';

interface Props {
  previous: Observation;
  current: Observation;
  medium: 'water' | 'substrate';
  highlight: boolean;
}

/**
 * Previous-versus-current comparison. A range input controls the split so the
 * comparison is fully keyboard accessible (arrow keys, Home/End).
 */
export function ComparisonSlider({ previous, current, medium, highlight }: Props) {
  const [pos, setPos] = useState(50);
  const id = useId();
  return (
    <div>
      <div className="relative overflow-hidden rounded-xl bg-forest-950">
        <RootImage
          params={current.image}
          uploadedUrl={current.uploadedImageUrl}
          medium={medium}
          compareTo={highlight ? previous.image : undefined}
          label={`Current observation, ${formatDate(current.date)}`}
          showScale
        />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <RootImage params={previous.image} uploadedUrl={previous.uploadedImageUrl} medium={medium} label={`Previous observation, ${formatDate(previous.date)}`} />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-root shadow" style={{ left: `${pos}%` }} aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-root font-mono text-[10px] text-forest-900 shadow-md">
            ⇆
          </div>
        </div>
        <span className="absolute left-2 top-2 rounded bg-forest-950/75 px-2 py-0.5 font-mono text-[10px] text-root">Previous · {formatDate(previous.date)}</span>
        <span className="absolute right-2 top-2 rounded bg-forest-950/75 px-2 py-0.5 font-mono text-[10px] text-root">Current · {formatDate(current.date)}</span>
      </div>
      <label htmlFor={id} className="sr-only">
        Comparison position: percentage of the previous image shown
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="mt-3 w-full accent-forest-700"
        aria-valuetext={`${pos}% previous image`}
      />
    </div>
  );
}
