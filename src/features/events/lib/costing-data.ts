import type { BadgeStatus } from '@/components/portal/ui';

import type { BudgetLineStatus, CostingLine, CostingRecord } from '../types/costing';

// A replaced version is "Superseded", not "Cancelled": the yearly report is still read from it.
export function costingBadge(costing: CostingRecord): BadgeStatus {
  if (costing.isDraft) return 'Draft';

  return costing.isInForce ? 'In force' : 'Superseded';
}

export const BUDGET_LINE_BADGE: Record<BudgetLineStatus, BadgeStatus> = {
  'Not raised': 'Not raised',
  'In progress': 'In progress',
  Posted: 'Posted',
};

export function describeScope(costing: CostingRecord): string {
  return costing.slotLabel
    ? `${costing.eventTypeName} — ${costing.slotLabel}`
    : costing.eventTypeName;
}

// Superseded versions are read-only because yearly reports are read from them; drafts stay editable.
export function isReadOnly(costing: CostingRecord): boolean {
  return !costing.isInForce && !costing.isDraft;
}

export function describeScopeReach(costing: CostingRecord): string {
  return costing.slotId === null
    ? 'Every instance without one of its own'
    : 'This instance only';
}

// Sri Lanka is UTC+05:30 all year with no daylight saving, so a constant offset is safe.
const TEMPLE_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function templeMoment(iso: string): string {
  const at = new Date(new Date(iso).getTime() + TEMPLE_OFFSET_MS);

  return `${at.toISOString().slice(0, 10)} ${at.toISOString().slice(11, 16)}`;
}

export function versionLabel(costing: CostingRecord): string {
  if (costing.versionNo === null) return 'Draft';

  return `Version ${costing.versionNo}`;
}

// Includes time of day because several versions can be applied on the same day.
// A first version has no start, so it also covers days before it was written.
export function describePeriod(costing: CostingRecord): string {
  const from = costing.effectiveFrom ? templeMoment(costing.effectiveFrom) : 'Always';
  const to = costing.effectiveTo ? templeMoment(costing.effectiveTo) : 'open';

  return `${from} → ${to}`;
}

// Defaults to the account's Tamil name, which is the one the committee reads.
export function lineTitle(line: CostingLine): string {
  return line.label ?? line.account.nameTa;
}

export function itemsTotal(line: { items: readonly { amount: number }[] }): number {
  return line.items.reduce((total, item) => total + item.amount, 0);
}

export function revisionNotice(costing: CostingRecord): string | null {
  if (costing.isDraft) {
    return 'Draft. The current version stays in force until you apply this one.';
  }

  if (!costing.isInForce) return null;

  const since =
    costing.effectiveFrom === null
      ? 'First version'
      : `In force since ${templeMoment(costing.effectiveFrom)}`;

  return `${since}. Saving creates a draft; this version stays in force until it is applied.`;
}

export interface CostingPlan {
  readonly key: string;
  readonly eventTypeId: number;
  readonly eventTypeName: string;
  readonly slotId: number | null;
  readonly scopeLabel: string;
  /** Newest first. */
  readonly versions: readonly CostingRecord[];
}

export interface PoojaGroup {
  readonly eventTypeId: number;
  readonly eventTypeName: string;
  readonly plans: readonly CostingPlan[];
}

const planKey = (costing: CostingRecord): string =>
  `${costing.eventTypeId}:${costing.slotId ?? 'all'}`;

export function groupCostings(costings: readonly CostingRecord[]): PoojaGroup[] {
  const plans = new Map<string, CostingRecord[]>();

  for (const costing of costings) {
    const key = planKey(costing);
    const existing = plans.get(key);

    if (existing) existing.push(costing);
    else plans.set(key, [costing]);
  }

  const groups = new Map<number, CostingPlan[]>();

  for (const [key, versions] of plans) {
    // A null start is the earliest, so it sorts last.
    const newestFirst = [...versions].sort((a, b) =>
      (b.effectiveFrom ?? '').localeCompare(a.effectiveFrom ?? ''),
    );
    const head = newestFirst[0];

    const plan: CostingPlan = {
      key,
      eventTypeId: head.eventTypeId,
      eventTypeName: head.eventTypeName,
      slotId: head.slotId,
      scopeLabel: head.slotLabel ?? 'Every instance',
      versions: newestFirst,
    };

    const forType = groups.get(head.eventTypeId);

    if (forType) forType.push(plan);
    else groups.set(head.eventTypeId, [plan]);
  }

  return [...groups.values()]
    .map((forType) => ({
      eventTypeId: forType[0].eventTypeId,
      eventTypeName: forType[0].eventTypeName,
      plans: [...forType].sort(bySlot),
    }))
    .sort((a, b) => a.eventTypeName.localeCompare(b.eventTypeName, 'ta'));
}

// Type-wide plan first, then instances in slot order (slots are created in calendar order).
function bySlot(a: CostingPlan, b: CostingPlan): number {
  if (a.slotId === null) return -1;
  if (b.slotId === null) return 1;

  return a.slotId - b.slotId;
}

// Only drafts and empty costings can be deleted; an applied costing is a record of what the pooja cost.
export function canDelete(costing: CostingRecord): boolean {
  return costing.isDraft || costing.lines.length === 0;
}

export function draftOf(plan: CostingPlan): CostingRecord | null {
  return plan.versions.find((version) => version.isDraft) ?? null;
}

export function appliedVersions(plan: CostingPlan): readonly CostingRecord[] {
  return plan.versions.filter((version) => !version.isDraft);
}
