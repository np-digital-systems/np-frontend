import type { BadgeStatus } from '@/components/portal/ui';

import type { BudgetLineStatus, CostingLine, CostingRecord } from '../types/costing';

/**
 * A costing is either the one being quoted from or a version it replaced.
 *
 * There is no third state and nothing to switch: what is saved applies, and a
 * revision closes the old row rather than deactivating it. Calling a replaced
 * version "Cancelled" would say something untrue about it — it is still the
 * answer to what this pooja cost that year.
 */
export function costingBadge(costing: CostingRecord): BadgeStatus {
  return costing.isInForce ? 'In force' : 'Superseded';
}

export const BUDGET_LINE_BADGE: Record<BudgetLineStatus, BadgeStatus> = {
  'Not raised': 'Not raised',
  'In progress': 'In progress',
  Posted: 'Posted',
};

/** Which pooja, and which instance of it, a costing speaks for. */
export function describeScope(costing: CostingRecord): string {
  return costing.slotLabel
    ? `${costing.eventTypeName} — ${costing.slotLabel}`
    : costing.eventTypeName;
}

/** A replaced version is read-only: it is what a year's report is read from. */
export function isReadOnly(costing: CostingRecord): boolean {
  return !costing.isInForce;
}

export function describeScopeReach(costing: CostingRecord): string {
  return costing.slotId === null
    ? 'Every instance without one of its own'
    : 'This instance only';
}

/** The period a version covers, as it reads on a screen. */
export function describePeriod(costing: CostingRecord): string {
  return costing.effectiveTo
    ? `${costing.effectiveFrom} → ${costing.effectiveTo}`
    : `${costing.effectiveFrom} → open`;
}

/**
 * A heading's own name, or the account's.
 *
 * The label is an override, not a requirement: most headings are named well
 * enough by the head they post to, and making the temple retype "Melam" beside
 * `5310 Melam` would only give the two a way to disagree.
 */
export function lineTitle(line: CostingLine): string {
  return line.label ?? line.account.name;
}

/** A heading with items is a total that must equal them. */
export function itemsTotal(line: { items: readonly { amount: number }[] }): number {
  return line.items.reduce((total, item) => total + item.amount, 0);
}

/**
 * What saving a change to this costing will actually do.
 *
 * Not a refusal — the temple asked for one act, save, and this says what it
 * means today. A version written earlier is kept as the record of what the rate
 * was; one written today is simply corrected, because a morning of typing is
 * one act rather than fifteen versions of one.
 */
export function revisionNotice(costing: CostingRecord, today: string): string | null {
  if (costing.effectiveFrom >= today) {
    return 'Written today, so saving corrects it. Tomorrow, a change would keep this as an earlier version.';
  }

  return (
    `In force since ${costing.effectiveFrom}. Saving a change keeps these figures ` +
    'as an earlier version and applies the new ones from today, so any day already ' +
    'held at this rate still reads it.'
  );
}

/**
 * One scope's costing across time: the same pooja and instance, every version.
 *
 * A version is not a sibling of the plan it revises. Listing them side by side
 * made the screen grow every time a figure was corrected, and buried the seven
 * plans a festival actually has under the dozen rows they had passed through.
 */
export interface CostingPlan {
  readonly key: string;
  readonly eventTypeId: number;
  readonly eventTypeName: string;
  readonly slotId: number | null;
  /** The instance in the temple's words, or what covers the rest. */
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

/**
 * The flat list of versions, as poojas and the plans under them.
 *
 * Type-wide first within each pooja, then the instances in the order the temple
 * keeps its year — which is the order their slots were made, so the slot id
 * stands in for the day number without asking the API for it.
 */
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
    const newestFirst = [...versions].sort((a, b) =>
      b.effectiveFrom.localeCompare(a.effectiveFrom),
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

/** The plan covering every instance comes before the days that differ from it. */
function bySlot(a: CostingPlan, b: CostingPlan): number {
  if (a.slotId === null) return -1;
  if (b.slotId === null) return 1;

  return a.slotId - b.slotId;
}

/**
 * The version a plan was quoted at on a date, or null if none was.
 *
 * The same rule the API resolves an occurrence by, applied to a date the reader
 * chose: set it to a day in 2024 and every plan answers as the temple would
 * have answered then.
 */
export function versionOn(plan: CostingPlan, on: string): CostingRecord | null {
  return (
    plan.versions.find(
      (version) =>
        version.effectiveFrom <= on && (version.effectiveTo === null || version.effectiveTo >= on),
    ) ?? null
  );
}

/** Today, as the API writes a date. */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
