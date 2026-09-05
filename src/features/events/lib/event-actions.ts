'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';

import type { EventSlot } from '../types';
import { api, ApiError } from '@/lib/api';

import { getEventAccess } from './event-access';
import { EVENT_ROUTES } from './routes';

export type ActionResult = { ok: true } | { ok: false; message: string };

async function guarded(
  capability: (access: ReturnType<typeof getEventAccess>) => boolean,
  refused: string,
  write: () => Promise<unknown>,
): Promise<ActionResult> {
  const { permissions } = await requireSession();

  if (!capability(getEventAccess(permissions))) {
    return { ok: false, message: refused };
  }

  try {
    await write();

    for (const route of Object.values(EVENT_ROUTES)) revalidatePath(route);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }
}

export interface EventTypeInput {
  nameTa: string;
  nameEn?: string;
  frequencyType: 'weekly' | 'monthly_twice' | 'monthly_once' | 'annual' | 'multi_day';
  noOfInstances: number;
  /** The coding receipts for this pooja take. Null clears the suggestion. */
  activityId?: number | null;
}

export async function createEventType(input: EventTypeInput): Promise<ActionResult> {
  return guarded((a) => a.canManageTypes, 'You cannot maintain event types.', () =>
    api.post('/event-types', { ...input, nameEn: input.nameEn || undefined }),
  );
}

export async function updateEventType(
  id: number,
  input: Partial<EventTypeInput>,
): Promise<ActionResult> {
  return guarded((a) => a.canManageTypes, 'You cannot maintain event types.', () =>
    api.patch(`/event-types/${id}`, { ...input, nameEn: input.nameEn || undefined }),
  );
}

export async function deleteEventType(id: number): Promise<ActionResult> {
  return guarded((a) => a.canManageTypes, 'You cannot maintain event types.', () =>
    api.delete(`/event-types/${id}`),
  );
}

export interface EventInput {
  eventTypeId: number;
  instanceIdentifier: number;
  scheduledDate: string;
  startTime: string;
  endTime?: string | null;
  sponsorPartyId?: number | null;
  notes?: string | null;
}

/** Leaving the sponsor out inherits the slot's sponsor, when it has just one. */
export async function createEvent(input: EventInput): Promise<ActionResult> {
  return guarded((a) => a.canCreate, 'You cannot add events to the calendar.', () =>
    api.post('/events', {
      ...input,
      endTime: input.endTime || undefined,
      sponsorPartyId: input.sponsorPartyId || undefined,
      notes: input.notes || undefined,
    }),
  );
}

export async function updateEvent(
  id: number,
  input: Partial<Omit<EventInput, 'eventTypeId' | 'instanceIdentifier'>>,
): Promise<ActionResult> {
  return guarded((a) => a.canUpdate, 'You cannot change calendared events.', () =>
    api.patch(`/events/${id}`, {
      ...input,
      endTime: input.endTime || undefined,
      sponsorPartyId: input.sponsorPartyId || undefined,
      notes: input.notes || undefined,
    }),
  );
}

export async function completeEvent(id: number): Promise<ActionResult> {
  return guarded((a) => a.canComplete, 'You cannot mark events complete.', () =>
    api.post(`/events/${id}/complete`),
  );
}

export async function reopenEvent(id: number): Promise<ActionResult> {
  return guarded((a) => a.canComplete, 'You cannot reopen events.', () =>
    api.post(`/events/${id}/reopen`),
  );
}

export async function deleteEvent(id: number): Promise<ActionResult> {
  return guarded((a) => a.canDelete, 'You cannot remove events from the calendar.', () =>
    api.delete(`/events/${id}`),
  );
}

/** Name a slot, or retire one. The one place a slot's name is set. */
export async function updateEventSlot(
  slotId: number,
  input: { customInstanceName?: string | null; isActive?: boolean },
): Promise<ActionResult> {
  return guarded(
    (access) => access.canManageTypes,
    'You cannot change pooja types.',
    () => api.patch(`/event-types/slots/${slotId}`, input),
  );
}

/**
 * A type's slots, for the dialog that names them.
 *
 * A server action rather than a service call: the list is read from a client
 * component, and the API token lives on the server.
 */
export async function loadEventSlots(eventTypeId: number): Promise<readonly EventSlot[]> {
  await requireSession();

  return api.get<readonly EventSlot[]>(`/event-types/${eventTypeId}/slots`);
}
