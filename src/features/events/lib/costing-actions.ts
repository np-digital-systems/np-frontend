'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import { getEventAccess } from './event-access';
import { EVENT_ROUTES } from './routes';
import type { ActionResult } from './event-actions';
import type { CostingLineDraft, EventBudget, ExpectedAmounts } from '../types/costing';

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
 * Save a costing. It becomes a draft, and prices nothing until it is applied.
 *
 * Editing a draft rewrites it. Editing the version in force leaves that version
 * exactly as it is and writes the figures to that scope's draft instead, so the
 * family being quoted today goes on being quoted what they were told.
 *
 * Which is why this one returns an id. The row the temple typed into is not
 * always the row that was written, and a screen that assumed it was would show
 * the edit disappearing: the version in force is genuinely unchanged, and the
 * change is sitting on a draft the page is not looking at.
 */
export async function updateCosting(
  id: number,
  input: { notes?: string | null; lines?: CostingLineDraft[] },
): Promise<ActionResult & { costingId?: number }> {
  const { permissions } = await requireSession();

  if (!getEventAccess(permissions).canManageCostings) {
    return { ok: false, message: CANNOT_MANAGE };
  }

  try {
    const saved = await api.patch<{ id: number }>(`/event-costings/${id}`, {
      ...input,
      notes: input.notes || undefined,
    });

    for (const route of Object.values(EVENT_ROUTES)) revalidatePath(route);

    revalidatePath(EVENT_ROUTES.costings, 'layout');

    return { ok: true, costingId: saved.id };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }
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

/**
 * Put a draft into force. This is the act that changes what a sponsor is asked.
 *
 * Saving figures and deciding they now apply are separate on purpose: the first
 * is worth doing freely, and the second closes the version before it and is
 * what a year-by-year report reads as the day the rate changed.
 */
export async function applyCosting(id: number): Promise<ActionResult> {
  return guarded((access) => access.canManageCostings, CANNOT_MANAGE, () =>
    api.post(`/event-costings/${id}/apply`, {}),
  );
}

export async function deleteCosting(id: number): Promise<ActionResult> {
  return guarded((access) => access.canManageCostings, CANNOT_MANAGE, () =>
    api.delete(`/event-costings/${id}`),
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

/**
 * What one occurrence is expected to cost, read from a client component.
 *
 * The voucher form calls this the moment a pooja instance is chosen, so the
 * amount fills itself in without the cashier going to look it up. A server
 * action rather than a service call: the API token lives on the server.
 */
export async function loadExpectedAmounts(eventId: number): Promise<ExpectedAmounts> {
  await requireSession();

  return api.get<ExpectedAmounts>(`/events/${eventId}/expected`);
}

