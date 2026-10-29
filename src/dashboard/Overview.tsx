import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ClipboardList, Database, Images } from 'lucide-react';
import { InspectionStatusBadge, PriorityBadge, buttonClass } from '../components/ui';
import {
  allQualityIssues,
  latestPair,
  memberName,
  summariseObservation,
  zoneInspectionStatus,
  zoneQualityIssues,
  zoneReadings,
} from '../lib/analysis';
import { daysAgo, formatShort, relativeDays } from '../lib/dates';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHeader, QualityChips, StatCard, SummaryCard, ZoneThumb } from './parts';
import { useDashboard } from './store';
import { useDashboardUI } from './uiContext';

const rank = { high: 0, medium: 1, low: 2 } as const;

export default function Overview() {
  usePageMeta('Dashboard overview');
  const { data } = useDashboard();
  const ui = useDashboardUI();
  const open = data.inspections.filter((i) => i.state !== 'complete');
  const issues = allQualityIssues(data);
  const recentObs = data.observations.filter((o) => daysAgo(o.date) <= 7);
  const zonesSorted = [...data.zones].sort((a, b) => rank[a.priority] - rank[b.priority]);
  const top = zonesSorted[0];
  const topPair = top ? latestPair(data, top.id) : {};

  return (
    <>
      <PageHeader title="Overview" description="Which growing zones need a closer look today. All figures are sample data for the fictional Greenhouse North." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="High-priority zones" value={data.zones.filter((z) => z.priority === 'high').length} hint={`of ${data.zones.length} zones`} Icon={AlertTriangle} tone="alert" />
        <StatCard label="Open inspections" value={open.length} hint={`${open.filter((i) => !i.assigneeId).length} unassigned`} Icon={ClipboardList} tone="warn" />
        <StatCard label="Observations, last 7 days" value={recentObs.length} hint={`${data.observations.length} in total`} Icon={Images} />
        <StatCard label="Data-quality issues" value={issues.length} hint={`across ${new Set(issues.map((i) => i.zoneId)).size} zones`} Icon={Database} tone={issues.length ? 'warn' : 'default'} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="card overflow-hidden" aria-labelledby="prio-h">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h2 id="prio-h" className="font-sans text-sm font-semibold text-forest-900">Inspection priorities</h2>
            <Link to="/dashboard/zones" className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-900">
              All zones <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-subtle">
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-2 font-medium">Zone</th>
                  <th scope="col" className="px-3 py-2 font-medium">Last observed</th>
                  <th scope="col" className="px-3 py-2 font-medium">Priority</th>
                  <th scope="col" className="px-3 py-2 font-medium">Status</th>
                  <th scope="col" className="px-3 py-2 font-medium">Data quality</th>
                </tr>
              </thead>
              <tbody>
                {zonesSorted.map((z) => {
                  const { current } = latestPair(data, z.id);
                  return (
                    <tr key={z.id} className="border-b border-line/60 last:border-0 hover:bg-paper-2/50">
                      <td className="px-4 py-2.5">
                        <Link to={`/dashboard/zones/${z.id}`} className="flex items-center gap-3 rounded focus-visible:outline-offset-4">
                          <ZoneThumb zone={z} observation={current} />
                          <span>
                            <span className="block font-mono text-xs font-medium text-forest-900">{z.id}</span>
                            <span className="block text-xs text-muted">{z.crop} · {memberName(data, z.assignedGrowerId)}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="tnum px-3 py-2.5 text-xs text-muted">{current ? `${formatShort(current.date)} · ${relativeDays(current.date)}` : '—'}</td>
                      <td className="px-3 py-2.5">
                        <PriorityBadge priority={z.priority} />
                      </td>
                      <td className="px-3 py-2.5">
                        <InspectionStatusBadge status={zoneInspectionStatus(data, z.id).status} />
                      </td>
                      <td className="px-3 py-2.5">
                        <QualityChips issues={zoneQualityIssues(data, z)} compact />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="focus-h" className="card p-4">
          <h2 id="focus-h" className="font-sans text-sm font-semibold text-forest-900">Needs a closer look</h2>
          {top && topPair.current ? (
            <>
              <p className="mt-1 text-xs text-muted">
                <span className="font-mono">{top.id}</span> · {top.crop} · observed {formatShort(topPair.current.date)}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <ZoneThumb zone={top} observation={topPair.previous} className="aspect-[4/3] w-full" />
                <ZoneThumb zone={top} observation={topPair.current} className="aspect-[4/3] w-full" />
              </div>
              <div className="mt-3">
                <SummaryCard summary={summariseObservation(topPair.current, topPair.previous, zoneReadings(data, top.id))} compact />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className={buttonClass('primary', 'px-3 py-2')} onClick={() => ui.openForObservation(topPair.current!.id)}>
                  Open inspection
                </button>
                <Link to={`/dashboard/zones/${top.id}`} className={buttonClass('secondary', 'px-3 py-2')}>
                  View zone
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted">No zones need attention.</p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-4" aria-labelledby="queue-h">
          <div className="flex items-center justify-between">
            <h2 id="queue-h" className="font-sans text-sm font-semibold text-forest-900">Inspection queue</h2>
            <Link to="/dashboard/inspections" className="text-xs font-semibold text-forest-700 hover:text-forest-900">Open queue</Link>
          </div>
          {open.length ? (
            <ul className="mt-3 divide-y divide-line">
              {open.map((i) => (
                <li key={i.id}>
                  <button type="button" onClick={() => ui.openInspection(i.id)} className="flex w-full items-start justify-between gap-3 py-3 text-left hover:bg-paper-2/40">
                    <span>
                      <span className="font-mono text-xs text-subtle">{i.id} · {i.zoneId}</span>
                      <span className="mt-0.5 block text-sm text-ink">{i.reason}</span>
                      <span className="mt-1 block text-xs text-muted">{memberName(data, i.assigneeId)}</span>
                    </span>
                    <PriorityBadge priority={i.priority} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">The inspection queue is empty.</p>
          )}
        </section>
        <section className="card p-4" aria-labelledby="dq-h">
          <h2 id="dq-h" className="font-sans text-sm font-semibold text-forest-900">Data quality</h2>
          {issues.length ? (
            <ul className="mt-3 divide-y divide-line">
              {issues.map((i, idx) => (
                <li key={idx} className="flex items-start justify-between gap-3 py-3">
                  <span>
                    <Link to={`/dashboard/zones/${i.zoneId}`} className="font-mono text-xs font-medium text-forest-800 hover:underline">
                      {i.zoneId}
                    </Link>
                    <span className="mt-0.5 block text-sm text-ink">{i.message}</span>
                  </span>
                  <QualityChips issues={[i]} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No data-quality issues found.</p>
          )}
        </section>
      </div>
    </>
  );
}
