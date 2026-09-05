import type { EventDraft } from '../components/event-form-dialog';
import type { EventRecord, EventType, SponsorParty } from '../types';

import { describeInstance, deriveStatus } from './event-data';

/**
 * TODO: once the API exists this becomes an optimistic update, replaced by
 * whatever the POST/PATCH returns.
 */
export function materialiseEvent(
  draft: EventDraft,
  base: {
    id: number;
    createdAt: string;
    eventTypes: readonly EventType[];
    sponsors: readonly SponsorParty[];
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
    scheduledDate: draft.scheduledDate,
    startTime: draft.startTime,
    endTime: draft.endTime || null,
    sponsorPartyId: draft.sponsorPartyId,
    notes: draft.notes.trim() || null,
    isCompleted: draft.isCompleted,
    // The slot's name is not the day's to set — it is read back from the API.
    customInstanceName: null as string | null,
    createdAt: base.createdAt,
    updatedAt: now,
  };

  return {
    ...event,
    eventType,
    sponsor:
      base.sponsors.find((sponsor) => sponsor.id === draft.sponsorPartyId) ?? null,
    instanceLabel: describeInstance(
      eventType.frequencyType,
      draft.instanceIdentifier,
      event.customInstanceName,
    ),
    status: deriveStatus(event, base.today),
  };
}
