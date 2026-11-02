import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  Droplets,
  FileBarChart,
  Images,
  LayoutDashboard,
  Layers3,
  Menu,
  Plus,
  Settings as SettingsIcon,
  Users,
  X,
  Lock,
} from 'lucide-react';
import { ROLE_LABEL, roleOf } from './access';
import { Wordmark } from '../components/Logo';
import { SampleBadge, buttonClass } from '../components/ui';
import { DEMO_TODAY, formatDate } from '../lib/dates';
import { DashboardProvider, useDashboard } from './store';
import { DashboardUIContext } from './uiContext';
import { InspectionModal } from './InspectionModal';
import { ObservationModal } from './ObservationModal';
import { summariseObservation, zoneObservations, zoneReadings } from '../lib/analysis';

const nav = [
  { to: '/dashboard', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/dashboard/zones', label: 'Growing Zones', Icon: Layers3 },
  { to: '/dashboard/observations', label: 'Observations', Icon: Images },
  { to: '/dashboard/irrigation', label: 'Irrigation', Icon: Droplets },
  { to: '/dashboard/inspections', label: 'Inspection Queue', Icon: ClipboardList, badge: true },
  { to: '/dashboard/reports', label: 'Reports', Icon: FileBarChart },
  { to: '/dashboard/team', label: 'Team', Icon: Users },
  { to: '/dashboard/audit', label: 'Audit & roles', Icon: Lock },
  { to: '/dashboard/settings', label: 'Settings', Icon: SettingsIcon },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data, userId, setUser } = useDashboard();
  const open = data.inspections.filter((i) => i.state !== 'complete').length;
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-5">
        <Wordmark inverted to="/" />
      </div>
      <div className="mx-3 mb-4 rounded-lg bg-white/5 px-3 py-2.5">
        <p className="text-[11px] uppercase tracking-wider text-sage-300">Site</p>
        <p className="text-sm font-medium text-root">{data.settings.site}</p>
        <p className="text-xs text-root/60">{data.zones.length} growing zones</p>
      </div>
      <nav aria-label="Dashboard" className="flex-1 px-3">
        <ul className="space-y-0.5">
          {nav.map(({ to, label, Icon, end, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? 'bg-root text-forest-900 font-semibold' : 'text-root/75 hover:bg-white/5 hover:text-root'}`
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {badge && open > 0 && (
                  <span className="tnum rounded-full bg-amber-500 px-1.5 text-[11px] font-semibold text-forest-950" aria-label={`${open} open`}>
                    {open}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-white/10 p-4">
        <label htmlFor="demo-as" className="mb-1.5 block text-[10px] uppercase tracking-wider text-sage-300">Demo as</label>
        <select id="demo-as" aria-label="Demo as user" className="mb-4 w-full rounded-md border border-white/15 bg-forest-950 px-2 py-1.5 text-xs text-root focus:outline-none" value={userId} onChange={(e) => setUser(e.target.value)}>
          {data.team.map((m) => <option key={m.id} value={m.id}>{m.name} · {ROLE_LABEL[roleOf(m.id)]}</option>)}
        </select>
        <Link to="/" className="flex items-center gap-2 text-xs text-root/60 hover:text-root">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to website
        </Link>
      </div>
    </div>
  );
}

function Shell() {
  const { data, dispatch } = useDashboard();
  const [drawer, setDrawer] = useState(false);
  const [obsZone, setObsZone] = useState<string | null | undefined>(undefined);
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setDrawer(false);
    document.getElementById('dash-main')?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawer]);

  const openForObservation = useCallback(
    (observationId: string) => {
      // Reuse an active inspection for this observation, else the latest completed one.
      const forObs = data.inspections.filter((i) => i.observationId === observationId);
      const existing = forObs.find((i) => i.state !== 'complete') ?? forObs[0];
      if (existing) {
        setInspectionId(existing.id);
        return;
      }
      const obs = data.observations.find((o) => o.id === observationId);
      if (!obs) return;
      const all = zoneObservations(data, obs.zoneId);
      const idx = all.findIndex((o) => o.id === observationId);
      const summary = summariseObservation(obs, all[idx - 1], zoneReadings(data, obs.zoneId));
      const zone = data.zones.find((z) => z.id === obs.zoneId);
      const next = Math.max(1000, ...data.inspections.map((i) => Number(i.id.replace(/\D/g, '')) || 0)) + 1;
      const id = `INS-${next}`;
      const ok = dispatch({
        type: 'createInspection',
        inspection: {
          id,
          zoneId: obs.zoneId,
          observationId,
          createdAt: DEMO_TODAY,
          reason: summary.headline,
          priority: zone?.priority ?? 'medium',
          state: 'open',
          notes: [],
        },
      });
      if (ok) setInspectionId(id);
    },
    [data, dispatch],
  );

  const ui = useMemo(
    () => ({
      openObservationForm: (zoneId?: string) => setObsZone(zoneId ?? null),
      openInspection: (id: string) => setInspectionId(id),
      openForObservation,
    }),
    [openForObservation],
  );

  return (
    <DashboardUIContext.Provider value={ui}>
      <div className="min-h-screen bg-paper lg:pl-64">
        <a href="#dash-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-forest-800 focus:px-3 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-forest-900 lg:block">
          <Sidebar />
        </aside>
        {drawer && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard navigation">
            <div className="absolute inset-0 bg-forest-950/50" onClick={() => setDrawer(false)} />
            <div className="animate-fade-up absolute inset-y-0 left-0 w-72 bg-forest-900">
              <button type="button" className="absolute right-3 top-4 rounded p-1.5 text-root/80" onClick={() => setDrawer(false)} aria-label="Close navigation">
                <X className="h-5 w-5" />
              </button>
              <Sidebar onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-6">
          <button type="button" className="rounded p-1.5 text-forest-900 lg:hidden" onClick={() => setDrawer(true)} aria-label="Open navigation" aria-expanded={drawer}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-forest-900">
              {data.settings.site} <span className="hidden text-muted sm:inline">· {data.settings.organisation}</span>
            </p>
          </div>
          <span className="hidden text-xs text-muted md:inline">Data as of {formatDate(DEMO_TODAY)}</span>
          <SampleBadge className="hidden sm:inline-flex" />
          <button type="button" className={buttonClass('primary', 'px-3 py-1.5')} onClick={() => setObsZone(null)}>
            <Plus className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">Log observation</span>
            <span className="sm:hidden">Log</span>
          </button>
        </header>
        <div id="dash-content" tabIndex={-1} className="px-4 py-6 outline-none sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
      <ObservationModal open={obsZone !== undefined} zoneId={obsZone ?? undefined} onClose={() => setObsZone(undefined)} />
      <InspectionModal inspectionId={inspectionId} onClose={() => setInspectionId(null)} />
    </DashboardUIContext.Provider>
  );
}

export default function DashboardLayout() {
  return (
    <DashboardProvider>
      <Shell />
    </DashboardProvider>
  );
}
