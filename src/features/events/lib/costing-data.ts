import type { BadgeStatus } from '@/components/portal/ui';

import type { BudgetLineStatus, CostingLine, CostingRecord } from '../types/costing';

/**
 * Where a costing stands: written, quoted from, or replaced.
 *
 * A replaced version is not "Cancelled" — it is still the answer to what this
 * pooja cost that year, and the year-by-year report is read from it.
 */
export function costingBadge(costing: CostingRecord): BadgeStatus {
  if (costing.isDraft) return 'Draft';

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

/**
 * A replaced version is read-only: it is what a year's report is read from.
 *
 * A draft is not. It is the one row here that may be rewritten as often as the
 * committee likes, because nothing has been quoted from it.
 */
export function isReadOnly(costing: CostingRecord): boolean {
  return !costing.isInForce && !costing.isDraft;
}

export function describeScopeReach(costing: CostingRecord): string {
  return costing.slotId === null
    ? 'Every instance without one of its own'
    : 'This instance only';
}

/**
 * Sri Lanka keeps UTC+05:30 all year and observes no daylight saving, so the
 * temple's own day can be bounded by a constant rather than a timezone library.
 */
const TEMPLE_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** An instant as the temple reads a clock: its own date and time of day. */
function templeMoment(iso: string): string {
  const at = new Date(new Date(iso).getTime() + TEMPLE_OFFSET_MS);

  return `${at.toISOString().slice(0, 10)} ${at.toISOString().slice(11, 16)}`;
}

/**
 * What a version is called: Version 3, or Draft before it has become one.
 *
 * The number is what tells versions apart now. Three applied in one afternoon
 * differ by minutes, and a period is no longer something a reader can tell them
 * apart by at a glance.
 */
export function versionLabel(costing: CostingRecord): string {
  if (costing.versionNo === null) return 'Draft';

  return `Version ${costing.versionNo}`;
}

/**
 * The period a version covers, as it reads on a screen.
 *
 * Date and time both, because a version now begins at an instant: the committee
 * may revise three times in an afternoon, and the day alone would print the
 * three of them identically. A first version has no start — it priced the pooja
 * before anyone wrote it down, which is what lets a festival kept in August be
 * costed in September.
 */
export function describePeriod(costing: CostingRecord): string {
  const from = costing.effectiveFrom ? templeMoment(costing.effectiveFrom) : 'Always';
  const to = costing.effectiveTo ? templeMoment(costing.effectiveTo) : 'open';

  return `${from} → ${to}`;
}

/**
 * A heading's own name, or the account's.
 *
 * The label is an override, not a requirement: most headings are named well
 * enough by the head they post to, and making the temple retype "Melam" beside
 * `5310 Melam` would only give the two a way to disagree.
 *
 * The head's Tamil name, because that is the one the committee reads. The
 * romanisation is for the books and for anyone who cannot read the script, and
 * it belongs beside the code rather than as the name of the thing.
 */
export function lineTitle(line: CostingLine): string {
  return line.label ?? line.account.nameTa;
}

/** A heading with items is a total that must equal them. */
export function itemsTotal(line: { items: readonly { amount: number }[] }): number {
  return line.items.reduce((total, item) => total + item.amount, 0);
}

/**
 * What saving a change to this costing will actually do.
 *
 * Not a refusal — the temple asked for one act, save, and this says what it
 * means. Saving never changes what anything is quoted at: it writes a draft,
 * and applying that draft is the separate act that does.
 */
export function revisionNotice(costing: CostingRecord): string | null {
  if (costing.isDraft) {
    return (
      'A draft. Nothing is quoted at these figures yet — the costing it replaces ' +
      'stays in force until you apply this one.'
    );
  }

  if (!costing.isInForce) return null;

  const since =
    costing.effectiveFrom === null
      ? 'This is the first version, so it has priced every day of this pooja so far'
      : // Read as a clock, not as the instant the database stores. The raw ISO
        // string is not something the committee should ever be shown.
        `In force since ${templeMoment(costing.effectiveFrom)}`;

  return (
    `${since}. Saving does not change it: the new figures go to a draft, and ` +
    'this version goes on being quoted until that draft is applied.'
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
    // An open start is the earliest there is, so it sorts last among versions.
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

/** The plan covering every instance comes before the days that differ from it. */
function bySlot(a: CostingPlan, b: CostingPlan): number {
  if (a.slotId === null) return -1;
  if (b.slotId === null) return 1;

  return a.slotId - b.slotId;
}

/**
 * Whether a costing may be thrown away.
 *
 * Only what never priced anything: a draft, which was never applied, and an
 * empty one, which priced nothing even if it was. An applied costing with
 * figures on it is the answer to what this pooja cost while it was in force,
 * and the way to change that is to edit it and apply a new version.
 */
export function canDelete(costing: CostingRecord): boolean {
  return costing.isDraft || costing.lines.length === 0;
}

/** The draft waiting on this plan, if the committee has written one. */
export function draftOf(plan: CostingPlan): CostingRecord | null {
  return plan.versions.find((version) => version.isDraft) ?? null;
}

/** The versions that have actually been in force, newest first. */
export function appliedVersions(plan: CostingPlan): readonly CostingRecord[] {
  return plan.versions.filter((version) => !version.isDraft);
}

