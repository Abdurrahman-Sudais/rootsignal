import type { DashboardData, DashboardSettings, Inspection, IrrigationReading, Observation, Zone } from '../data/types';
import { daysAgo } from './dates';
import { diffObservations } from './rootModel';

export const measurementDefs = [
  { key: 'ph', label: 'pH', unit: 'pH', short: 'pH', digits: 2 },
  { key: 'ecMsCm', label: 'Electrical conductivity', unit: 'mS/cm', short: 'EC', digits: 2 },
  { key: 'waterTempC', label: 'Solution temperature', unit: '°C', short: 'Temp', digits: 1 },
  { key: 'volumeLPerDay', label: 'Irrigation volume', unit: 'L/day', short: 'Volume', digits: 0 },
  { key: 'dissolvedOxygenMgL', label: 'Dissolved oxygen', unit: 'mg/L', short: 'DO', digits: 1 },
] as const;

export type MeasurementKey = (typeof measurementDefs)[number]['key'];

export function formatMeasurement(value: number | undefined, key: MeasurementKey): string {
  const def = measurementDefs.find((m) => m.key === key)!;
  if (value === undefined) return '—';
  const v = value.toFixed(def.digits);
  return key === 'ph' ? v : `${v} ${def.unit}`;
}

export function zoneObservations(data: DashboardData, zoneId: string): Observation[] {
  return data.observations.filter((o) => o.zoneId === zoneId).sort((a, b) => a.date.localeCompare(b.date));
}

export function zoneReadings(data: DashboardData, zoneId: string): IrrigationReading[] {
  return data.readings.filter((r) => r.zoneId === zoneId).sort((a, b) => a.date.localeCompare(b.date));
}

export function zoneInspections(data: DashboardData, zoneId: string): Inspection[] {
  return data.inspections.filter((i) => i.zoneId === zoneId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Which measurement keys appear at least once for a zone in the dataset. */
export function suppliedKeys(readings: IrrigationReading[]): MeasurementKey[] {
  return measurementDefs.map((m) => m.key).filter((k) => readings.some((r) => r[k] !== undefined));
}

export type QualityIssueType = 'missing_measurement' | 'outdated_reading' | 'poor_photo' | 'incomplete_record' | 'overdue_observation';

export interface QualityIssue {
  type: QualityIssueType;
  zoneId: string;
  message: string;
}

export const qualityLabels: Record<QualityIssueType, string> = {
  missing_measurement: 'Missing measurement',
  outdated_reading: 'Outdated reading',
  poor_photo: 'Poor-quality photo',
  incomplete_record: 'Incomplete record',
  overdue_observation: 'Observation overdue',
};

export function zoneQualityIssues(data: DashboardData, zone: Zone, settings: DashboardSettings = data.settings): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const obs = zoneObservations(data, zone.id);
  const rds = zoneReadings(data, zone.id);
  const latestObs = obs[obs.length - 1];
  const latestRd = rds[rds.length - 1];

  if (!latestRd) {
    issues.push({ type: 'missing_measurement', zoneId: zone.id, message: 'No irrigation readings have been supplied.' });
  } else {
    const age = daysAgo(latestRd.date);
    if (age > settings.freshnessDays) {
      issues.push({ type: 'outdated_reading', zoneId: zone.id, message: `Latest reading is ${age} days old (threshold ${settings.freshnessDays} days).` });
    }
    const missing = measurementDefs.filter((m) => m.key !== 'dissolvedOxygenMgL' && latestRd[m.key] === undefined).map((m) => m.short);
    if (missing.length) {
      issues.push({ type: 'missing_measurement', zoneId: zone.id, message: `Latest reading has no ${missing.join(', ')} value.` });
    }
  }
  if (!latestObs) {
    issues.push({ type: 'overdue_observation', zoneId: zone.id, message: 'No root observations recorded.' });
  } else {
    if (latestObs.image.quality === 'poor') {
      issues.push({ type: 'poor_photo', zoneId: zone.id, message: 'Latest root image is too hazy or dark for reliable comparison.' });
    }
    const missingFields = [!latestObs.capturedById && 'captured by', !latestObs.method && 'method', !latestObs.notes && 'notes'].filter(Boolean);
    if (missingFields.length) {
      issues.push({ type: 'incomplete_record', zoneId: zone.id, message: `Latest observation is missing: ${missingFields.join(', ')}.` });
    }
    const age = daysAgo(latestObs.date);
    if (age > settings.observationIntervalDays) {
      issues.push({ type: 'overdue_observation', zoneId: zone.id, message: `Last observation was ${age} days ago (interval ${settings.observationIntervalDays} days).` });
    }
  }
  return issues;
}

export function allQualityIssues(data: DashboardData): QualityIssue[] {
  return data.zones.flatMap((z) => zoneQualityIssues(data, z));
}

export type ZoneInspectionStatus = 'flagged' | 'assigned' | 'in_progress' | 'clear';

export const inspectionStatusLabel: Record<ZoneInspectionStatus, string> = {
  flagged: 'Flagged',
  assigned: 'Assigned',
  in_progress: 'In progress',
  clear: 'No open inspection',
};

export function zoneInspectionStatus(data: DashboardData, zoneId: string): { status: ZoneInspectionStatus; inspection?: Inspection } {
  const open = zoneInspections(data, zoneId).filter((i) => i.state !== 'complete');
  const inProg = open.find((i) => i.state === 'in_progress');
  if (inProg) return { status: 'in_progress', inspection: inProg };
  const unassigned = open.find((i) => !i.assigneeId);
  if (unassigned) return { status: 'flagged', inspection: unassigned };
  if (open[0]) return { status: 'assigned', inspection: open[0] };
  return { status: 'clear' };
}

export interface ObservationSummary {
  headline: string;
  points: string[];
  recommendation: string;
  changeScore: number | null;
  level: 'none' | 'low' | 'moderate' | 'notable' | 'unreliable';
}

export const SUMMARY_DISCLAIMER =
  'Simulated summary. It describes visible differences between images only. Image appearance alone does not establish disease, nutrient deficiency, or a required treatment.';

function describeTrend(readings: IrrigationReading[], key: 'ph' | 'waterTempC' | 'ecMsCm', label: string, unit: string): string | null {
  const vals = readings.filter((r) => r[key] !== undefined);
  if (vals.length < 2) return null;
  const first = vals[0][key]!;
  const last = vals[vals.length - 1][key]!;
  const digits = key === 'waterTempC' ? 1 : 2;
  const u = unit ? ` ${unit}` : '';
  if (Math.abs(last - first) < (key === 'waterTempC' ? 0.8 : 0.2)) return `${label} has stayed near ${last.toFixed(digits)}${u}`;
  return `${label} moved from ${first.toFixed(digits)}${u} to ${last.toFixed(digits)}${u}`;
}

export function summariseObservation(current: Observation, previous: Observation | undefined, readings: IrrigationReading[]): ObservationSummary {
  if (current.image.quality === 'poor') {
    return {
      headline: 'Image quality limits comparison with the previous observation.',
      points: ['The current image appears hazy or low in contrast, so visible differences cannot be described reliably.'],
      recommendation: 'Re-capture the root image under consistent lighting before drawing conclusions.',
      changeScore: null,
      level: 'unreliable',
    };
  }
  if (!previous) {
    return {
      headline: 'This is the first observation recorded for this zone.',
      points: ['There is no earlier image to compare against yet.'],
      recommendation: 'Continue routine observations to build a baseline.',
      changeScore: null,
      level: 'none',
    };
  }
  const diff = diffObservations(current.image.seed, previous.image, current.image);
  const points: string[] = [];
  if (diff.densityDelta < -0.08) points.push(`Fewer fine roots are visible in the imaged area (apparent coverage ${Math.round(diff.densityDelta * 100)}% versus the previous image).`);
  else if (diff.densityDelta > 0.08) points.push(`More root material is visible in the imaged area (apparent coverage +${Math.round(diff.densityDelta * 100)}%).`);
  if (diff.toneDelta > 0.06) points.push('Root tones appear darker than in the previous image, mostly in the lower part of the frame.');
  else if (diff.toneDelta < -0.06) points.push('Root tones appear lighter than in the previous image.');
  if (diff.cells.length) points.push(`The ${diff.cells.length === 1 ? 'region' : `${diff.cells.length} regions`} with the largest visible differences ${diff.cells.length === 1 ? 'is' : 'are'} outlined in the comparison view.`);

  const window = readings.filter((r) => daysAgo(r.date) <= 14);
  const context = [
    describeTrend(window, 'ph', 'pH', ''),
    describeTrend(window, 'ecMsCm', 'EC', 'mS/cm'),
    describeTrend(window, 'waterTempC', 'Solution temperature', '°C'),
  ].filter(Boolean);
  if (context.length) points.push(`Supplied readings for context over the past 14 days: ${context.join('; ')}.`);
  else points.push('No irrigation readings were supplied for the past 14 days.');

  const s = diff.changeScore;
  if (s >= 35) {
    return {
      headline: 'Visible root appearance differs from the previous observation.',
      points,
      recommendation: 'Recent irrigation readings are displayed for context. An inspection is recommended to gather additional evidence.',
      changeScore: s,
      level: 'notable',
    };
  }
  if (s >= 12) {
    return {
      headline: 'Some visible differences from the previous observation.',
      points,
      recommendation: 'Consider including this zone in the next routine inspection round.',
      changeScore: s,
      level: 'moderate',
    };
  }
  return {
    headline: 'Visible root appearance is broadly consistent with the previous observation.',
    points: points.length > 1 ? points : ['No meaningful visible differences were detected.', ...points],
    recommendation: 'No additional inspection is suggested by the image comparison; continue routine observations.',
    changeScore: s,
    level: s >= 6 ? 'low' : 'none',
  };
}

export function latestPair(data: DashboardData, zoneId: string): { current?: Observation; previous?: Observation } {
  const obs = zoneObservations(data, zoneId);
  return { current: obs[obs.length - 1], previous: obs[obs.length - 2] };
}

export function memberName(data: DashboardData, id?: string): string {
  if (!id) return 'Unassigned';
  return data.team.find((m) => m.id === id)?.name ?? 'Unknown';
}
