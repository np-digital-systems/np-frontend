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

/**
 * Register a sponsor against an event type, creating the party first.
 *
 * A sponsor is a party — somebody the temple has dealings with — and not an
 * account. Most of them will never sign in, and the ones who eventually do get
 * a sign-in attached to the party they already are. Creating a login here, as
 * this once did, put every walk-in sponsor in the user directory and left the
 * electricity board with nowhere to sit at all.
 *
 * The two writes are separate calls, so a rejected registration can leave the
 * party on record. The message says so rather than pretending nothing
 * happened, since the fix is to register them from the table, not to retype
 * their details.
 */
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
    await api.post('/sponsors', {
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

/** Register somebody already in the directory. */
export async function addSponsor(input: SponsorPlacementInput): Promise<SponsorResult> {
  return guarded('You cannot register sponsors.', () =>
    api.post('/sponsors', {
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
    api.patch(`/sponsors/${id}`, {
      eventTypeId: input.eventTypeId,
      // Null is meaningful here — it widens the sponsor back out to the whole
      // event type — so it is sent rather than stripped like a blank string.
      instanceIdentifier:
        input.instanceIdentifier === undefined ? undefined : input.instanceIdentifier,
      partyId: input.partyId || undefined,
      // A blank name is sent as-is so a custom label can be cleared, which
      // `|| undefined` would silently turn into "leave it alone".
    }),
  );
}

export async function removeSponsor(id: number): Promise<SponsorResult> {
  return guarded('You cannot remove sponsor registrations.', () => api.delete(`/sponsors/${id}`));
}
