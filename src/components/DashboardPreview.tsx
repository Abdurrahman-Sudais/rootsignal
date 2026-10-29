import { AlertTriangle, CalendarDays, Droplets, LayoutGrid } from 'lucide-react';
import { createSampleData } from '../data/greenhouse';
import { latestPair, zoneInspectionStatus, zoneReadings } from '../lib/analysis';
import { formatShort } from '../lib/dates';
import { RootImage } from './RootImage';
import { InspectionStatusBadge, PriorityBadge, SampleBadge } from './ui';

const data = createSampleData();
const order = { high: 0, medium: 1, low: 2 } as const;

/** Static, non-interactive preview of the dashboard for the marketing hero. */
export function DashboardPreview() {
  const rows = [...data.zones].sort((a, b) => order[a.priority] - order[b.priority]);
  const a1 = data.zones[0];
  const { current, previous } = latestPair(data, a1.id);
  const a1Readings = zoneReadings(data, a1.id).slice(-6);
  const max = Math.max(...a1Readings.map((r) => r.volumeLPerDay ?? 0));

  return (
    <div className="@container overflow-hidden rounded-2xl border border-forest-900/15 bg-[#fffdf8] shadow-[0_30px_60px_-30px_rgba(16,41,28,0.45)]" aria-label="Preview of the Rootsignal dashboard with sample data" role="figure">
      <div className="flex items-center justify-between border-b border-line bg-paper-2/60 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-forest-900">
          <LayoutGrid className="h-3.5 w-3.5 text-forest-600" aria-hidden="true" /> Greenhouse North · Inspection priorities
        </div>
        <SampleBadge />
      </div>
      <div className="grid gap-0 @2xl:grid-cols-[1.35fr_1fr]">
        <div className="border-b border-line @2xl:border-b-0 @2xl:border-r">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-subtle">
              <tr className="border-b border-line">
                <th className="px-3 py-2 font-medium">Zone</th>
                <th className="hidden px-2 py-2 font-medium @sm:table-cell">Last observed</th>
                <th className="px-2 py-2 font-medium">Priority</th>
                <th className="hidden px-2 py-2 font-medium @sm:table-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((z) => {
                const pair = latestPair(data, z.id);
                return (
                  <tr key={z.id} className="border-b border-line/70 last:border-0">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {pair.current && (
                          <div className="h-7 w-9 shrink-0 overflow-hidden rounded">
                            <RootImage params={pair.current.image} medium={z.medium} label={`${z.id} root thumbnail`} />
                          </div>
                        )}
                        <div>
                          <div className="font-mono text-[11px] font-medium text-forest-900">{z.id}</div>
                          <div className="text-[11px] text-muted">{z.crop}</div>
                        </div>
                      </div>
                    </td>
                    <td className="tnum hidden px-2 py-2 text-muted @sm:table-cell">{pair.current ? formatShort(pair.current.date) : '—'}</td>
                    <td className="px-2 py-2">
                      <PriorityBadge priority={z.priority} />
                    </td>
                    <td className="hidden px-2 py-2 @sm:table-cell">
                      <InspectionStatusBadge status={zoneInspectionStatus(data, z.id).status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 p-3 @md:grid-cols-2 @2xl:grid-cols-1 @2xl:content-start">
          <div className="flex items-center justify-between @md:col-span-2 @2xl:col-span-1">
            <p className="font-mono text-[11px] font-medium text-forest-900">GN-A1 · Lettuce</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rust-600">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Visible change
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {previous && (
              <figure>
                <div className="overflow-hidden rounded-md">
                  <RootImage params={previous.image} label="Previous observation" />
                </div>
                <figcaption className="mt-1 flex items-center gap-1 text-[10px] text-muted">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" /> {formatShort(previous.date)}
                </figcaption>
              </figure>
            )}
            {current && (
              <figure>
                <div className="overflow-hidden rounded-md">
                  <RootImage params={current.image} compareTo={previous?.image} label="Current observation with changed regions outlined" />
                </div>
                <figcaption className="mt-1 flex items-center gap-1 text-[10px] text-muted">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" /> {formatShort(current.date)}
                </figcaption>
              </figure>
            )}
          </div>
          <div className="rounded-lg border border-line p-2.5">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-forest-900">
              <Droplets className="h-3.5 w-3.5 text-forest-600" aria-hidden="true" /> Recent irrigation readings
            </div>
            <div className="flex h-12 items-end gap-1.5" aria-hidden="true">
              {a1Readings.map((r) => (
                <div key={r.id} className="flex-1 rounded-t bg-sage-500" style={{ height: `${((r.volumeLPerDay ?? 0) / max) * 100}%` }} />
              ))}
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
              {(() => {
                const last = a1Readings[a1Readings.length - 1];
                return [
                  ['pH', last.ph?.toFixed(2)],
                  ['EC', last.ecMsCm !== undefined ? `${last.ecMsCm.toFixed(2)} mS/cm` : undefined],
                  ['Temp', last.waterTempC !== undefined ? `${last.waterTempC.toFixed(1)} °C` : undefined],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-subtle">{k}</dt>
                    <dd className="tnum font-medium text-ink">{v ?? 'Not supplied'}</dd>
                  </div>
                ));
              })()}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
