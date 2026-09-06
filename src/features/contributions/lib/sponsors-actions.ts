'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import { getContributionAccess } from './contributions-access';
import { CONTRIBUTION_ROUTES } from './routes';

export interface SponsorInput {
  nameTa: string;
  nameEn?: string;
  phone?: string;
  email?: string;
  address?: string;
  subscribes: boolean;
  notes?: string;
}

export type SponsorResult =
  | { ok: true; sponsorNo: string }
  | { ok: false; message: string };

interface SponsorResponse {
  readonly partyId: number;
  readonly sponsorNo: string;
}

const blank = (value: string | undefined) => (value?.trim() ? value.trim() : undefined);

async function guarded(
  run: () => Promise<SponsorResponse>,
): Promise<SponsorResult> {
  const { permissions } = await requireSession();

  if (!getContributionAccess(permissions).canManage) {
    return { ok: false, message: 'You cannot change the sponsor register.' };
  }

  try {
    const sponsor = await run();

    revalidatePath(CONTRIBUTION_ROUTES.sponsors);
    revalidatePath(CONTRIBUTION_ROUTES.sanththa);

    return { ok: true, sponsorNo: sponsor.sponsorNo };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }
}

/**
 * Enrol a sponsor.
 *
 * The number is not supplied: the database allocates the next `S-00n` in the
 * same statement, so two people enrolling at once cannot be handed the same
 * one. Enrolling also registers the party, so a new sponsor appears in the
 * directory from the moment they are added.
 */
export async function enrolSponsor(input: SponsorInput): Promise<SponsorResult> {
  return guarded(() =>
    api.post<SponsorResponse>('/sponsors', {
      nameTa: input.nameTa,
      nameEn: blank(input.nameEn),
      phone: blank(input.phone),
      email: blank(input.email),
      address: blank(input.address),
      subscribes: input.subscribes,
      notes: blank(input.notes),
    }),
  );
}

/** Names and contact details are written to the party behind the sponsor. */
export async function updateSponsor(
  partyId: number,
  input: Partial<SponsorInput> & { isActive?: boolean },
): Promise<SponsorResult> {
  return guarded(() =>
    api.patch<SponsorResponse>(`/sponsors/${partyId}`, {
      nameTa: input.nameTa,
      nameEn: blank(input.nameEn),
      phone: blank(input.phone),
      email: blank(input.email),
      address: blank(input.address),
      subscribes: input.subscribes,
      isActive: input.isActive,
      notes: blank(input.notes),
    }),
  );
}

export async function retireSponsor(partyId: number): Promise<SponsorResult> {
  return guarded(() => api.delete<SponsorResponse>(`/sponsors/${partyId}`));
}
