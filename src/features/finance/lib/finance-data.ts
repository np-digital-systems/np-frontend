import type {
  AssetCategory,
  AssetCondition,
  AssetStatus,
  DepositStatus,
  InterestPayout,
  ProjectStatus,
} from '../types';

export {
  formatCurrency,
  formatCompact,
  formatLongDate,
  formatShortDate,
  getToday,
  getActiveYear,
  daysBetween,
  yearsBetween,
  addMonthsIso,
} from '@/lib/format';

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

export function simpleInterest(
  principal: number,
  annualRate: number,
  years: number,
): number {
  return Math.max(principal * (annualRate / 100) * years, 0);
}

export function accumulatedDepreciation(
  cost: number,
  annualRate: number,
  ageYears: number,
): number {
  if (annualRate <= 0) return 0;

  return Math.min(cost * (annualRate / 100) * Math.max(ageYears, 0), cost);
}

export const MATURITY_ALERT_DAYS = 90;

export function share(part: number, whole: number): number {
  return whole === 0 ? 0 : part / whole;
}
