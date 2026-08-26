'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import { getEventAccess } from './event-access';
import { EVENT_ROUTES } from './routes';

export type SponsorResult = { ok: true } | { ok: false; message: string };

async function guarded(refused: string, write: () => Promise<unknown>): Promise<SponsorResult> {
  const { permissions } = await requireSession();

  if (!getEventAccess(permissions).canManageSponsors) {
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

export interface CreateSponsorInput {
  fullName: string;
  nameTa?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type CreateSponsorResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

/**
 * Register somebody who can sponsor a slot.
 *
 * A sponsor is a `users` row with no email and no password — the portal has one
 * directory of people, and a devotee who has never signed in is exactly that.
 */
export async function createSponsor(
  input: CreateSponsorInput,
): Promise<CreateSponsorResult> {
  const { permissions } = await requireSession();

  if (!getEventAccess(permissions).canManageSponsors) {
    return { ok: false, message: 'You cannot register sponsors.' };
  }

  const fullName = input.fullName.trim();

  if (fullName.length < 2) {
    return { ok: false, message: 'Enter the sponsor’s name.' };
  }

  try {
    const user = await api.post<{ id: string }>('/users', {
      nameTa: input.nameTa?.trim() || fullName,
      fullName,
      email: input.email?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      address: input.address?.trim() ?? '',
    });

    for (const route of Object.values(EVENT_ROUTES)) revalidatePath(route);

    return { ok: true, id: user.id };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }
}

export interface SponsorAssignmentInput {
  eventTypeId: number;
  instanceIdentifier: number;
  customInstanceName?: string;
  userId: string;
}

export async function assignSponsor(input: SponsorAssignmentInput): Promise<SponsorResult> {
  return guarded('You cannot assign sponsors.', () =>
    api.post('/sponsors', {
      ...input,
      customInstanceName: input.customInstanceName || undefined,
    }),
  );
}

export async function updateSponsorAssignment(
  id: number,
  input: { userId?: string; customInstanceName?: string },
): Promise<SponsorResult> {
  return guarded('You cannot change sponsor assignments.', () =>
    api.patch(`/sponsors/${id}`, {
      userId: input.userId || undefined,
      customInstanceName: input.customInstanceName || undefined,
    }),
  );
}

export async function removeSponsorAssignment(id: number): Promise<SponsorResult> {
  return guarded('You cannot remove sponsor assignments.', () => api.delete(`/sponsors/${id}`));
}
