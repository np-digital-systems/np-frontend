import type { EventDraft } from '../components/event-form-dialog';
import type { EventRecord, EventType, SponsorUser } from '../types';

import { describeInstance, deriveStatus } from './event-data';

/**
 * Turns what the form collected into the resolved record the tables render.
 *
 * The server normally does this join; when an admin creates or edits an
 * event the screen has to produce the same shape locally so the row appears
 * immediately instead of after a round trip.
 *
 * TODO: once the API exists this becomes an optimistic update, replaced by
 * whatever the POST/PATCH returns.
 */
export function materialiseEvent(
  draft: EventDraft,
  base: {
    id: number;
    createdAt: string;
    eventTypes: readonly EventType[];
    sponsors: readonly SponsorUser[];
    today: string;
  },
): EventRecord {
  const eventType = base.eventTypes.find(
    (type) => type.id === draft.eventTypeId,
  );

  if (!eventType) {
    throw new Error(`Unknown event type ${draft.eventTypeId}`);
  }

  const now = new Date().toISOString();

  const event = {
    id: base.id,
    eventTypeId: draft.eventTypeId,
    instanceIdentifier: draft.instanceIdentifier,
    customInstanceName: draft.customInstanceName.trim() || null,
    scheduledDate: draft.scheduledDate,
    startTime: draft.startTime,
    endTime: draft.endTime || null,
    sponsorId: draft.sponsorId,
    notes: draft.notes.trim() || null,
    isCompleted: draft.isCompleted,
    createdAt: base.createdAt,
    updatedAt: now,
  };

  return {
    ...event,
    eventType,
    sponsor:
      base.sponsors.find((sponsor) => sponsor.id === draft.sponsorId) ?? null,
    instanceLabel: describeInstance(
      eventType.frequencyType,
      draft.instanceIdentifier,
      event.customInstanceName,
    ),
    status: deriveStatus(event, base.today),
  };
}
