import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
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
  dispatch: React.Dispatch<Action>;
}

const DashboardContext = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try {
      // Uploaded images are session-only object URLs; don't persist them.
      const persistable = { ...data, observations: data.observations.map(({ uploadedImageUrl: _u, ...o }) => o) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {
      /* ignore */
    }
  }, [data]);
  const value = useMemo(() => ({ data, dispatch }), [data]);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): Ctx {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside DashboardProvider');
  return ctx;
}
