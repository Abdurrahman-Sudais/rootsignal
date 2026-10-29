import { Link } from 'react-router-dom';
import { Avatar } from '../components/ui';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHeader } from './parts';
import { useDashboard } from './store';

export default function Team() {
  usePageMeta('Team');
  const { data } = useDashboard();
  return (
    <>
      <PageHeader title="Team" description="Who owns which zones and inspections at Greenhouse North. Fictional team for demonstration." />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.team.map((m) => {
          const zones = data.zones.filter((z) => z.assignedGrowerId === m.id);
          const active = data.inspections.filter((i) => i.assigneeId === m.id && i.state !== 'complete');
          const done = data.inspections.filter((i) => i.assigneeId === m.id && i.state === 'complete');
          const obs = data.observations.filter((o) => o.capturedById === m.id);
          return (
            <li key={m.id} className="card p-5">
              <div className="flex items-center gap-3">
                <Avatar initials={m.initials} className="h-10 w-10 text-sm" />
                <div>
                  <p className="font-medium text-forest-900">{m.name}</p>
                  <p className="text-xs text-muted">{m.role}</p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  ['Zones', zones.length],
                  ['Active insp.', active.length],
                  ['Observations', obs.length],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-paper-2 py-2">
                    <dt className="text-[11px] text-subtle">{k}</dt>
                    <dd className="tnum font-display text-xl text-forest-900">{v}</dd>
                  </div>
                ))}
              </dl>
              {zones.length > 0 && (
                <p className="mt-3 text-xs text-muted">
                  Owns{' '}
                  {zones.map((z, i) => (
                    <span key={z.id}>
                      <Link to={`/dashboard/zones/${z.id}`} className="font-mono font-medium text-forest-700 hover:underline">
                        {z.id}
                      </Link>
                      {i < zones.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              )}
              <p className="mt-1 text-xs text-muted">
                {m.canInspect ? `Can be assigned inspections · ${done.length} completed` : 'Not on the inspector rota'}
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
