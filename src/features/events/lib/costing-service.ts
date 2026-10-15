import 'server-only';

import { api } from '@/lib/api';

import type { EventRecord } from '../types';
import type { CostingRecord, CostingSummary, EventBudget } from '../types/costing';

// Pass-throughs: resolution, totals and budget comparison are computed by the API.

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

/** Newest first. */
export async function getCostingHistory(id: number): Promise<readonly CostingRecord[]> {
  return api.get<readonly CostingRecord[]>(`/event-costings/${id}/history`);
}

export async function getApplicableCosting(
  slotId: number,
  on: string,
): Promise<CostingSummary> {
  return api.get<CostingSummary>('/event-costings/resolve', { query: { slotId, on } });
}

export async function getEventBudget(eventId: number): Promise<EventBudget> {
  return api.get<EventBudget>(`/events/${eventId}/budget`);
}

export async function getEvent(eventId: number): Promise<EventRecord> {
  return api.get<EventRecord>(`/events/${eventId}`);
}
