import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import {
  ASSET_CATEGORY_LABELS,
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABELS,
  DEPOSIT_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
} from '../lib/finance-data';
import type {
  AssetCategory,
  AssetCondition,
  AssetStatus,
  DepositStatus,
  ProjectStatus,
} from '../types';

const chip = cva(
  'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-neutral-subtle text-text-secondary',
        info: 'bg-info-subtle text-info',
        success: 'bg-success-subtle text-success',
        warning: 'bg-warning-subtle text-warning',
        danger: 'bg-danger-subtle text-danger',
        accent: 'bg-primary-subtle text-primary',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

/* -------------------------------------------------------------------------
   Projects
   ------------------------------------------------------------------------- */

const PROJECT_TONE = {
  planning: 'info',
  active: 'success',
  'on-hold': 'warning',
  completed: 'neutral',
} as const;

export function ProjectStatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span className={cn(chip({ tone: PROJECT_TONE[status] }), className)}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}

/* -------------------------------------------------------------------------
   Fixed deposits
   ------------------------------------------------------------------------- */

const DEPOSIT_TONE = {
  active: 'success',
  matured: 'warning',
  renewed: 'info',
  closed: 'neutral',
} as const;

export function DepositStatusBadge({
  status,
  className,
}: {
  status: DepositStatus;
  className?: string;
}) {
  return (
    <span className={cn(chip({ tone: DEPOSIT_TONE[status] }), className)}>
      {DEPOSIT_STATUS_LABELS[status]}
    </span>
  );
}

/* -------------------------------------------------------------------------
   Assets
   ------------------------------------------------------------------------- */

export function AssetCategoryBadge({
  category,
  className,
}: {
  category: AssetCategory;
  className?: string;
}) {
  return (
    <span className={cn(chip({ tone: 'accent' }), className)}>
      {ASSET_CATEGORY_LABELS[category]}
    </span>
  );
}

/**
 * Condition is the field that decides whether something needs money spent on
 * it, so it earns a tone rather than sitting as plain text.
 */
const CONDITION_TONE = {
  good: 'success',
  fair: 'info',
  'needs-repair': 'warning',
  unusable: 'danger',
} as const;

export function AssetConditionBadge({
  condition,
  className,
}: {
  condition: AssetCondition;
  className?: string;
}) {
  return (
    <span className={cn(chip({ tone: CONDITION_TONE[condition] }), className)}>
      <span className="size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
      {ASSET_CONDITION_LABELS[condition]}
    </span>
  );
}

const ASSET_STATUS_TONE = {
  'in-use': 'success',
  'in-storage': 'info',
  'under-repair': 'warning',
  disposed: 'neutral',
} as const;

export function AssetStatusBadge({
  status,
  className,
}: {
  status: AssetStatus;
  className?: string;
}) {
  return (
    <span className={cn(chip({ tone: ASSET_STATUS_TONE[status] }), className)}>
      {ASSET_STATUS_LABELS[status]}
    </span>
  );
}
