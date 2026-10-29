import { Download } from 'lucide-react';
import { Tooltip, buttonClass } from '../components/ui';
import { allQualityIssues, memberName, qualityLabels, type QualityIssueType } from '../lib/analysis';
import { addDays, DEMO_TODAY, daysBetween, formatShort } from '../lib/dates';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHeader } from './parts';
import { useDashboard } from './store';

function toCsv(rows: Record<string, string | number | undefined>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
}

function download(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Reports() {
  usePageMeta('Reports');
  const { data } = useDashboard();
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const end = addDays(DEMO_TODAY, -7 * (5 - i));
    const start = addDays(end, -6);
    const count = data.observations.filter((o) => o.date >= start && o.date <= end).length;
    return { start, end, count };
  });
  const maxWeek = Math.max(1, ...weeks.map((w) => w.count));
  const completed = data.inspections.filter((i) => i.state === 'complete' && i.completedAt);
  const avgDays = completed.length ? completed.reduce((s, i) => s + daysBetween(i.createdAt, i.completedAt!), 0) / completed.length : null;
  const states = [
    { label: 'Open', n: data.inspections.filter((i) => i.state === 'open').length, cls: 'bg-amber-500' },
    { label: 'In progress', n: data.inspections.filter((i) => i.state === 'in_progress').length, cls: 'bg-forest-600' },
    { label: 'Complete', n: completed.length, cls: 'bg-sage-500' },
  ];
  const total = Math.max(1, data.inspections.length);
  const issues = allQualityIssues(data);
  const issueTypes = Object.keys(qualityLabels) as QualityIssueType[];

  return (
    <>
      <PageHeader
        title="Reports"
        description="Summary of observation activity, inspection throughput and data quality. Export raw sample data as CSV."
        actions={
          <>
            <button
              type="button"
              className={buttonClass('secondary', 'px-3 py-2')}
              onClick={() =>
                download(
                  'rootsignal-observations-sample.csv',
                  toCsv(data.observations.map((o) => ({ id: o.id, zone: o.zoneId, date: o.date, captured_by: o.capturedById ? memberName(data, o.capturedById) : '', method: o.method, photo_quality: o.image.quality, notes: o.notes }))),
                )
              }
            >
              <Download className="h-4 w-4" /> Observations CSV
            </button>
            <button
              type="button"
              className={buttonClass('secondary', 'px-3 py-2')}
              onClick={() =>
                download(
                  'rootsignal-irrigation-sample.csv',
                  toCsv(data.readings.map((r) => ({ id: r.id, zone: r.zoneId, date: r.date, ph: r.ph, ec_mS_cm: r.ecMsCm, solution_temp_C: r.waterTempC, volume_L_day: r.volumeLPerDay, dissolved_oxygen_mg_L: r.dissolvedOxygenMgL, source: r.source }))),
                )
              }
            >
              <Download className="h-4 w-4" /> Readings CSV
            </button>
            <button
              type="button"
              className={buttonClass('secondary', 'px-3 py-2')}
              onClick={() =>
                download(
                  'rootsignal-inspections-sample.csv',
                  toCsv(data.inspections.map((i) => ({ id: i.id, zone: i.zoneId, opened: i.createdAt, state: i.state, priority: i.priority, inspector: memberName(data, i.assigneeId), finding: i.finding?.category, detail: i.finding?.detail, completed: i.completedAt }))),
                )
              }
            >
              <Download className="h-4 w-4" /> Inspections CSV
            </button>
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card min-w-0 p-5" aria-labelledby="r-obs">
          <h2 id="r-obs" className="font-sans text-sm font-semibold text-forest-900">Observations per week</h2>
          <p className="text-xs text-muted">Last six weeks, all zones</p>
          <div className="mt-5 flex h-44 items-end gap-3" role="list">
            {weeks.map((w) => (
              <div key={w.end} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5" role="listitem">
                <span className="tnum text-xs font-medium text-ink">{w.count}</span>
                <Tooltip content={`${formatShort(w.start)} – ${formatShort(w.end)}: ${w.count} observations`} className="w-full">
                  <span
                    tabIndex={0}
                    className="block w-full rounded-t bg-forest-600 transition-colors hover:bg-forest-700"
                    style={{ height: `${Math.max(4, (w.count / maxWeek) * 128)}px` }}
                    aria-label={`Week ending ${formatShort(w.end)}: ${w.count} observations`}
                  />
                </Tooltip>
                <span className="tnum text-[11px] text-subtle">{formatShort(w.end)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card min-w-0 p-5" aria-labelledby="r-insp">
          <h2 id="r-insp" className="font-sans text-sm font-semibold text-forest-900">Inspections</h2>
          <p className="text-xs text-muted">
            {data.inspections.length} total · average time to complete {avgDays === null ? '—' : `${avgDays.toFixed(1)} days`}
          </p>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-paper-2" aria-hidden="true">
            {states.map((s) => (
              <div key={s.label} className={`${s.cls} border-r-2 border-[#fffdf8] last:border-0`} style={{ width: `${(s.n / total) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {states.map((s) => (
              <li key={s.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-sm ${s.cls}`} aria-hidden="true" /> {s.label}
                </span>
                <span className="tnum font-mono">{s.n}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-6 font-sans text-xs font-semibold uppercase tracking-wider text-subtle">Recorded findings</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {completed.map((i) => (
              <li key={i.id} className="flex justify-between gap-3">
                <span className="text-ink">
                  <span className="font-mono text-xs text-subtle">{i.zoneId}</span> {i.finding?.category}
                </span>
                <span className="tnum shrink-0 text-xs text-muted">{formatShort(i.completedAt!)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card min-w-0 p-5 lg:col-span-2" aria-labelledby="r-dq">
          <h2 id="r-dq" className="font-sans text-sm font-semibold text-forest-900">Data quality by zone</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-subtle">
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-3 font-medium">Zone</th>
                  {issueTypes.map((t) => (
                    <th key={t} scope="col" className="py-2 pr-3 font-medium">{qualityLabels[t]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.zones.map((z) => (
                  <tr key={z.id} className="border-b border-line/60 last:border-0">
                    <th scope="row" className="py-2 pr-3 font-mono text-xs font-medium text-forest-900">{z.id}</th>
                    {issueTypes.map((t) => {
                      const has = issues.filter((i) => i.zoneId === z.id && i.type === t);
                      return (
                        <td key={t} className="py-2 pr-3">
                          {has.length ? (
                            <Tooltip content={has.map((h) => h.message).join(' ')}>
                              <span tabIndex={0} className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-600">
                                Issue<span className="sr-only">: {has.map((h) => h.message).join(' ')}</span>
                              </span>
                            </Tooltip>
                          ) : (
                            <span className="text-xs text-subtle">OK</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
