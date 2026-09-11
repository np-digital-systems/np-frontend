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
