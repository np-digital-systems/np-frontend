'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/features/auth/lib/session';

import { getEventAccess } from './event-access';
import { EVENT_ROUTES } from './routes';
import { addSponsor, allSponsors, nextSponsorId } from './sponsor-store';

export interface CreateSponsorInput {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

export type CreateSponsorResult =
  | { ok: true; sponsorId: string }
  | { ok: false; message: string };

/**
 * Registers a devotee or trust so they can be assigned to instances.
 *
 * TODO: this writes to the in-memory store. When the users API exists it
 * should create the user record and return its id, unchanged in shape.
 */
export async function createSponsor(
  input: CreateSponsorInput,
): Promise<CreateSponsorResult> {
  const user = await getCurrentUser();
  const access = getEventAccess(user.role);

  // Checked here as well as in the screen: the action is the boundary a
  // typed request cannot get around.
  if (!access.canManageSponsors) {
    return { ok: false, message: 'You cannot register sponsors.' };
  }

  const fullName = input.fullName.trim();

  if (!fullName) {
    return { ok: false, message: 'A sponsor name is required.' };
  }

  const clash = allSponsors().some(
    (sponsor) => sponsor.fullName.toLowerCase() === fullName.toLowerCase(),
  );

  if (clash) {
    return { ok: false, message: `${fullName} is already registered.` };
  }

  const sponsorId = nextSponsorId();

  addSponsor({
    id: sponsorId,
    fullName,
    phone: input.phone.trim() || null,
    email: input.email.trim() || null,
    address: input.address.trim(),
  });

  revalidatePath(EVENT_ROUTES.sponsors);
  revalidatePath(EVENT_ROUTES.calendar);

  return { ok: true, sponsorId };
}
