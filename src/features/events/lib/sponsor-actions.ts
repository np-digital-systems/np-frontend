'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import { getEventAccess } from './event-access';
import { EVENT_ROUTES } from './routes';

export type SponsorResult = { ok: true } | { ok: false; message: string };

function messageFor(error: unknown): string {
  return error instanceof ApiError ? error.message : 'The portal could not reach the server.';
}

function revalidate(): void {
  for (const route of Object.values(EVENT_ROUTES)) revalidatePath(route);
}

async function guarded(refused: string, write: () => Promise<unknown>): Promise<SponsorResult> {
  const { permissions } = await requireSession();

  if (!getEventAccess(permissions).canManageSponsors) {
    return { ok: false, message: refused };
  }

  try {
    await write();
    revalidate();

    return { ok: true };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

export interface RegisterSponsorInput {
  nameTa: string;
  nameEn?: string;
  phone?: string;
  eventTypeId: number;
  instanceIdentifier: number | null;
}

export type RegisterSponsorResult =
  | { ok: true; id: number }
  | { ok: false; message: string };

// Creates a party (not a user account), then the sponsorship. These are two calls,
// so a failed second call leaves the party on record and the message says so.
export async function registerSponsor(
  input: RegisterSponsorInput,
): Promise<RegisterSponsorResult> {
  const { permissions } = await requireSession();

  if (!getEventAccess(permissions).canManageSponsors) {
    return { ok: false, message: 'You cannot register sponsors.' };
  }

  const nameTa = input.nameTa.trim();

  if (nameTa.length < 2) {
    return { ok: false, message: 'Enter the sponsor’s name.' };
  }

  let partyId: number;

  try {
    const party = await api.post<{ id: number }>('/parties', {
      nameTa,
      nameEn: input.nameEn?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      roles: ['sponsor'],
    });

    partyId = party.id;
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }

  try {
    await api.post('/event-sponsors', {
      eventTypeId: input.eventTypeId,
      instanceIdentifier: input.instanceIdentifier ?? undefined,
      partyId,
    });
  } catch (error) {
    revalidate();

    return {
      ok: false,
      message: `${nameTa} was added to the parties list, but not registered as a sponsor: ${messageFor(error)}`,
    };
  }

  revalidate();

  return { ok: true, id: partyId };
}

export interface SponsorPlacementInput {
  eventTypeId: number;
  instanceIdentifier: number | null;
  partyId: number;
}

export async function addSponsor(input: SponsorPlacementInput): Promise<SponsorResult> {
  return guarded('You cannot register sponsors.', () =>
    api.post('/event-sponsors', {
      ...input,
      instanceIdentifier: input.instanceIdentifier ?? undefined,
    }),
  );
}

export async function updateSponsor(
  id: number,
  input: Partial<SponsorPlacementInput>,
): Promise<SponsorResult> {
  return guarded('You cannot change sponsor registrations.', () =>
    api.patch(`/event-sponsors/${id}`, {
      eventTypeId: input.eventTypeId,
      // Null is sent (not stripped): it unassigns the sponsor from their slot.
      instanceIdentifier:
        input.instanceIdentifier === undefined ? undefined : input.instanceIdentifier,
      partyId: input.partyId || undefined,
    }),
  );
}

export async function removeSponsor(id: number): Promise<SponsorResult> {
  return guarded('You cannot remove sponsor registrations.', () => api.delete(`/event-sponsors/${id}`));
}
