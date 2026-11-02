/**
 * Simulated, record-grounded assistant for the demo dashboard.
 * Answers only from current zones, observations, readings and inspections, and lists the records it used.
 * Refuses to diagnose plant disease, prescribe treatments or predict yield — those need a person at the bench.
 * No model or external API is called.
 */
import type { DashboardData, Zone } from '../data/types';
import { allQualityIssues, latestPair, memberName, qualityLabels, summariseObservation, zoneInspectionStatus, zoneReadings, inspectionStatusLabel } from '../lib/analysis';

export interface AssistantAnswer {
  kind: 'answer' | 'refusal' | 'help';
  title: string;
  lines: string[];
  sources: string[];
  links: { label: string; to: string }[];
}

export const EXAMPLE_QUESTIONS = ['Which zones need inspection?', 'Which zones have data problems?', 'What changed in GN-A1?', 'Show open inspections', 'Does GN-A1 have root rot?'] as const;

const REFUSAL_RE = /\b(root rot|pythium|disease|infect\w*|diagnos\w*|pathogen|fungus|treat(ment)?|spray|fungicide|dose|prescri\w*|predict\w*|yield|forecast\w*|will (it|they) die|what is wrong with)\b/i;

const REFUSAL: AssistantAnswer = {
  kind: 'refusal',
  title: 'That needs a person at the bench',
  lines: [
    'Rootsignal highlights visible changes between root observations and keeps irrigation and environment readings beside them. It does not diagnose disease, recommend treatments or predict yield.',
    'I can show what changed in a zone, which readings are missing or outdated, and whether an inspection is open.',
  ],
  sources: [],
  links: [{ label: 'Open the inspection queue', to: '/dashboard/inspections' }],
};

function zoneSummary(z: Zone, d: DashboardData): AssistantAnswer {
  const { current, previous } = latestPair(d, z.id);
  const status = zoneInspectionStatus(d, z.id);
  const issues = allQualityIssues(d).filter((q) => q.zoneId === z.id);
  const lines = [`${z.name} · ${z.crop} (${z.cultivar}), ${z.system}. Priority ${z.priority}; grower ${memberName(d, z.assignedGrowerId)}.`];
  if (current) {
    const s = summariseObservation(current, previous, zoneReadings(d, z.id));
    lines.push(`Latest observation ${current.id} on ${current.date}: ${s.headline}`);
  } else lines.push('No observations recorded yet.');
  lines.push(`Inspection status: ${inspectionStatusLabel[status.status].toLowerCase()}${status.inspection ? ` (${status.inspection.id}, ${memberName(d, status.inspection.assigneeId)})` : ''}.`);
  for (const q of issues) lines.push(`${qualityLabels[q.type]}: ${q.message}`);
  return {
    kind: 'answer',
    title: `${z.id} at a glance`,
    lines,
    sources: [z.id, ...(current ? [current.id] : []), ...(status.inspection ? [status.inspection.id] : [])],
    links: [{ label: `Open ${z.id}`, to: `/dashboard/zones/${z.id}` }],
  };
}

function needInspection(d: DashboardData): AssistantAnswer {
  const rows = d.zones.map((z) => ({ z, s: zoneInspectionStatus(d, z.id) })).filter((r) => r.s.status !== 'clear');
  return {
    kind: 'answer',
    title: rows.length ? `${rows.length} zone${rows.length === 1 ? '' : 's'} flagged or under inspection` : 'No zones are flagged',
    lines: rows.length ? rows.map((r) => `${r.z.id} (${r.z.crop}): ${inspectionStatusLabel[r.s.status].toLowerCase()}${r.s.inspection ? ` — ${r.s.inspection.reason}` : ''}`) : ['Every zone is clear. Add an observation to compare against the last one.'],
    sources: rows.map((r) => r.z.id),
    links: [{ label: 'Open the inspection queue', to: '/dashboard/inspections' }],
  };
}

function dataProblems(d: DashboardData): AssistantAnswer {
  const issues = allQualityIssues(d);
  return {
    kind: 'answer',
    title: issues.length ? `${issues.length} data issue${issues.length === 1 ? '' : 's'} across ${new Set(issues.map((i) => i.zoneId)).size} zone(s)` : 'No data problems found',
    lines: issues.length ? issues.slice(0, 12).map((i) => `${i.zoneId} — ${qualityLabels[i.type]}: ${i.message}`) : ['Every zone has current readings and recent observations.'],
    sources: [...new Set(issues.map((i) => i.zoneId))],
    links: [{ label: 'Open zones', to: '/dashboard/zones' }],
  };
}

function openInspections(d: DashboardData): AssistantAnswer {
  const open = d.inspections.filter((i) => i.state !== 'complete');
  return {
    kind: 'answer',
    title: `${open.length} inspection${open.length === 1 ? '' : 's'} open`,
    lines: open.length ? open.map((i) => `${i.id} in ${i.zoneId}: ${i.reason} ${i.priority} priority, ${memberName(d, i.assigneeId)}.`) : ['No inspections are open.'],
    sources: open.map((i) => i.id),
    links: [{ label: 'Open the inspection queue', to: '/dashboard/inspections' }],
  };
}

const HELP: AssistantAnswer = {
  kind: 'help',
  title: 'What I can answer',
  lines: ['Ask about a zone (for example “GN-A1”), which zones need inspection, which zones have data problems, or which inspections are open.', 'I answer from the records in this dashboard and list the ones I used.'],
  sources: [],
  links: [],
};

export function answer(question: string, d: DashboardData): AssistantAnswer {
  const q = question.trim();
  if (!q) return HELP;
  if (REFUSAL_RE.test(q)) return REFUSAL;
  const id = q.toUpperCase().match(/\b[A-Z]{2}-[A-Z]\d\b/)?.[0];
  if (id) {
    const z = d.zones.find((x) => x.id === id);
    return z ? zoneSummary(z, d) : { kind: 'answer', title: `No zone called ${id}`, lines: ['That ID is not in this dashboard.'], sources: [], links: [{ label: 'Open zones', to: '/dashboard/zones' }] };
  }
  if (/\b(data|missing|outdated|stale|overdue|quality|incomplete)/i.test(q)) return dataProblems(d);
  if (/\b(open inspection|inspections|assigned|queue)/i.test(q)) return openInspections(d);
  if (/\b(need|flag|attention|inspect|change)/i.test(q)) return needInspection(d);
  return HELP;
}
