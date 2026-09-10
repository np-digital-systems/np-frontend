import 'server-only';

import { api } from '@/lib/api';

import type { EventRecord } from '../types';
import type { CostingRecord, CostingSummary, EventBudget } from '../types/costing';

/**
 * Pooja costings, read from the API.
 *
 * Resolution, the totals and the budget-against-actual comparison are all done
 * on the server, where the rules live. These are pass-throughs: a second
 * implementation here would be a second set of answers to the same question.
 */

export interface CostingQuery {
  readonly eventTypeId?: number;
  readonly slotId?: number;
  readonly status?: string;
  /** Only versions in force on this date. */
  readonly on?: string;
}

export async function getCostings(
  query: CostingQuery = {},
): Promise<readonly CostingRecord[]> {
  return api.get<readonly CostingRecord[]>('/event-costings', { query: { ...query } });
}

export async function getCosting(id: number): Promise<CostingRecord> {
  return api.get<CostingRecord>(`/event-costings/${id}`);
}

/**
 * Every version this pooja and instance has had, newest first.
 *
 * The committee revises a rate about every three years, and the question at a
 * year end is what it was before. This is the answer the versions exist for.
 */
export async function getCostingHistory(id: number): Promise<readonly CostingRecord[]> {
  return api.get<readonly CostingRecord[]>(`/event-costings/${id}/history`);
}

/** What an instance would be quoted on a date, without costing anything. */
export async function getApplicableCosting(
  slotId: number,
  on: string,
): Promise<CostingSummary> {
  return api.get<CostingSummary>('/event-costings/resolve', { query: { slotId, on } });
}

export async function getEventBudget(eventId: number): Promise<EventBudget> {
  return api.get<EventBudget>(`/events/${eventId}/budget`);
}

/** The occurrence the budget belongs to, for the heading above it. */
export async function getEvent(eventId: number): Promise<EventRecord> {
  return api.get<EventRecord>(`/events/${eventId}`);
}
