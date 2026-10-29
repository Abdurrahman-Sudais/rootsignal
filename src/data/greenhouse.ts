/**
 * SAMPLE DATA — Greenhouse North (fictional).
 * Every value here is demonstration data. Nothing is connected to live sensors.
 * Measurements are only shown in the UI when they are present in this file.
 */
import { addDays, DEMO_TODAY } from '../lib/dates';
import type {
  DashboardData,
  GrowerNote,
  Inspection,
  IrrigationReading,
  Observation,
  TeamMember,
  Zone,
} from './types';

const d = (offset: number) => addDays(DEMO_TODAY, offset);

export const team: TeamMember[] = [
  { id: 'amara', name: 'Amara Osei', role: 'Head grower', initials: 'AO', canInspect: true },
  { id: 'tomas', name: 'Tomás Reyes', role: 'Grower — leafy crops', initials: 'TR', canInspect: true },
  { id: 'lena', name: 'Lena Hartmann', role: 'Crop protection & inspections lead', initials: 'LH', canInspect: true },
  { id: 'priya', name: 'Priya Nair', role: 'Grower — fruiting crops', initials: 'PN', canInspect: true },
  { id: 'jonah', name: 'Jonah Whitfield', role: 'Irrigation technician', initials: 'JW', canInspect: false },
  { id: 'mei', name: 'Mei Tanaka', role: 'Crop scientist', initials: 'MT', canInspect: true },
];

export const zones: Zone[] = [
  { id: 'GN-A1', name: 'Bay A · Channel block 1', crop: 'Lettuce', cultivar: 'Butterhead', system: 'NFT channels', bay: 'Bay A', areaM2: 420, plantCount: 9600, assignedGrowerId: 'tomas', priority: 'high', seed: 1187, medium: 'water' },
  { id: 'GN-A2', name: 'Bay A · Raft pond 2', crop: 'Basil', cultivar: 'Genovese', system: 'Deep water culture rafts', bay: 'Bay A', areaM2: 360, plantCount: 14400, assignedGrowerId: 'tomas', priority: 'low', seed: 2093, medium: 'water' },
  { id: 'GN-B1', name: 'Bay B · High-wire rows 1–6', crop: 'Tomato', cultivar: 'Truss, cherry', system: 'Rockwool slabs, drip', bay: 'Bay B', areaM2: 1250, plantCount: 3100, assignedGrowerId: 'priya', priority: 'medium', seed: 3311, medium: 'substrate' },
  { id: 'GN-B2', name: 'Bay B · Table-top gutters', crop: 'Strawberry', cultivar: 'Everbearing', system: 'Coco gutters, drip', bay: 'Bay B', areaM2: 680, plantCount: 8200, assignedGrowerId: 'priya', priority: 'medium', seed: 4127, medium: 'substrate' },
  { id: 'GN-C1', name: 'Bay C · Rows 1–4', crop: 'Cucumber', cultivar: 'Mini, seedless', system: 'Rockwool slabs, drip', bay: 'Bay C', areaM2: 900, plantCount: 2400, assignedGrowerId: 'amara', priority: 'low', seed: 5261, medium: 'substrate' },
  { id: 'GN-C2', name: 'Bay C · Flood benches', crop: 'Spinach', cultivar: 'Baby leaf', system: 'Ebb & flow benches', bay: 'Bay C', areaM2: 300, plantCount: 21000, assignedGrowerId: 'amara', priority: 'high', seed: 6043, medium: 'water' },
];

interface ObsSpec {
  offset: number;
  density: number;
  browning: number;
  quality?: 'good' | 'poor';
  by?: string;
  method?: string;
  notes?: string;
}

function obs(zone: Zone, specs: ObsSpec[]): Observation[] {
  return specs.map((s, i) => ({
    id: `${zone.id}-OB${String(i + 1).padStart(2, '0')}`,
    zoneId: zone.id,
    date: d(s.offset),
    capturedById: s.by,
    method: s.method,
    notes: s.notes,
    image: { seed: zone.seed, density: s.density, browning: s.browning, quality: s.quality ?? 'good' },
  }));
}

const [A1, A2, B1, B2, C1, C2] = zones;

export const observations: Observation[] = [
  ...obs(A1, [
    { offset: -35, density: 0.94, browning: 0.05, by: 'tomas', method: 'Channel lift, plant 40', notes: 'Roots white, dense fine root mat.' },
    { offset: -28, density: 0.95, browning: 0.05, by: 'tomas', method: 'Channel lift, plant 40', notes: 'No visible change.' },
    { offset: -21, density: 0.95, browning: 0.06, by: 'tomas', method: 'Channel lift, plant 40', notes: 'Consistent with last week.' },
    { offset: -14, density: 0.93, browning: 0.08, by: 'tomas', method: 'Channel lift, plant 40', notes: 'Slightly fewer fine roots at channel end.' },
    { offset: -7, density: 0.9, browning: 0.12, by: 'tomas', method: 'Channel lift, plant 40', notes: 'Tones a little darker toward tips.' },
    { offset: -1, density: 0.68, browning: 0.48, by: 'tomas', method: 'Channel lift, plant 40', notes: 'Root mat looks thinner. Flagged for a closer look.' },
  ]),
  ...obs(A2, [
    { offset: -30, density: 0.86, browning: 0.06, by: 'tomas', method: 'Raft lift, raft 12', notes: 'Healthy-looking root curtain.' },
    { offset: -23, density: 0.87, browning: 0.05, by: 'tomas', method: 'Raft lift, raft 12' , notes: 'No change.' },
    { offset: -16, density: 0.88, browning: 0.06, by: 'tomas', method: 'Raft lift, raft 12', notes: 'No change.' },
    { offset: -9, density: 0.88, browning: 0.07, by: 'tomas', method: 'Raft lift, raft 12', notes: 'No change.' },
    { offset: -2, density: 0.89, browning: 0.06, by: 'tomas', method: 'Raft lift, raft 12', notes: 'Consistent.' },
  ]),
  ...obs(B1, [
    { offset: -30, density: 0.8, browning: 0.16, by: 'priya', method: 'Slab cut-back, row 3', notes: 'Good root penetration into slab.' },
    { offset: -23, density: 0.8, browning: 0.18, by: 'priya', method: 'Slab cut-back, row 3', notes: 'Similar to previous.' },
    { offset: -16, density: 0.79, browning: 0.2, by: 'priya', method: 'Slab cut-back, row 3', notes: 'Slightly darker near drip stake.' },
    { offset: -9, density: 0.77, browning: 0.27, by: 'priya', method: 'Slab cut-back, row 3', notes: 'Darker tones near drip stake. Review next round.' },
  ]),
  ...obs(B2, [
    { offset: -23, density: 0.74, browning: 0.17, by: 'priya', method: 'Gutter window, position 18', notes: 'Roots filling gutter evenly.' },
    { offset: -16, density: 0.75, browning: 0.17, by: 'priya', method: 'Gutter window, position 18', notes: 'Consistent.' },
    { offset: -9, density: 0.74, browning: 0.18, by: 'priya', method: 'Gutter window, position 18', notes: 'Consistent.' },
    { offset: -2, density: 0.73, browning: 0.2, quality: 'poor', by: 'priya', method: 'Gutter window, position 18', notes: 'Condensation on window — image is hazy.' },
  ]),
  ...obs(C1, [
    { offset: -28, density: 0.82, browning: 0.1, by: 'amara', method: 'Slab cut-back, row 2', notes: 'Good white root growth.' },
    { offset: -21, density: 0.83, browning: 0.12, by: 'amara', method: 'Slab cut-back, row 2', notes: 'Consistent.' },
    { offset: -14, density: 0.84, browning: 0.11, by: 'amara', method: 'Slab cut-back, row 2', notes: 'Consistent.' },
    { offset: -4, density: 0.85, browning: 0.12, by: 'amara', method: 'Slab cut-back, row 2', notes: 'No visible change.' },
  ]),
  ...obs(C2, [
    { offset: -24, density: 0.88, browning: 0.09, by: 'amara', method: 'Bench pot pull, bench 3', notes: 'Dense, pale roots.' },
    { offset: -17, density: 0.88, browning: 0.1, by: 'amara', method: 'Bench pot pull, bench 3', notes: 'Consistent.' },
    { offset: -10, density: 0.86, browning: 0.12, by: 'amara', method: 'Bench pot pull, bench 3', notes: 'Consistent.' },
    // Incomplete record: no capturer, method or notes recorded.
    { offset: -3, density: 0.74, browning: 0.26 },
  ]),
];

interface ReadingSpec {
  ph?: (t: number) => number | undefined;
  ec?: (t: number) => number | undefined;
  temp?: (t: number) => number | undefined;
  vol?: (t: number) => number | undefined;
  dox?: (t: number) => number | undefined;
}

const round = (v: number | undefined, p = 1) => (v === undefined ? undefined : Number(v.toFixed(p)));
const wobble = (i: number, amp: number, seed: number) => Math.sin(i * 1.7 + seed) * amp;

function readings(zoneId: string, offsets: number[], spec: ReadingSpec, source: IrrigationReading['source'] = 'Manual entry'): IrrigationReading[] {
  return offsets.map((offset, i) => {
    const t = offsets.length === 1 ? 1 : i / (offsets.length - 1);
    return {
      id: `${zoneId}-RD${String(i + 1).padStart(2, '0')}`,
      zoneId,
      date: d(offset),
      ph: round(spec.ph?.(t), 2),
      ecMsCm: round(spec.ec?.(t), 2),
      waterTempC: round(spec.temp?.(t), 1),
      volumeLPerDay: round(spec.vol?.(t), 0),
      dissolvedOxygenMgL: round(spec.dox?.(t), 1),
      source,
    };
  });
}

const everyOther = (from: number, to: number, step = 2) => {
  const out: number[] = [];
  for (let o = from; o <= to; o += step) out.push(o);
  return out;
};

export const irrigationReadings: IrrigationReading[] = [
  // A1: pH and solution temperature rise over the last week (context only).
  ...readings('GN-A1', everyOther(-20, 0), {
    ph: (t) => (t < 0.6 ? 6.0 + wobble(t * 10, 0.05, 1) : 6.0 + (t - 0.6) * 2.25),
    ec: (t) => 1.6 - t * 0.2 + wobble(t * 10, 0.03, 2),
    temp: (t) => (t < 0.55 ? 21.4 + wobble(t * 10, 0.3, 3) : 21.4 + (t - 0.55) * 7.5),
    vol: (t) => 182 + wobble(t * 10, 6, 4),
    dox: (t) => (t < 0.55 ? 7.9 : 7.9 - (t - 0.55) * 4),
  }),
  ...readings('GN-A2', everyOther(-20, -1, 2), {
    ph: (t) => 5.9 + wobble(t * 10, 0.06, 5),
    ec: (t) => 1.8 + wobble(t * 10, 0.04, 6),
    temp: (t) => 20.6 + wobble(t * 10, 0.4, 7),
    vol: (t) => 140 + wobble(t * 10, 5, 8),
    dox: (t) => 8.2 + wobble(t * 10, 0.15, 9),
  }),
  // B1: last reading five days old — outdated under the default 3-day threshold.
  ...readings('GN-B1', everyOther(-25, -5, 2), {
    ph: (t) => 5.8 + wobble(t * 10, 0.08, 10),
    ec: (t) => 3.1 + t * 0.2 + wobble(t * 10, 0.05, 11),
    temp: (t) => 19.5 + wobble(t * 10, 0.4, 12),
    vol: (t) => 960 + wobble(t * 10, 40, 13),
  }, 'CSV import'),
  ...readings('GN-B2', everyOther(-20, -1, 2), {
    ph: (t) => 5.7 + wobble(t * 10, 0.05, 14),
    ec: (t) => 1.5 + wobble(t * 10, 0.05, 15),
    temp: (t) => 18.8 + wobble(t * 10, 0.5, 16),
    vol: (t) => 410 + wobble(t * 10, 15, 17),
  }),
  // C1: no solution temperature or DO probe — those measurements are never supplied.
  ...readings('GN-C1', everyOther(-20, -1, 2), {
    ph: (t) => 5.9 + wobble(t * 10, 0.07, 18),
    ec: (t) => 2.6 + wobble(t * 10, 0.06, 19),
    vol: (t) => 1080 + wobble(t * 10, 35, 20),
  }),
  // C2: the most recent reading is missing pH and EC.
  ...readings('GN-C2', everyOther(-20, -2, 2), {
    ph: (t) => (t > 0.95 ? undefined : 6.1 + t * 0.25 + wobble(t * 10, 0.04, 21)),
    ec: (t) => (t > 0.95 ? undefined : 1.9 + wobble(t * 10, 0.05, 22)),
    temp: (t) => 20.2 + t * 1.6 + wobble(t * 10, 0.3, 23),
    vol: (t) => 95 + wobble(t * 10, 4, 24),
  }),
];

export const growerNotes: GrowerNote[] = [
  { id: 'N-1', zoneId: 'GN-A1', date: d(-6), authorId: 'jonah', text: 'Chiller on the A-side reservoir serviced. Running normally after restart.' },
  { id: 'N-2', zoneId: 'GN-A1', date: d(-1), authorId: 'tomas', text: 'Root mat at plant 40 looks thinner than last week. Requested inspection; leaves look normal for now.' },
  { id: 'N-3', zoneId: 'GN-A2', date: d(-9), authorId: 'tomas', text: 'New raft batch introduced on pond 2, rows 1–4.' },
  { id: 'N-4', zoneId: 'GN-B1', date: d(-9), authorId: 'priya', text: 'Drip stake in row 3 repositioned after cut-back.' },
  { id: 'N-5', zoneId: 'GN-B2', date: d(-2), authorId: 'priya', text: 'Window fogged during capture. Will re-shoot tomorrow morning before misting.' },
  { id: 'N-6', zoneId: 'GN-C1', date: d(-12), authorId: 'amara', text: 'No solution temperature probe on this line yet — readings are pH, EC and volume only.' },
  { id: 'N-7', zoneId: 'GN-C2', date: d(-3), authorId: 'jonah', text: 'Flood cycle on bench 3 changed from 4 to 5 per day.' },
];

export const inspections: Inspection[] = [
  {
    id: 'INS-1042', zoneId: 'GN-A1', observationId: 'GN-A1-OB06', createdAt: d(-1), priority: 'high', state: 'open',
    reason: 'Visible root appearance differs from the previous observation.',
    notes: [],
  },
  {
    id: 'INS-1041', zoneId: 'GN-C2', observationId: 'GN-C2-OB04', createdAt: d(-3), priority: 'high', state: 'in_progress', assigneeId: 'mei',
    reason: 'Visible root appearance differs from the previous observation; observation record incomplete.',
    notes: [{ id: 'IN-1', date: d(-2), authorId: 'mei', text: 'Pulled three pots from bench 3. Will compare with bench 1 tomorrow.' }],
  },
  {
    id: 'INS-1039', zoneId: 'GN-B2', observationId: 'GN-B2-OB04', createdAt: d(-2), priority: 'medium', state: 'open', assigneeId: 'lena',
    reason: 'Photo quality too low for a reliable comparison.',
    notes: [],
  },
  {
    id: 'INS-1033', zoneId: 'GN-B1', observationId: 'GN-B1-OB04', createdAt: d(-9), priority: 'medium', state: 'open',
    reason: 'Some visible tone difference from the previous observation.',
    notes: [],
  },
  {
    id: 'INS-1030', zoneId: 'GN-C1', observationId: 'GN-C1-OB03', createdAt: d(-14), priority: 'low', state: 'complete', assigneeId: 'amara',
    reason: 'Routine fortnightly inspection.',
    notes: [{ id: 'IN-2', date: d(-13), authorId: 'amara', text: 'Checked rows 1–4, no visible issues.' }],
    finding: { category: 'No visible concern confirmed on inspection', detail: 'Root appearance consistent across sampled slabs. No action taken.' },
    completedAt: d(-13),
  },
  {
    id: 'INS-1024', zoneId: 'GN-A1', observationId: 'GN-A1-OB03', createdAt: d(-21), priority: 'low', state: 'complete', assigneeId: 'lena',
    reason: 'Routine fortnightly inspection.',
    notes: [],
    finding: { category: 'No visible concern confirmed on inspection', detail: 'Sampled six plants along channel 1. Roots appeared consistent.' },
    completedAt: d(-20),
  },
  {
    id: 'INS-1019', zoneId: 'GN-B1', observationId: 'GN-B1-OB01', createdAt: d(-30), priority: 'medium', state: 'complete', assigneeId: 'priya',
    reason: 'Drip line pressure complaint from night shift.',
    notes: [],
    finding: { category: 'Irrigation or equipment issue identified', detail: 'Two blocked drippers in row 3 replaced.' },
    completedAt: d(-29),
  },
];

export const defaultSettings = {
  organisation: 'Northfield Growers (sample)',
  site: 'Greenhouse North',
  freshnessDays: 3,
  observationIntervalDays: 8,
};

export function createSampleData(): DashboardData {
  return structuredClone({
    zones,
    observations,
    readings: irrigationReadings,
    notes: growerNotes,
    inspections,
    team,
    settings: defaultSettings,
  });
}
