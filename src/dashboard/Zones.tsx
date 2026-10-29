import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers3 } from 'lucide-react';
import { EmptyState, InspectionStatusBadge, PriorityBadge, buttonClass } from '../components/ui';
import { formatMeasurement, latestPair, memberName, zoneInspectionStatus, zoneQualityIssues, zoneReadings } from '../lib/analysis';
import { daysAgo, formatShort } from '../lib/dates';
import { usePageMeta } from '../lib/usePageMeta';
import { emptyFilters, FilterBar, PageHeader, QualityChips, ZoneThumb, type Filters } from './parts';
import { useDashboard } from './store';

export default function Zones() {
  usePageMeta('Growing zones');
  const { data } = useDashboard();
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const q = filters.q.trim().toLowerCase();
  const rows = data.zones.filter((z) => {
    const { current } = latestPair(data, z.id);
    if (q && ![z.id, z.crop, z.cultivar, z.system, z.name, memberName(data, z.assignedGrowerId)].join(' ').toLowerCase().includes(q)) return false;
    if (filters.crop && z.crop !== filters.crop) return false;
    if (filters.zone && z.id !== filters.zone) return false;
    if (filters.priority && z.priority !== filters.priority) return false;
    if (filters.since && (!current || daysAgo(current.date) > Number(filters.since))) return false;
    return true;
  });

  return (
    <>
      <PageHeader title="Growing zones" description="Zone inventory for Greenhouse North. Select a zone to see its image gallery, comparisons, readings, notes and inspection history." />
      <FilterBar filters={filters} onChange={setFilters} zones={data.zones} resultCount={rows.length} />
      {rows.length === 0 ? (
        <EmptyState icon={<Layers3 className="h-8 w-8" />} title="No zones match these filters" action={<button className={buttonClass('secondary')} onClick={() => setFilters(emptyFilters)}>Clear filters</button>}>
          Try widening the observation date range or clearing the search.
        </EmptyState>
      ) : (
        <>
          {/* Table for larger screens */}
          <div className="card hidden overflow-x-auto md:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-subtle">
                <tr className="border-b border-line">
                  <th scope="col" className="px-4 py-2.5 font-medium">Zone</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Latest obs.</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Previous obs.</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Latest irrigation reading</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Priority</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Inspection</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Grower</th>
                  <th scope="col" className="px-3 py-2.5 font-medium">Data quality</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((z) => {
                  const { current, previous } = latestPair(data, z.id);
                  const rds = zoneReadings(data, z.id);
                  const r = rds[rds.length - 1];
                  return (
                    <tr key={z.id} className="border-b border-line/60 last:border-0 hover:bg-paper-2/50">
                      <td className="px-4 py-3">
                        <Link to={`/dashboard/zones/${z.id}`} className="flex items-center gap-3">
                          <ZoneThumb zone={z} observation={current} className="h-11 w-[60px]" />
                          <span>
                            <span className="block font-mono text-xs font-semibold text-forest-900 underline-offset-2 hover:underline">{z.id}</span>
                            <span className="block text-sm text-ink">{z.crop}</span>
                            <span className="block text-xs text-muted">{z.system}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="tnum px-3 py-3 text-xs">{current ? formatShort(current.date) : '—'}</td>
                      <td className="tnum px-3 py-3 text-xs text-muted">{previous ? formatShort(previous.date) : '—'}</td>
                      <td className="tnum px-3 py-3 font-mono text-[12px] leading-5">
                        {r ? (
                          <>
                            <span className="text-ink">pH {formatMeasurement(r.ph, 'ph')}</span> · <span>EC {formatMeasurement(r.ecMsCm, 'ecMsCm')}</span>
                            <br />
                            <span className="text-muted">{formatMeasurement(r.waterTempC, 'waterTempC')} · {formatMeasurement(r.volumeLPerDay, 'volumeLPerDay')}</span>
                            <span className="block font-sans text-[11px] text-subtle">{formatShort(r.date)}</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <PriorityBadge priority={z.priority} />
                      </td>
                      <td className="px-3 py-3">
                        <InspectionStatusBadge status={zoneInspectionStatus(data, z.id).status} />
                      </td>
                      <td className="px-3 py-3 text-xs">{memberName(data, z.assignedGrowerId)}</td>
                      <td className="px-3 py-3">
                        <QualityChips issues={zoneQualityIssues(data, z)} compact />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Cards for small screens */}
          <ul className="grid gap-3 md:hidden">
            {rows.map((z) => {
              const { current, previous } = latestPair(data, z.id);
              return (
                <li key={z.id}>
                  <Link to={`/dashboard/zones/${z.id}`} className="card flex gap-3 p-3">
                    <ZoneThumb zone={z} observation={current} className="h-20 w-24" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-mono text-xs font-semibold text-forest-900">{z.id}</p>
                        <PriorityBadge priority={z.priority} />
                      </div>
                      <p className="text-sm text-ink">{z.crop} · {z.cultivar}</p>
                      <p className="text-xs text-muted">
                        Latest {current ? formatShort(current.date) : '—'} · prev. {previous ? formatShort(previous.date) : '—'}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <InspectionStatusBadge status={zoneInspectionStatus(data, z.id).status} />
                        <span className="text-xs text-muted">{memberName(data, z.assignedGrowerId)}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
