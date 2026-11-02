import { describe, expect, it } from 'vitest';
import { createSampleData } from '../data/greenhouse';
import { EXAMPLE_QUESTIONS, answer } from '../dashboard/assistant';
import { MEMBER_ROLE, PERMISSIONS, can } from '../dashboard/access';

const d = createSampleData();

describe('grounded assistant', () => {
  it('answers every example question', () => {
    for (const q of EXAMPLE_QUESTIONS) expect(answer(q, d).lines.length).toBeGreaterThan(0);
  });
  it('refuses diagnosis, treatment and yield prediction', () => {
    for (const q of ['Does GN-A1 have root rot?', 'What should I spray on GN-B1?', 'Predict the yield for GN-C2', 'What dose of fungicide do I need?']) expect(answer(q, d).kind).toBe('refusal');
  });
  it('summarises a zone from its records', () => {
    const a = answer('What changed in GN-A1?', d);
    expect(a.kind).toBe('answer');
    expect(a.sources.join(' ')).toMatch(/GN-A1/);
  });
  it('falls back to help', () => {
    expect(answer('What is the weather?', d).kind).toBe('help');
  });
});

describe('demo roles', () => {
  it('gives the head grower everything', () => {
    for (const p of PERMISSIONS) expect(can('head', p)).toBe(true);
  });
  it('keeps settings and the audit log with the head grower', () => {
    for (const r of ['lead', 'grower', 'technician'] as const) {
      expect(can(r, 'settings')).toBe(false);
      expect(can(r, 'audit')).toBe(false);
    }
  });
  it('lets technicians observe but not assign or complete', () => {
    expect(can('technician', 'observe')).toBe(true);
    expect(can('technician', 'assign')).toBe(false);
    expect(can('technician', 'complete')).toBe(false);
  });
  it('maps every sample team member to a role', () => {
    for (const m of d.team) expect(MEMBER_ROLE[m.id]).toBeDefined();
  });
});
