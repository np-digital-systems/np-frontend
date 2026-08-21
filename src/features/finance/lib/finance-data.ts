import type {
  AssetCategory,
  AssetCondition,
  AssetStatus,
  DepositStatus,
  InterestPayout,
  ProjectStatus,
} from '../types';

/** Money notation and dates are shared portal-wide — see `@/lib/format`. */
export {
  formatCurrency,
  formatCompact,
  formatLongDate,
  formatShortDate,
  getToday,
  getActiveYear,
} from '@/lib/format';

/* -------------------------------------------------------------------------
   Vocabulary
   ------------------------------------------------------------------------- */

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'planning',
  'active',
  'on-hold',
  'completed',
];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
};

export const DEPOSIT_STATUSES: readonly DepositStatus[] = [
  'active',
  'matured',
  'renewed',
  'closed',
];

export const DEPOSIT_STATUS_LABELS: Record<DepositStatus, string> = {
  active: 'Active',
  matured: 'Matured',
  renewed: 'Renewed',
  closed: 'Closed',
};

export const INTEREST_PAYOUTS: readonly InterestPayout[] = [
  'monthly',
  'quarterly',
  'on-maturity',
];

export const INTEREST_PAYOUT_LABELS: Record<InterestPayout, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  'on-maturity': 'On Maturity',
};

export const ASSET_CATEGORIES: readonly AssetCategory[] = [
  'land-building',
  'jewellery',
  'vahanam',
  'vessels',
  'furniture',
  'equipment',
  'vehicle',
];

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  'land-building': 'Land & Buildings',
  jewellery: 'Jewellery & Ornaments',
  vahanam: 'Vahanam & Ther',
  vessels: 'Vessels & Utensils',
  furniture: 'Furniture & Fittings',
  equipment: 'Equipment',
  vehicle: 'Vehicles',
};

export const ASSET_CONDITIONS: readonly AssetCondition[] = [
  'good',
  'fair',
  'needs-repair',
  'unusable',
];

export const ASSET_CONDITION_LABELS: Record<AssetCondition, string> = {
  good: 'Good',
  fair: 'Fair',
  'needs-repair': 'Needs Repair',
  unusable: 'Unusable',
};

export const ASSET_STATUSES: readonly AssetStatus[] = [
  'in-use',
  'in-storage',
  'under-repair',
  'disposed',
];

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  'in-use': 'In Use',
  'in-storage': 'In Storage',
  'under-repair': 'Under Repair',
  disposed: 'Disposed',
};

/* -------------------------------------------------------------------------
   Derivations

   Every one of these is a pure function of stored columns, so no screen ever
   has to trust a figure somebody remembered to update.
   ------------------------------------------------------------------------- */

const MS_PER_DAY = 86_400_000;

/** Whole days between two ISO dates, positive when `to` is later. */
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);

  return Math.round(
    (Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / MS_PER_DAY,
  );
}

export function yearsBetween(from: string, to: string): number {
  return daysBetween(from, to) / 365.25;
}

/** Simple interest, the basis a fixed deposit certificate quotes. */
export function simpleInterest(
  principal: number,
  annualRate: number,
  years: number,
): number {
  return Math.max(principal * (annualRate / 100) * years, 0);
}

/**
 * Straight-line depreciation, capped at cost.
 *
 * An asset never depreciates below zero, and a rate of zero means the temple
 * carries it at cost — which is how gold, silver and land are held.
 */
export function accumulatedDepreciation(
  cost: number,
  annualRate: number,
  ageYears: number,
): number {
  if (annualRate <= 0) return 0;

  return Math.min(cost * (annualRate / 100) * Math.max(ageYears, 0), cost);
}

/** A deposit inside this window wants attention before it lapses. */
export const MATURITY_ALERT_DAYS = 90;

/** Percentage, rounded, guarding the divide-by-zero. */
export function share(part: number, whole: number): number {
  return whole === 0 ? 0 : part / whole;
}
