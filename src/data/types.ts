export type Priority = 'high' | 'medium' | 'low';
export type PhotoQuality = 'good' | 'poor';
export type InspectionState = 'open' | 'in_progress' | 'complete';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  canInspect: boolean;
}

export interface Zone {
  id: string;
  name: string;
  crop: string;
  cultivar: string;
  system: string;
  bay: string;
  areaM2: number;
  plantCount: number;
  assignedGrowerId: string;
  priority: Priority;
  seed: number;
  medium: 'water' | 'substrate';
}

export interface RootImage {
  seed: number;
  density: number;
  browning: number;
  quality: PhotoQuality;
}

export interface Observation {
  id: string;
  zoneId: string;
  date: string;
  capturedById?: string;
  method?: string;
  notes?: string;
  image: RootImage;
  /** Object URL for an image uploaded in this browser session. */
  uploadedImageUrl?: string;
}

export interface IrrigationReading {
  id: string;
  zoneId: string;
  date: string;
  /** pH (dimensionless). */
  ph?: number;
  /** Electrical conductivity, mS/cm. */
  ecMsCm?: number;
  /** Nutrient solution / feed water temperature, °C. */
  waterTempC?: number;
  /** Irrigation volume delivered to the zone, L/day. */
  volumeLPerDay?: number;
  /** Dissolved oxygen, mg/L. */
  dissolvedOxygenMgL?: number;
  source: 'Manual entry' | 'CSV import';
}

export interface GrowerNote {
  id: string;
  zoneId: string;
  date: string;
  authorId: string;
  text: string;
}

export interface InspectionNote {
  id: string;
  date: string;
  authorId?: string;
  text: string;
}

export const findingCategories = [
  'No visible concern confirmed on inspection',
  'Root appearance change confirmed — further evidence needed',
  'Irrigation or equipment issue identified',
  'Sample sent for laboratory analysis',
  'Re-capture required (image or reading)',
  'Other',
] as const;
export type FindingCategory = (typeof findingCategories)[number];

export interface Inspection {
  id: string;
  zoneId: string;
  observationId: string;
  createdAt: string;
  reason: string;
  priority: Priority;
  state: InspectionState;
  assigneeId?: string;
  notes: InspectionNote[];
  finding?: { category: FindingCategory; detail: string };
  completedAt?: string;
}

export interface DashboardSettings {
  organisation: string;
  site: string;
  /** Readings older than this many days are flagged as outdated. */
  freshnessDays: number;
  /** Observations older than this many days are flagged as overdue. */
  observationIntervalDays: number;
}

export interface DashboardData {
  zones: Zone[];
  observations: Observation[];
  readings: IrrigationReading[];
  notes: GrowerNote[];
  inspections: Inspection[];
  team: TeamMember[];
  settings: DashboardSettings;
}
