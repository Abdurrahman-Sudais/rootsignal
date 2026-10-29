import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Images } from 'lucide-react';
import { RootImage } from '../components/RootImage';
import { EmptyState, Tooltip, buttonClass } from '../components/ui';
import { memberName, summariseObservation, zoneObservations, zoneReadings } from '../lib/analysis';
import { daysAgo, formatDate } from '../lib/dates';
import { usePageMeta } from '../lib/usePageMeta';
import { emptyFilters, FilterBar, PageHeader, type Filters } from './parts';
import { useDashboard } from './store';
import { useDashboardUI } from './uiContext';

export default function Observations() {
  usePageMeta('Observations');
  const { data } = useDashboard();
  const ui = useDashboardUI();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const enriched = useMemo(
    () =>
      data.zones.flatMap((z) => {
        const obs = zoneObservations(data, z.id);
        const rds = zoneReadings(data, z.id);
        return obs.map((o, i) => ({ zone: z, obs: o, summary: summariseObservation(o, obs[i - 1], rds.filter((r) => r.date <= o.date)) }));
      }),
    [data],
  );

  const q = filters.q.trim().toLowerCase();
  const rows = enriched
    .filter(({ zone, obs, summary }) => {
      if (q && ![zone.id, zone.crop, obs.notes ?? '', obs.method ?? '', memberName(data, obs.capturedById)].join(' ').toLowerCase().includes(q)) return false;
      if (filters.crop && zone.crop !== filters.crop) return false;
      if (filters.zone && zone.id !== filters.zone) return false;
      if (filters.priority && zone.priority !== filters.priority) return false;
      if (filters.since && daysAgo(obs.date) > Number(filters.since)) return false;
      if (flaggedOnly && !['notable', 'moderate', 'unreliable'].includes(summary.level)) return false;
      return true;
    })
    .sort((a, b) => b.obs.date.localeCompare(a.obs.date));

  return (
    <>
      <PageHeader
        title="Observations"
        description="Every root observation across Greenhouse North, newest first. Flagged observations show visible change or a quality problem."
        actions={
          <button type="button" className={buttonClass('primary', 'px-3 py-2')} onClick={() => ui.openObservationForm()}>
            Log observation
          </button>
        }
      />
      <FilterBar filters={filters} onChange={setFilters} zones={data.zones} resultCount={rows.length} searchPlaceholder="Search notes, methods, zones…" />
      <label className="mb-4 inline-flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" className="h-4 w-4 accent-forest-700" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} />
        Show flagged observations only
      </label>
      {rows.length === 0 ? (
        <EmptyState icon={<Images className="h-8 w-8" />} title="No observations match" action={<button className={buttonClass('secondary')} onClick={() => { setFilters(emptyFilters); setFlaggedOnly(false); }}>Reset filters</button>}>
          Adjust the filters, or log a new observation.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rows.map(({ zone, obs, summary }) => {
            const flagged = ['notable', 'moderate', 'unreliable'].includes(summary.level);
            const incomplete = !obs.capturedById || !obs.method || !obs.notes;
            return (
              <li key={obs.id} className="card flex flex-col overflow-hidden">
                <div className="relative">
                  <RootImage params={obs.image} uploadedUrl={obs.uploadedImageUrl} medium={zone.medium} label={`${zone.id} root observation ${formatDate(obs.date)}`} />
                  {flagged && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-paper/95 px-1.5 py-0.5 text-[11px] font-semibold text-rust-600">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" /> {summary.level === 'unreliable' ? 'Photo quality' : 'Visible change'}
                    </span>
                  )}
                  {summary.changeScore !== null && (
                    <Tooltip content="Simulated visible-change score vs the previous observation (0–100)." className="absolute right-2 top-2">
                      <span tabIndex={0} className="tnum rounded bg-forest-950/80 px-1.5 py-0.5 font-mono text-[11px] text-root">
                        Δ {summary.changeScore}
                      </span>
                    </Tooltip>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link to={`/dashboard/zones/${zone.id}`} className="font-mono text-xs font-semibold text-forest-900 hover:underline">
                      {zone.id} · {zone.crop}
                    </Link>
                    <span className="tnum text-xs text-muted">{formatDate(obs.date)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {obs.method ?? 'Method not recorded'} · {obs.capturedById ? memberName(data, obs.capturedById) : 'capturer not recorded'}
                  </p>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink">{obs.notes ?? <span className="italic text-amber-600">No notes recorded</span>}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {obs.image.quality === 'poor' && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">Poor-quality photo</span>}
                    {incomplete && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">Incomplete record</span>}
                  </div>
                  {flagged && (
                    <button type="button" className={buttonClass('secondary', 'mt-3 px-3 py-1.5 text-xs')} onClick={() => ui.openForObservation(obs.id)}>
                      Open flagged observation
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
