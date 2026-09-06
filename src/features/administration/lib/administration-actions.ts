'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/features/auth/lib/session';
import type { Permission } from '@/features/auth/types/permission';
import type { UserRole } from '@/features/auth/types/user-role';
import { api, ApiError } from '@/lib/api';

import { getAdministrationAccess } from './administration-access';
import { ADMIN_ROUTES } from './routes';

export type ActionResult = { ok: true } | { ok: false; message: string };

async function guarded(
  capability: (access: ReturnType<typeof getAdministrationAccess>) => boolean,
  refused: string,
  write: () => Promise<unknown>,
): Promise<ActionResult> {
  const { permissions } = await requireSession();

  if (!capability(getAdministrationAccess(permissions))) {
    return { ok: false, message: refused };
  }

  try {
    await write();

    for (const route of Object.values(ADMIN_ROUTES)) revalidatePath(route);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }
}

/* -------------------------------------------------------------------------
   Staff accounts

   An account is credentials granted to a party. Names and contact details are
   the party's and are edited in the directory, not here.
   ------------------------------------------------------------------------- */

export interface UserInput {
  /** An existing party to grant the sign-in to. Omit to register a new person. */
  partyId?: number;
  nameTa?: string;
  nameEn?: string;
  email: string;
  password?: string;
  role: UserRole;
}

export async function createUser(input: UserInput): Promise<ActionResult> {
  return guarded((a) => a.canManageUsers, 'You cannot manage accounts.', () =>
    api.post('/user-accounts', {
      partyId: input.partyId,
      nameTa: input.partyId ? undefined : input.nameTa,
      nameEn: input.partyId ? undefined : input.nameEn || undefined,
      email: input.email,
      password: input.password,
      role: input.role,
    }),
  );
}

export async function updateUser(id: string, input: { email: string }): Promise<ActionResult> {
  return guarded((a) => a.canManageUsers, 'You cannot manage accounts.', () =>
    api.patch(`/user-accounts/${id}`, { email: input.email }),
  );
}

/** Changing a role revokes the user's sessions, so it takes effect at once. */
export async function changeUserRole(id: string, role: UserRole): Promise<ActionResult> {
  return guarded((a) => a.canManageUsers, 'You cannot change roles.', () =>
    api.patch(`/user-accounts/${id}/role`, { role }),
  );
}

export async function resetUserPassword(id: string, password: string): Promise<ActionResult> {
  return guarded((a) => a.canManageUsers, 'You cannot reset passwords.', () =>
    api.post(`/user-accounts/${id}/reset-password`, { password }),
  );
}

/** Revoke every session a user holds, without disabling the account. */
export async function signOutUser(id: string): Promise<ActionResult> {
  return guarded((a) => a.canManageUsers, 'You cannot sign other people out.', () =>
    api.post(`/user-accounts/${id}/sign-out`),
  );
}

export async function setUserActive(id: string, isActive: boolean): Promise<ActionResult> {
  return guarded((a) => a.canManageUsers, 'You cannot manage users.', () =>
    isActive ? api.post(`/user-accounts/${id}/activate`) : api.delete(`/user-accounts/${id}`),
  );
}

/* -------------------------------------------------------------------------
   Roles
   ------------------------------------------------------------------------- */

/**
 * Replace what a role may do.
 *
 * The API refuses to leave the administrator role without the permissions that
 * administer the portal, so this cannot lock everybody out.
 */
export async function setRolePermissions(
  role: UserRole,
  permissions: readonly Permission[],
): Promise<ActionResult> {
  return guarded((a) => a.canManageRoles, 'You cannot change roles.', () =>
    api.put(`/roles/${role}/permissions`, { permissions }),
  );
}

/* -------------------------------------------------------------------------
   Financial years
   ------------------------------------------------------------------------- */

export interface FinancialYearInput {
  label: string;
  startsOn: string;
  endsOn: string;
  openingBalance?: number;
}

export async function createFinancialYear(input: FinancialYearInput): Promise<ActionResult> {
  return guarded((a) => a.canManageFinancialYears, 'You cannot manage financial years.', () =>
    api.post('/financial-years', input),
  );
}

export async function openFinancialYear(id: number): Promise<ActionResult> {
  return guarded((a) => a.canManageFinancialYears, 'You cannot open a financial year.', () =>
    api.post(`/financial-years/${id}/open`),
  );
}

/** Closing freezes the year's totals into the row and refuses later postings. */
export async function closeFinancialYear(id: number): Promise<ActionResult> {
  return guarded((a) => a.canManageFinancialYears, 'You cannot close a financial year.', () =>
    api.post(`/financial-years/${id}/close`),
  );
}

/* -------------------------------------------------------------------------
   Settings and sessions
   ------------------------------------------------------------------------- */

export async function updateTempleSettings(
  input: Record<string, unknown>,
): Promise<ActionResult> {
  return guarded((a) => a.canManageSettings, 'You cannot change settings.', () =>
    api.patch('/settings/temple', input),
  );
}

export async function updateAccountingSettings(
  input: Record<string, unknown>,
): Promise<ActionResult> {
  return guarded((a) => a.canManageSettings, 'You cannot change settings.', () =>
    api.patch('/settings/accounting', input),
  );
}

/** Your own sessions — no capability gates signing yourself out elsewhere. */
export async function revokeSession(id: string): Promise<ActionResult> {
  await requireSession();

  try {
    await api.delete(`/auth/sessions/${id}`);

    revalidatePath(ADMIN_ROUTES.sessions);

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }
}

export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult> {
  await requireSession();

  try {
    await api.post('/auth/change-password', { currentPassword, newPassword });

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof ApiError ? error.message : 'The portal could not reach the server.',
    };
  }
}
