import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { LineChart } from '../components/LineChart';
import { measurementDefs, suppliedKeys, zoneQualityIssues, zoneReadings } from '../lib/analysis';
import { formatShort } from '../lib/dates';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHeader, QualityChips, ReadingsTable } from './parts';
import { useDashboard } from './store';

export default function Irrigation() {
  usePageMeta('Irrigation readings');
  const { data } = useDashboard();
  const [zoneId, setZoneId] = useState(data.zones[0]?.id ?? '');
  const zone = data.zones.find((z) => z.id === zoneId);
  const readings = zone ? zoneReadings(data, zone.id) : [];
  const keys = suppliedKeys(readings);

  return (
    <>
      <PageHeader title="Irrigation" description="Supplied irrigation and nutrient-solution readings by zone. Values appear only where they exist in the sample dataset." />
      <div className="mb-5 flex items-start gap-2 rounded-lg border border-line bg-paper-2/60 p-3 text-sm text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" aria-hidden="true" />
        <p>
          These are <strong className="text-ink">sample readings</strong> entered manually or imported by CSV. This demo has no live sensor connection. Units: pH (dimensionless), EC in mS/cm, solution temperature in °C, irrigation volume in L/day, dissolved oxygen in mg/L.
        </p>
      </div>

      <div className="mb-5 overflow-x-auto">
        <div role="tablist" aria-label="Growing zone" className="inline-flex gap-1 rounded-lg border border-line bg-paper-2 p-1">
          {data.zones.map((z) => (
            <button
              key={z.id}
              role="tab"
              type="button"
              aria-selected={z.id === zoneId}
              onClick={() => setZoneId(z.id)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                const n = data.zones.length;
                const i = data.zones.findIndex((x) => x.id === zoneId);
                const next = e.key === 'ArrowRight' ? (i + 1) % n : (i - 1 + n) % n;
                setZoneId(data.zones[next].id);
                (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
              }}
              tabIndex={z.id === zoneId ? 0 : -1}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ${z.id === zoneId ? 'bg-forest-800 text-paper' : 'text-muted hover:text-ink'}`}
            >
              <span className="font-mono">{z.id}</span> · {z.crop}
            </button>
          ))}
        </div>
      </div>

      {zone && (
        <div role="tabpanel" aria-label={`${zone.id} readings`} className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {zone.system} · {readings.length} readings
              {readings.length > 0 && ` from ${formatShort(readings[0].date)} to ${formatShort(readings[readings.length - 1].date)}`} ·{' '}
              <Link to={`/dashboard/zones/${zone.id}`} className="font-medium text-forest-700 hover:underline">
                Open zone
              </Link>
            </p>
            <QualityChips issues={zoneQualityIssues(data, zone).filter((i) => i.type === 'missing_measurement' || i.type === 'outdated_reading')} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {measurementDefs.map((m) => {
              const supplied = keys.includes(m.key);
              const vals = readings.filter((r) => r[m.key] !== undefined);
              const last = vals[vals.length - 1];
              return (
                <div key={m.key} className="card min-w-0 p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                    <p className="text-sm font-medium text-ink">
                      {m.label} <span className="font-mono text-xs text-subtle">({m.unit})</span>
                    </p>
                    {last && (
                      <p className="tnum font-mono text-sm text-forest-900">
                        {last[m.key]!.toFixed(m.digits)}
                        <span className="ml-1 text-[11px] text-subtle">{formatShort(last.date)}</span>
                      </p>
                    )}
                  </div>
                  <div className="mt-3">
                    {supplied ? (
                      <LineChart points={readings.map((r) => ({ date: r.date, value: r[m.key] }))} label={m.label} unit={m.unit} digits={m.digits} />
                    ) : (
                      <div className="flex h-[140px] items-center justify-center rounded-lg border border-dashed border-line px-4 text-center text-sm text-muted">
                        Not supplied for this zone. Nothing is estimated.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card p-4">
            <h2 className="mb-3 font-sans text-sm font-semibold text-forest-900">All readings</h2>
            <ReadingsTable readings={readings} freshnessDays={data.settings.freshnessDays} />
          </div>
        </div>
      )}
    </>
  );
}
