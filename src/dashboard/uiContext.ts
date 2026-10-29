import { createContext, useContext } from 'react';

export interface DashboardUI {
  /** Open the "log observation" modal, optionally pre-selecting a zone. */
  openObservationForm: (zoneId?: string) => void;
  /** Open the inspection workflow for an existing inspection. */
  openInspection: (inspectionId: string) => void;
  /** Open (or create) the inspection for a flagged observation. */
  openForObservation: (observationId: string) => void;
}

export const DashboardUIContext = createContext<DashboardUI | null>(null);

export function useDashboardUI(): DashboardUI {
  const ctx = useContext(DashboardUIContext);
  if (!ctx) throw new Error('useDashboardUI must be used inside DashboardLayout');
  return ctx;
}
