import 'server-only';

import { api, getAll } from '@/lib/api';

import type {
  EventRecord,
  EventType,
  EventTypeRecord,
  ScheduleGroup,
  SponsorAssignment,
  SponsorParty,
} from '../types';

import { getActiveYear, getToday } from './event-data';

/**
 * The events domain, read from the API.
 *
 * The server composes the joins, the instance labels and the derived status,
 * so these are pass-throughs rather than a second implementation of rules the
 * API already applies.
 */

interface ApiEventTypeRecord extends EventType {
  readonly sponsorSlots: number;
  readonly scheduledCount: number;
}

export async function getEventTypeRecords(
  year: number = getActiveYear(getToday()),
): Promise<readonly EventTypeRecord[]> {
  return api.get<readonly ApiEventTypeRecord[]>('/event-types', { query: { year } });
}

export async function getEventTypes(): Promise<readonly EventType[]> {
  return getEventTypeRecords();
}

export async function getSponsorUsers(): Promise<readonly SponsorParty[]> {
  return getAll<SponsorParty>('/sponsors/directory');
}

export async function getEvents(
  year: number = getActiveYear(getToday()),
): Promise<readonly EventRecord[]> {
  return api.get<readonly EventRecord[]>('/events', { query: { year } });
}

export async function getSponsorAssignments(
  year: number = getActiveYear(getToday()),
): Promise<readonly SponsorAssignment[]> {
  return api.get<readonly SponsorAssignment[]>('/sponsors', { query: { year } });
}

export async function getScheduleGroups(
  year: number = getActiveYear(getToday()),
): Promise<readonly ScheduleGroup[]> {
  return api.get<readonly ScheduleGroup[]>('/events/schedule', { query: { year } });
}

export interface EventsSummaryResponse {
  readonly total: number;
  readonly upcoming: number;
  readonly completed: number;
  readonly unsponsored: number;
}

export async function getEventsSummary(
  year: number = getActiveYear(getToday()),
): Promise<EventsSummaryResponse> {
  return api.get<EventsSummaryResponse>('/events/summary', { query: { year } });
}


