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
 * Not a refusal — the temple asked for one act, save, and this is the sentence
 * that says what it means today. A costing nobody has quoted from is simply
 * corrected; one that has priced an occurrence is versioned instead.
 */
export function revisionNotice(costing: CostingRecord): string | null {
  if (costing.usedByEvents > 0) {
    const plural = costing.usedByEvents === 1 ? '' : 's';

    return (
      `${costing.usedByEvents} occurrence${plural} were quoted from this version. ` +
      'Saving a change keeps it as it stands and opens a new version from today, ' +
      'so those occurrences keep the figures they were quoted at.'
    );
  }

  return null;
}
