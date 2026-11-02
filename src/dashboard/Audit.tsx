import { useMemo, useState } from 'react';
import { Check, Download, Minus } from 'lucide-react';
import { Avatar, buttonClass } from '../components/ui';
import { usePageMeta } from '../lib/usePageMeta';
import { MEMBER_ROLE, PERMISSIONS, PERMISSION_LABEL, ROLE_LABEL, can, memberName, type DemoRole } from './access';
import { PageHeader } from './parts';
import { useDashboard } from './store';

const ROLES: DemoRole[] = ['head', 'lead', 'grower', 'technician'];
const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export default function Audit() {
  usePageMeta('Audit & roles');
  const { data, audit, can: allowed, role } = useDashboard();
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return [...audit].reverse().filter((e) => !t || `${memberName(e.userId)} ${e.action} ${e.detail}`.toLowerCase().includes(t));
  }, [audit, q]);
  const exportCsv = () => {
    const text = [['Time', 'Person', 'Action', 'Detail'], ...rows.map((e) => [e.at, memberName(e.userId), e.action, e.detail])].map((r) => r.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rootsignal-audit-log.csv';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <PageHeader title="Audit & roles" description="Who can do what in this demo dashboard, and an append-only record of every change made in this browser. Switch user under “Demo as” to try each role." />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="min-w-0 space-y-6">
          <section className="card p-5">
            <h2 className="text-sm font-semibold text-forest-900">Roles and permissions</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-[11px] text-subtle"><th className="py-2 pr-3 font-medium">Action</th>{ROLES.map((r) => <th key={r} className="px-2 py-2 text-center font-medium">{ROLE_LABEL[r]}</th>)}</tr></thead>
                <tbody>
                  {PERMISSIONS.map((p) => (
                    <tr key={p} className="border-t border-line">
                      <td className="py-2 pr-3">{PERMISSION_LABEL[p]}</td>
                      {ROLES.map((r) => <td key={r} className="px-2 py-2 text-center">{can(r, p) ? <Check className="mx-auto h-4 w-4 text-forest-600" aria-label="Allowed" /> : <Minus className="mx-auto h-4 w-4 text-subtle/50" aria-label="Not allowed" />}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-subtle">Resetting the demo is open to everyone because it only clears this browser. In production, roles come from your identity provider and are enforced on the server.</p>
          </section>
          <section className="card p-5">
            <h2 className="text-sm font-semibold text-forest-900">People in this demo</h2>
            <ul className="mt-2 divide-y divide-line">
              {data.team.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2.5"><Avatar initials={m.initials} /><span><span className="block">{m.name}</span><span className="block text-[11px] text-subtle">{m.role}</span></span></span>
                  <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px]">{ROLE_LABEL[MEMBER_ROLE[m.id] ?? 'technician']}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <section className="card min-w-0 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-forest-900">Audit log ({audit.length})</h2>
            {allowed('audit') && <button type="button" className={buttonClass('secondary', 'px-3 py-1.5 text-xs')} onClick={exportCsv}><Download className="h-3.5 w-3.5" /> Export CSV</button>}
          </div>
          <div className="mt-3">
            {!allowed('audit') ? (
              <p role="note" className="rounded-md border border-line bg-paper-2 px-3 py-2 text-xs text-muted">🔒 Acting as {ROLE_LABEL[role].toLowerCase()}: only the head grower can read the audit log. Switch to Amara Osei under “Demo as”.</p>
            ) : (
              <>
                <label htmlFor="audit-q" className="sr-only">Filter the audit log</label>
                <input id="audit-q" className="field mb-3" placeholder="Filter by person, action or zone…" value={q} onChange={(e) => setQ(e.target.value)} />
                <ol className="divide-y divide-line">
                  {rows.map((e) => (
                    <li key={e.id} className="py-2.5 text-[13px]">
                      <div className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-medium text-forest-900">{memberName(e.userId)}</span><span className="font-mono text-[11px] text-subtle">{fmt(e.at)}</span></div>
                      <div className="text-ink"><span className="mr-1.5 rounded bg-paper-2 px-1.5 py-0.5 font-mono text-[10px] uppercase text-subtle">{e.action}</span>{e.detail}</div>
                    </li>
                  ))}
                  {!rows.length && <li className="py-3 text-sm text-subtle">No changes yet. Add an observation or work an inspection, and it will appear here.</li>}
                </ol>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
