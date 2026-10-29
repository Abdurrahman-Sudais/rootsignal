import type { ReactNode } from 'react';
import { CalendarClock, Camera, FileWarning, Gauge, Search, ScanSearch, X } from 'lucide-react';
import type { IrrigationReading, Observation, Priority, Zone } from '../data/types';
import { RootImage } from '../components/RootImage';
import { InfoTip, Tooltip } from '../components/ui';
import {
  formatMeasurement,
  measurementDefs,
  qualityLabels,
  SUMMARY_DISCLAIMER,
  suppliedKeys,
  type ObservationSummary,
  type QualityIssue,
  type QualityIssueType,
} from '../lib/analysis';
import { daysAgo, formatDate, formatShort } from '../lib/dates';

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl text-forest-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, Icon, tone = 'default' }: { label: string; value: ReactNode; hint?: ReactNode; Icon: typeof Gauge; tone?: 'default' | 'alert' | 'warn' }) {
  const toneCls = tone === 'alert' ? 'text-rust-600' : tone === 'warn' ? 'text-amber-600' : 'text-forest-600';
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        <Icon className={`h-4 w-4 ${toneCls}`} aria-hidden="true" />
      </div>
      <p className="tnum mt-2 font-display text-3xl text-forest-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  );
}

export function ZoneThumb({ zone, observation, className = 'h-10 w-14' }: { zone: Zone; observation?: Observation; className?: string }) {
  if (!observation) {
    return (
      <div className={`flex items-center justify-center rounded-md border border-dashed border-line text-subtle ${className}`}>
        <Camera className="h-4 w-4" aria-label="No image" />
      </div>
    );
  }
  return (
    <div className={`shrink-0 overflow-hidden rounded-md ${className}`}>
      <RootImage params={observation.image} uploadedUrl={observation.uploadedImageUrl} medium={zone.medium} label={`${zone.id} root image, ${formatDate(observation.date)}`} />
    </div>
  );
}

const qualityIcon: Record<QualityIssueType, typeof Gauge> = {
  missing_measurement: Gauge,
  outdated_reading: CalendarClock,
  poor_photo: Camera,
  incomplete_record: FileWarning,
  overdue_observation: CalendarClock,
};

export function QualityChips({ issues, compact = false }: { issues: QualityIssue[]; compact?: boolean }) {
  if (!issues.length) return compact ? <span className="text-xs text-subtle">—</span> : <p className="text-sm text-muted">No data-quality issues.</p>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {issues.map((i, idx) => {
        const Icon = qualityIcon[i.type];
        return (
          <li key={idx}>
            <Tooltip content={i.message}>
              <span tabIndex={0} className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-100/60 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">
                <Icon className="h-3 w-3" aria-hidden="true" />
                {compact ? qualityLabels[i.type].split(' ')[0] : qualityLabels[i.type]}
                <span className="sr-only">: {i.message}</span>
              </span>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}

export function SummaryCard({ summary, compact = false }: { summary: ObservationSummary; compact?: boolean }) {
  const tone =
    summary.level === 'notable' ? 'border-rust-500/30 bg-rust-100/40' : summary.level === 'moderate' || summary.level === 'unreliable' ? 'border-amber-500/30 bg-amber-100/40' : 'border-line bg-paper-2/50';
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-forest-800">
          <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" /> Observation summary
        </p>
        <span className="flex items-center gap-1.5">
          {summary.changeScore !== null && (
            <Tooltip content="Simulated visible-change score (0–100) comparing root coverage and tone with the previous image. Not a health score.">
              <span tabIndex={0} className="tnum rounded bg-white/70 px-1.5 py-0.5 font-mono text-[11px] text-ink">
                Δ {summary.changeScore}
              </span>
            </Tooltip>
          )}
          <span className="font-mono text-[10px] uppercase tracking-wider text-subtle">Simulated</span>
        </span>
      </div>
      <p className="mt-2 font-display text-base leading-snug text-forest-900">{summary.headline}</p>
      {!compact && (
        <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
          {summary.points.map((p) => (
            <li key={p} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-forest-600" /> {p}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-sm font-medium text-forest-800">{summary.recommendation}</p>
      <p className="mt-3 border-t border-black/5 pt-2 text-[11px] leading-snug text-subtle">{SUMMARY_DISCLAIMER}</p>
    </div>
  );
}

/** Table of supplied readings. Columns appear only for measurements present in the data. */
export function ReadingsTable({ readings, freshnessDays, limit }: { readings: IrrigationReading[]; freshnessDays: number; limit?: number }) {
  const keys = suppliedKeys(readings);
  const rows = [...readings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  if (!rows.length) return <p className="text-sm text-muted">No irrigation readings supplied for this zone.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-subtle">
          <tr className="border-b border-line">
            <th scope="col" className="py-2 pr-3 font-medium">Date</th>
            {keys.map((k) => {
              const m = measurementDefs.find((d) => d.key === k)!;
              return (
                <th key={k} scope="col" className="py-2 pr-3 font-medium">
                  {m.short} <span className="normal-case tracking-normal text-subtle/80">({m.unit})</span>
                </th>
              );
            })}
            <th scope="col" className="py-2 pr-3 font-medium">Source</th>
          </tr>
        </thead>
        <tbody className="tnum font-mono text-[13px]">
          {rows.map((r, i) => {
            const stale = i === 0 && daysAgo(r.date) > freshnessDays;
            return (
              <tr key={r.id} className="border-b border-line/60 last:border-0">
                <td className="py-2 pr-3 font-sans text-ink">
                  {formatShort(r.date)}
                  {stale && (
                    <span className="ml-1.5 rounded bg-amber-100 px-1 py-0.5 font-sans text-[10px] font-medium text-amber-600">Outdated</span>
                  )}
                </td>
                {keys.map((k) => (
                  <td key={k} className="py-2 pr-3">
                    {r[k] === undefined ? (
                      <Tooltip content="Not supplied in the sample dataset for this date.">
                        <span tabIndex={0} className="text-subtle">
                          —<span className="sr-only">not supplied</span>
                        </span>
                      </Tooltip>
                    ) : (
                      formatMeasurement(r[k], k).replace(/ .*/, '')
                    )}
                  </td>
                ))}
                <td className="py-2 pr-3 font-sans text-xs text-muted">{r.source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export interface Filters {
  q: string;
  crop: string;
  zone: string;
  priority: '' | Priority;
  since: '' | '3' | '7' | '14' | '30';
}

export const emptyFilters: Filters = { q: '', crop: '', zone: '', priority: '', since: '' };

export function FilterBar({
  filters,
  onChange,
  zones,
  show = ['q', 'crop', 'zone', 'priority', 'since'],
  searchPlaceholder = 'Search zones, crops, growers…',
  resultCount,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  zones: Zone[];
  show?: (keyof Filters)[];
  searchPlaceholder?: string;
  resultCount: number;
}) {
  const crops = [...new Set(zones.map((z) => z.crop))].sort();
  const active = (Object.keys(filters) as (keyof Filters)[]).filter((k) => filters[k] !== '').length;
  const set = (k: keyof Filters, v: string) => onChange({ ...filters, [k]: v });
  return (
    <div className="card mb-5 p-3">
      <div className="flex flex-wrap items-end gap-3">
        {show.includes('q') && (
          <div className="min-w-[200px] flex-[2]">
            <label htmlFor="f-q" className="label">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
              <input id="f-q" type="search" className="field pl-8" placeholder={searchPlaceholder} value={filters.q} onChange={(e) => set('q', e.target.value)} />
            </div>
          </div>
        )}
        {show.includes('crop') && (
          <div className="min-w-[130px] flex-1">
            <label htmlFor="f-crop" className="label">Crop</label>
            <select id="f-crop" className="field" value={filters.crop} onChange={(e) => set('crop', e.target.value)}>
              <option value="">All crops</option>
              {crops.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
        {show.includes('zone') && (
          <div className="min-w-[130px] flex-1">
            <label htmlFor="f-zone" className="label">Zone</label>
            <select id="f-zone" className="field" value={filters.zone} onChange={(e) => set('zone', e.target.value)}>
              <option value="">All zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.id} · {z.crop}
                </option>
              ))}
            </select>
          </div>
        )}
        {show.includes('priority') && (
          <div className="min-w-[130px] flex-1">
            <label htmlFor="f-priority" className="label">
              <span className="inline-flex items-center gap-1">
                Inspection priority <InfoTip content="Priority is set by growers and updated when an inspection is completed." />
              </span>
            </label>
            <select id="f-priority" className="field" value={filters.priority} onChange={(e) => set('priority', e.target.value)}>
              <option value="">Any priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        )}
        {show.includes('since') && (
          <div className="min-w-[140px] flex-1">
            <label htmlFor="f-since" className="label">Observation date</label>
            <select id="f-since" className="field" value={filters.since} onChange={(e) => set('since', e.target.value)}>
              <option value="">Any date</option>
              <option value="3">Last 3 days</option>
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted">
        <p aria-live="polite">
          {resultCount} result{resultCount === 1 ? '' : 's'}
        </p>
        {active > 0 && (
          <button type="button" className="inline-flex items-center gap-1 font-medium text-forest-700 hover:text-forest-900" onClick={() => onChange(emptyFilters)}>
            <X className="h-3 w-3" aria-hidden="true" /> Clear filters ({active})
          </button>
        )}
      </div>
    </div>
  );
}
