import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import { can as roleCan, roleOf, type AuditEntry, type DemoRole, type Permission } from './access';
import { createSampleData } from '../data/greenhouse';
import type {
  DashboardData,
  DashboardSettings,
  FindingCategory,
  GrowerNote,
  Inspection,
  IrrigationReading,
  Observation,
  Priority,
} from '../data/types';
import { DEMO_TODAY } from '../lib/dates';

const STORAGE_KEY = 'rootsignal-demo-v1';
/** Acting user and audit log live under their own key so the demo data format is unchanged. */
const ACCESS_KEY = 'rootsignal-access-v1';

type Action =
  | { type: 'addObservation'; observation: Observation; reading?: IrrigationReading }
  | { type: 'addNote'; note: GrowerNote }
  | { type: 'createInspection'; inspection: Inspection }
  | { type: 'assignInspection'; id: string; assigneeId?: string }
  | { type: 'addInspectionNote'; id: string; text: string; authorId?: string }
  | { type: 'recordFinding'; id: string; category: FindingCategory; detail: string }
  | { type: 'completeInspection'; id: string; zonePriority: Priority }
  | { type: 'setZonePriority'; zoneId: string; priority: Priority }
  | { type: 'updateSettings'; settings: Partial<DashboardSettings> }
  | { type: 'reset' };

/** Which permission each action needs. Resetting this browser's demo data is open to everyone. */
export function permissionFor(a: Action): Permission | null {
  switch (a.type) {
    case 'addObservation':
      return 'observe';
    case 'addNote':
      return 'note';
    case 'createInspection':
      return 'create';
    case 'assignInspection':
      return 'assign';
    case 'addInspectionNote':
    case 'recordFinding':
      return 'inspect';
    case 'completeInspection':
      return 'complete';
    case 'setZonePriority':
      return 'priority';
    case 'updateSettings':
      return 'settings';
    default:
      return null;
  }
}

function describe(a: Action): string {
  switch (a.type) {
    case 'addObservation':
      return `${a.observation.zoneId}: observation ${a.observation.id} added${a.reading ? ' with an irrigation reading' : ''}.`;
    case 'addNote':
      return `${a.note.zoneId}: note added.`;
    case 'createInspection':
      return `${a.inspection.zoneId}: inspection ${a.inspection.id} opened.`;
    case 'assignInspection':
      return `${a.id}: ${a.assigneeId ? `assigned to ${a.assigneeId}` : 'unassigned'}.`;
    case 'addInspectionNote':
      return `${a.id}: inspection note added.`;
    case 'recordFinding':
      return `${a.id}: finding recorded (${a.category}).`;
    case 'completeInspection':
      return `${a.id}: completed; zone priority set to ${a.zonePriority}.`;
    case 'setZonePriority':
      return `${a.zoneId}: priority set to ${a.priority}.`;
    case 'updateSettings':
      return `Settings changed: ${Object.keys(a.settings).join(', ')}.`;
    default:
      return a.type;
  }
}

let counter = 0;
export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${(counter++).toString(36)}`;

function updateInspection(state: DashboardData, id: string, fn: (i: Inspection) => Inspection): DashboardData {
  return { ...state, inspections: state.inspections.map((i) => (i.id === id ? fn(i) : i)) };
}

function reducer(state: DashboardData, action: Action): DashboardData {
  switch (action.type) {
    case 'addObservation':
      return {
        ...state,
        observations: [...state.observations, action.observation],
        readings: action.reading ? [...state.readings, action.reading] : state.readings,
      };
    case 'addNote':
      return { ...state, notes: [action.note, ...state.notes] };
    case 'createInspection':
      return { ...state, inspections: [action.inspection, ...state.inspections] };
    case 'assignInspection':
      return updateInspection(state, action.id, (i) => ({
        ...i,
        assigneeId: action.assigneeId,
        state: i.state === 'complete' ? i.state : action.assigneeId ? 'in_progress' : 'open',
      }));
    case 'addInspectionNote':
      return updateInspection(state, action.id, (i) => ({
        ...i,
        notes: [...i.notes, { id: uid('IN'), date: DEMO_TODAY, authorId: action.authorId, text: action.text }],
      }));
    case 'recordFinding':
      return updateInspection(state, action.id, (i) => ({ ...i, finding: { category: action.category, detail: action.detail } }));
    case 'completeInspection': {
      const insp = state.inspections.find((i) => i.id === action.id);
      const next = updateInspection(state, action.id, (i) => ({ ...i, state: 'complete', completedAt: DEMO_TODAY }));
      if (!insp) return next;
      return { ...next, zones: next.zones.map((z) => (z.id === insp.zoneId ? { ...z, priority: action.zonePriority } : z)) };
    }
    case 'setZonePriority':
      return { ...state, zones: state.zones.map((z) => (z.id === action.zoneId ? { ...z, priority: action.priority } : z)) };
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'reset':
      return createSampleData();
  }
}

function load(): DashboardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DashboardData;
      if (Array.isArray(parsed.zones) && Array.isArray(parsed.inspections)) return parsed;
    }
  } catch {
    /* storage unavailable — fall back to sample data */
  }
  return createSampleData();
}

interface Ctx {
  data: DashboardData;
  /** Permission-checked dispatch: refused actions are ignored (returns false); permitted changes are audited. */
  dispatch: (a: Action) => boolean;
  userId: string;
  role: DemoRole;
  can: (p: Permission) => boolean;
  setUser: (id: string) => void;
  audit: AuditEntry[];
}

function loadAccess(): { userId: string; audit: AuditEntry[] } {
  try {
    const raw = localStorage.getItem(ACCESS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as { userId?: string; audit?: AuditEntry[] };
      return { userId: typeof p.userId === 'string' ? p.userId : 'amara', audit: Array.isArray(p.audit) ? p.audit : [] };
    }
  } catch {
    /* ignore */
  }
  return { userId: 'amara', audit: [] };
}

const DashboardContext = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, rawDispatch] = useReducer(reducer, undefined, load);
  const [access, setAccess] = useState(loadAccess);
  useEffect(() => {
    try {
      localStorage.setItem(ACCESS_KEY, JSON.stringify(access));
    } catch {
      /* ignore */
    }
  }, [access]);
  const role = roleOf(access.userId);
  const allowed = useCallback((p: Permission) => roleCan(role, p), [role]);
  const dispatch = useCallback(
    (a: Action) => {
      const need = permissionFor(a);
      if (need && !allowed(need)) return false;
      rawDispatch(a);
      if (a.type === 'reset') setAccess((s) => ({ ...s, audit: [] }));
      if (need) setAccess((s) => ({ ...s, audit: [...s.audit, { id: uid('AU'), at: new Date().toISOString(), userId: s.userId, action: need, detail: describe(a) }] }));
      return true;
    },
    [allowed],
  );
  const setUser = useCallback((id: string) => setAccess((s) => ({ ...s, userId: id })), []);
  useEffect(() => {
    try {
      // Uploaded images are session-only object URLs; don't persist them.
      const persistable = { ...data, observations: data.observations.map(({ uploadedImageUrl: _u, ...o }) => o) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {
      /* ignore */
    }
  }, [data]);
  const value = useMemo(() => ({ data, dispatch, userId: access.userId, role, can: allowed, setUser, audit: access.audit }), [data, dispatch, access, role, allowed, setUser]);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): Ctx {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider');
  return ctx;
}
