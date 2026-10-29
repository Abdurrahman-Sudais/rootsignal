/**
 * Central pricing configuration.
 * Edit prices, limits and feature lists here — the Pricing page and the
 * homepage teaser both read from this file. Prices are illustrative.
 */

export type PlanId = 'grower' | 'farm' | 'enterprise';

export interface PlanLimits {
  /** Number of growing zones. `null` means unlimited / negotiated. */
  zones: number | null;
  /** Number of team seats. */
  seats: number | null;
  /** Number of sites (greenhouses / facilities). */
  sites: number | null;
  /** Root image storage, in GB. */
  imageStorageGb: number | null;
  /** Months of observation history retained. */
  historyMonths: number | null;
}

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly price in USD. `null` renders as "Custom". */
  monthlyPrice: number | null;
  /** Discount applied when billed annually (0–1). */
  annualDiscount: number;
  summary: string;
  limits: PlanLimits;
  features: string[];
  cta: { label: string; to: string };
  highlighted?: boolean;
}

export const currency = 'USD';
export const currencySymbol = '$';

export const plans: Plan[] = [
  {
    id: 'grower',
    name: 'Grower',
    monthlyPrice: 49,
    annualDiscount: 0.15,
    summary: 'For small operations monitoring a limited number of zones.',
    limits: { zones: 8, seats: 3, sites: 1, imageStorageGb: 25, historyMonths: 12 },
    features: [
      'Zone records with root image history',
      'Manual irrigation and environment readings',
      'Side-by-side observation comparison',
      'Data-quality indicators',
      'CSV export',
    ],
    cta: { label: 'Start with Grower', to: '/contact?plan=grower' },
  },
  {
    id: 'farm',
    name: 'Farm',
    monthlyPrice: 149,
    annualDiscount: 0.15,
    summary: 'For commercial growers managing multiple zones and inspection workflows.',
    limits: { zones: 40, seats: 15, sites: 2, imageStorageGb: 250, historyMonths: 36 },
    features: [
      'Everything in Grower',
      'Assisted change summaries for each observation',
      'Inspection queue, assignment and findings',
      'Team roles and zone ownership',
      'Scheduled reports',
      'Priority email support',
    ],
    cta: { label: 'Start with Farm', to: '/contact?plan=farm' },
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    annualDiscount: 0,
    summary: 'For multi-site growing operations.',
    limits: { zones: null, seats: null, sites: null, imageStorageGb: null, historyMonths: null },
    features: [
      'Everything in Farm',
      'Multi-site rollups and site comparisons',
      'Sensor and climate-computer integrations (scoped per project)',
      'SSO and audit history',
      'Data residency options',
      'Onboarding and grower training',
    ],
    cta: { label: 'Talk to us', to: '/contact?plan=enterprise' },
  },
];

export const limitLabels: Record<keyof PlanLimits, { label: string; unit?: string }> = {
  zones: { label: 'Growing zones' },
  seats: { label: 'Team seats' },
  sites: { label: 'Sites' },
  imageStorageGb: { label: 'Image storage', unit: 'GB' },
  historyMonths: { label: 'History retained', unit: 'months' },
};

export function formatLimit(value: number | null, unit?: string): string {
  if (value === null) return 'Custom';
  return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString();
}

export function formatPrice(plan: Plan, billing: 'monthly' | 'annual'): string {
  if (plan.monthlyPrice === null) return 'Custom';
  const price = billing === 'annual' ? plan.monthlyPrice * (1 - plan.annualDiscount) : plan.monthlyPrice;
  return `${currencySymbol}${Math.round(price)}`;
}
