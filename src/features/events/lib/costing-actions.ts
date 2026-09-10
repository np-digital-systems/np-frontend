'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import { getEventAccess } from './event-access';
import { EVENT_ROUTES } from './routes';
import type { ActionResult } from './event-actions';
import type { CostingLineDraft, EventBudget } from '../types/costing';

/**
 * Every costing write goes through here.
 *
 * The permission is checked before the call and again by the API, which is not
 * duplication: this one decides what the screen may offer, and that one decides
 * what the books will accept. Only the second is a control.
 */
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

    revalidatePath(EVENT_ROUTES.costings, 'layout');

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiError
          ? error.message
          : 'The portal could not reach the server.',
    };
  }
}

const CANNOT_MANAGE = 'You cannot set pooja costings.';

export interface CostingInput {
  eventTypeId: number;
  /** Left out, the costing covers every instance of the type. */
  slotId?: number | null;
  /** Left out, it applies from today. */
  effectiveFrom?: string;
  notes?: string | null;
  /** A costing may be saved with none; they are written in the editor. */
  lines?: CostingLineDraft[];
}

export async function createCosting(input: CostingInput): Promise<ActionResult> {
  return guarded((access) => access.canManageCostings, CANNOT_MANAGE, () =>
    api.post('/event-costings', {
      ...input,
      slotId: input.slotId ?? undefined,
      notes: input.notes || undefined,
    }),
  );
}

/**
 * Save a costing.
 *
 * One nobody has quoted from is corrected in place. One that has already priced
 * an occurrence is kept as it stands and a new version opened from today, so
 * the family quoted last year goes on being owed what they were told.
 */
export async function updateCosting(
  id: number,
  input: { notes?: string | null; lines?: CostingLineDraft[] },
): Promise<ActionResult> {
  return guarded((access) => access.canManageCostings, CANNOT_MANAGE, () =>
    api.patch(`/event-costings/${id}`, { ...input, notes: input.notes || undefined }),
  );
}

/** Day two of a festival is day one with three figures changed. */
export async function copyCosting(
  id: number,
  input: { slotId?: number | null; effectiveFrom?: string },
): Promise<ActionResult> {
  return guarded((access) => access.canManageCostings, CANNOT_MANAGE, () =>
    api.post(`/event-costings/${id}/copy`, {
      slotId: input.slotId ?? undefined,
      effectiveFrom: input.effectiveFrom || undefined,
    }),
  );
}

export async function deleteCosting(id: number): Promise<ActionResult> {
  return guarded((access) => access.canManageCostings, CANNOT_MANAGE, () =>
    api.delete(`/event-costings/${id}`),
  );
}

/** Freeze the costing in force onto one occurrence. */
export async function costEvent(eventId: number): Promise<ActionResult> {
  return guarded((access) => access.canManageCostings, CANNOT_MANAGE, () =>
    api.post(`/events/${eventId}/budget`),
  );
}

export interface MovementInput {
  date?: string;
  mode: 'cash' | 'bank' | 'cheque' | 'online';
  bankAccountId?: number | null;
  chequeNo?: string | null;
  /** The number on the temple's physical voucher book. Never optional. */
  manualVoucherNo: string;
}

export async function raiseEventReceipt(
  eventId: number,
  input: MovementInput & { amount?: number },
): Promise<ActionResult> {
  return guarded((access) => access.canRaiseEventVouchers, 'You cannot raise receipts.', () =>
    api.post(`/events/${eventId}/vouchers/receipt`, {
      ...input,
      bankAccountId: input.bankAccountId ?? undefined,
      chequeNo: input.chequeNo || undefined,
    }),
  );
}

export async function raiseEventPayment(
  eventId: number,
  input: MovementInput & {
    lines: { budgetLineId: number; amount?: number }[];
    partyId?: number | null;
    party?: string;
  },
): Promise<ActionResult> {
  return guarded((access) => access.canRaiseEventVouchers, 'You cannot raise payments.', () =>
    api.post(`/events/${eventId}/vouchers/payment`, {
      ...input,
      bankAccountId: input.bankAccountId ?? undefined,
      chequeNo: input.chequeNo || undefined,
      partyId: input.partyId ?? undefined,
      party: input.party || undefined,
    }),
  );
}

/**
 * The budget for one occurrence, read from a client component.
 *
 * A server action rather than a service call, for the same reason the slots
 * are: the API token lives on the server.
 */
export async function loadEventBudget(eventId: number): Promise<EventBudget> {
  await requireSession();

  return api.get<EventBudget>(`/events/${eventId}/budget`);
}
