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
  fullName: string;
  nameTa?: string;
  email?: string;
  phone?: string;
  address?: string;
  eventTypeId: number;
  instanceIdentifier: number | null;
  customInstanceName?: string;
}

export type RegisterSponsorResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

/**
 * Register a sponsor against an event type.
 *
 * A sponsor is a `users` row with no email and no password — the portal keeps
 * one directory of people, and a devotee who has never signed in is exactly
 * that — plus the registration that ties them to the event type they give to.
 * The instance is optional; leaving it out registers them for every instance.
 *
 * The two writes are separate calls, so a rejected registration can leave the
 * person in the directory. The message says so rather than pretending nothing
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

  const fullName = input.fullName.trim();

  if (fullName.length < 2) {
    return { ok: false, message: 'Enter the sponsor’s name.' };
  }

  let userId: string;

  try {
    const user = await api.post<{ id: string }>('/users', {
      nameTa: input.nameTa?.trim() || fullName,
      fullName,
      email: input.email?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      address: input.address?.trim() ?? '',
    });

    userId = user.id;
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }

  try {
    await api.post('/sponsors', {
      eventTypeId: input.eventTypeId,
      instanceIdentifier: input.instanceIdentifier ?? undefined,
      customInstanceName: input.customInstanceName || undefined,
      userId,
    });
  } catch (error) {
    revalidate();

    return {
      ok: false,
      message: `${fullName} was added to the directory, but not registered as a sponsor: ${messageFor(error)}`,
    };
  }

  revalidate();

  return { ok: true, id: userId };
}

export interface SponsorPlacementInput {
  eventTypeId: number;
  instanceIdentifier: number | null;
  customInstanceName?: string;
  userId: string;
}

/** Register somebody already in the directory. */
export async function addSponsor(input: SponsorPlacementInput): Promise<SponsorResult> {
  return guarded('You cannot register sponsors.', () =>
    api.post('/sponsors', {
      ...input,
      instanceIdentifier: input.instanceIdentifier ?? undefined,
      customInstanceName: input.customInstanceName || undefined,
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
      userId: input.userId || undefined,
      // A blank name is sent as-is so a custom label can be cleared, which
      // `|| undefined` would silently turn into "leave it alone".
      customInstanceName: input.customInstanceName ?? undefined,
    }),
  );
}

export async function removeSponsor(id: number): Promise<SponsorResult> {
  return guarded('You cannot remove sponsor registrations.', () => api.delete(`/sponsors/${id}`));
}
