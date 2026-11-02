import { team } from '../data/greenhouse';

/** Demo roles. In production these are identity-provider groups, checked again on the server. */
export type DemoRole = 'head' | 'lead' | 'grower' | 'technician';
export type Permission = 'observe' | 'note' | 'create' | 'assign' | 'inspect' | 'complete' | 'priority' | 'settings' | 'audit';

export const ROLE_LABEL: Record<DemoRole, string> = {
  head: 'Head grower',
  lead: 'Inspections lead',
  grower: 'Grower / scientist',
  technician: 'Irrigation technician',
};

export const PERMISSION_LABEL: Record<Permission, string> = {
  observe: 'Add observations and readings',
  note: 'Add zone notes',
  create: 'Open inspections',
  assign: 'Assign inspections',
  inspect: 'Record inspection notes and findings',
  complete: 'Complete inspections and set outcome priority',
  priority: 'Change zone priority',
  settings: 'Change site settings',
  audit: 'Read and export the audit log',
};

export const PERMISSIONS = Object.keys(PERMISSION_LABEL) as Permission[];

const MATRIX: Record<DemoRole, Permission[]> = {
  head: PERMISSIONS,
  lead: ['observe', 'note', 'create', 'assign', 'inspect', 'complete', 'priority'],
  grower: ['observe', 'note', 'create', 'inspect'],
  technician: ['observe', 'note'],
};

export const MEMBER_ROLE: Record<string, DemoRole> = {
  amara: 'head',
  lena: 'lead',
  tomas: 'grower',
  priya: 'grower',
  mei: 'grower',
  jonah: 'technician',
};

export const roleOf = (id: string): DemoRole => MEMBER_ROLE[id] ?? 'technician';
export const can = (role: DemoRole, p: Permission) => MATRIX[role].includes(p);
export const memberName = (id: string) => team.find((t) => t.id === id)?.name ?? id;

export interface AuditEntry {
  id: string;
  at: string;
  userId: string;
  action: Permission;
  detail: string;
}
