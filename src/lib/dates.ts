/** The sample dataset is anchored to this date so the demo is stable. */
export const DEMO_TODAY = '2026-10-24';

const DAY = 86_400_000;

function parse(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`);
}

export function addDays(iso: string, days: number): string {
  return new Date(parse(iso).getTime() + days * DAY).toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((parse(toIso).getTime() - parse(fromIso).getTime()) / DAY);
}

export function daysAgo(iso: string): number {
  return daysBetween(iso, DEMO_TODAY);
}

const fmtLong = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const fmtShort = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export function formatDate(iso: string): string {
  return fmtLong.format(parse(iso));
}

export function formatShort(iso: string): string {
  return fmtShort.format(parse(iso));
}

export function relativeDays(iso: string): string {
  const d = daysAgo(iso);
  if (d <= 0) return 'Today';
  if (d === 1) return 'Yesterday';
  return `${d} days ago`;
}
