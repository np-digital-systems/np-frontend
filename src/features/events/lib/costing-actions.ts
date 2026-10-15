'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import { api, ApiError } from '@/lib/api';

import { getEventAccess } from './event-access';
import { EVENT_ROUTES } from './routes';
import type { ActionResult } from './event-actions';
import type { CostingLineDraft, EventBudget, ExpectedAmounts } from '../types/costing';

// This check only decides what the screen offers; the API enforces the permission.
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
  /** Omitted, the costing covers every instance of the type. */
  slotId?: number | null;
  /** Omitted, it applies from today. */
  effectiveFrom?: string;
  notes?: string | null;
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

// Editing the in-force version writes to that scope's draft instead, so the
// returned id may differ from the one passed in.
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

// Applying closes the previous version and changes what sponsors are quoted.
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
  /** Number from the temple's physical voucher book. */
  manualVoucherNo: string;
}

// Reads below are server actions because client components call them and the API token stays on the server.
export async function loadEventBudget(eventId: number): Promise<EventBudget> {
  await requireSession();

  return api.get<EventBudget>(`/events/${eventId}/budget`);
}

export async function loadExpectedAmounts(eventId: number): Promise<ExpectedAmounts> {
  await requireSession();

  return api.get<ExpectedAmounts>(`/events/${eventId}/expected`);
}
