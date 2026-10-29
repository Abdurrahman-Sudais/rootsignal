import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Avatar, EmptyState, PriorityBadge, buttonClass } from '../components/ui';
import type { InspectionState, Priority } from '../data/types';
import { memberName, zoneObservations } from '../lib/analysis';
import { formatShort, relativeDays } from '../lib/dates';
import { usePageMeta } from '../lib/usePageMeta';
import { PageHeader, ZoneThumb } from './parts';
import { useDashboard } from './store';
import { useDashboardUI } from './uiContext';

const tabs: { id: 'active' | InspectionState | 'all'; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'complete', label: 'Complete' },
  { id: 'all', label: 'All' },
];

const rank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export default function InspectionQueue() {
  usePageMeta('Inspection queue');
  const { data } = useDashboard();
  const ui = useDashboardUI();
  const [tab, setTab] = useState<(typeof tabs)[number]['id']>('active');
  const [assignee, setAssignee] = useState('');

  const counts = Object.fromEntries(
    tabs.map((t) => [t.id, data.inspections.filter((i) => (t.id === 'all' ? true : t.id === 'active' ? i.state !== 'complete' : i.state === t.id)).length]),
  );
  const rows = data.inspections
    .filter((i) => (tab === 'all' ? true : tab === 'active' ? i.state !== 'complete' : i.state === tab))
    .filter((i) => (assignee === '' ? true : assignee === 'none' ? !i.assigneeId : i.assigneeId === assignee))
    .sort((a, b) => (a.state === 'complete' ? 1 : 0) - (b.state === 'complete' ? 1 : 0) || rank[a.priority] - rank[b.priority] || b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <PageHeader title="Inspection queue" description="Open a flagged observation, review the evidence, assign an inspector, record a finding and mark it complete." />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div role="tablist" aria-label="Inspection state" className="flex flex-wrap gap-1 rounded-lg border border-line bg-paper-2 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${tab === t.id ? 'bg-forest-800 text-paper' : 'text-muted hover:text-ink'}`}
            >
              {t.label} <span className="tnum opacity-70">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="q-assignee" className="label">Inspector</label>
          <select id="q-assignee" className="field w-auto" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Anyone</option>
            <option value="none">Unassigned</option>
            {data.team.filter((m) => m.canInspect).map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<ClipboardCheck className="h-8 w-8" />} title={tab === 'active' ? 'All caught up' : 'No inspections here'}>
          {tab === 'active' ? 'There are no open inspections. Flagged observations will appear here.' : 'Try a different tab or inspector filter.'}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {rows.map((i) => {
            const zone = data.zones.find((z) => z.id === i.zoneId)!;
            const obs = zoneObservations(data, i.zoneId).find((o) => o.id === i.observationId);
            const member = data.team.find((m) => m.id === i.assigneeId);
            return (
              <li key={i.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <ZoneThumb zone={zone} observation={obs} className="h-16 w-full sm:h-16 sm:w-24" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-subtle">{i.id}</span>
                    <span className="font-mono text-xs font-semibold text-forest-900">{zone.id} · {zone.crop}</span>
                    <PriorityBadge priority={i.priority} />
                    <span className={`text-xs font-medium ${i.state === 'complete' ? 'text-forest-600' : i.state === 'in_progress' ? 'text-forest-700' : 'text-amber-600'}`}>
                      {i.state === 'complete' ? 'Complete' : i.state === 'in_progress' ? 'In progress' : 'Open'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink">{i.finding && i.state === 'complete' ? i.finding.category : i.reason}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Opened {formatShort(i.createdAt)} ({relativeDays(i.createdAt)}) · {i.notes.length} note{i.notes.length === 1 ? '' : 's'}
                    {i.completedAt && ` · completed ${formatShort(i.completedAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:w-56 sm:justify-end">
                  <span className="flex items-center gap-2 text-xs text-muted">
                    {member ? <Avatar initials={member.initials} /> : null}
                    {memberName(data, i.assigneeId)}
                  </span>
                  <button type="button" className={buttonClass(i.state === 'complete' ? 'secondary' : 'primary', 'px-3 py-1.5 text-xs')} onClick={() => ui.openInspection(i.id)}>
                    {i.state === 'complete' ? 'View' : 'Review'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
