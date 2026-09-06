import 'server-only';

import { api } from '@/lib/api';

import type { Contributor, CollectionEvent } from '../types';

interface ApiContributor {
  readonly partyId: number;
  readonly name: string;
  readonly nameEn: string | null;
  readonly phone: string | null;
  readonly reason: Contributor['reason'];
  readonly lastAmount: number | null;
  readonly lastYear: number | null;
  readonly paidThisTime: boolean;
  readonly paidAmount: number | null;
}

interface ApiEvent {
  readonly id: number;
  readonly scheduledDate: string;
  readonly instanceLabel: string;
  readonly eventType: {
    readonly id: number;
    readonly name: string;
    readonly funding: string;
    readonly activityId: number | null;
  };
}

export async function getCollectionEvent(eventId: number): Promise<CollectionEvent> {
  const event = await api.get<ApiEvent>(`/events/${eventId}`);

  return {
    id: event.id,
    scheduledDate: event.scheduledDate,
    instanceLabel: event.instanceLabel,
    eventTypeName: event.eventType.name,
    isGeneral: event.eventType.funding === 'general',
    activityId: event.eventType.activityId,
  };
}

export async function getContributors(eventId: number): Promise<readonly Contributor[]> {
  const rows = await api.get<readonly ApiContributor[]>(`/events/${eventId}/contributors`);

  return rows.map((row) => ({
    partyId: row.partyId,
    name: row.name,
    nameEn: row.nameEn ?? '',
    phone: row.phone ?? '',
    reason: row.reason,
    lastAmount: row.lastAmount,
    lastYear: row.lastYear,
    paidThisTime: row.paidThisTime,
    paidAmount: row.paidAmount,
  }));
}
