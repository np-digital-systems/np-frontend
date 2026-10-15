import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';

import { api, ApiError } from '@/lib/api';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
  cookieOptions,
} from '@/lib/api/tokens';

import type { Permission } from '../types/permission';
import { USER_ROLES, type UserRole } from '../types/user-role';
import type { PortalUser } from '../types/user';

interface MeResponse {
  readonly id: string;
  readonly nameTa: string;
  readonly nameEn: string | null;
  readonly email: string;
  readonly role: UserRole;
  readonly permissions: readonly string[];
}

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
}

export interface PortalSession {
  readonly user: PortalUser;
  readonly permissions: readonly Permission[];
}

function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return '?';

  const letters = parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts.at(-1)![0]}`;

  return letters.toUpperCase();
}

// Cached per request so layouts and pages share one API call.
export const getSession = cache(async (): Promise<PortalSession | null> => {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) return null;

  try {
    const me = await api.get<MeResponse>('/auth/me');
    const name = me.nameEn ?? me.nameTa;

    return {
      user: {
        id: me.id,
        name,
        email: me.email,
        role: isUserRole(me.role) ? me.role : 'member',
        initials: initialsOf(name),
      },
      permissions: me.permissions as readonly Permission[],
    };
  } catch (error) {
    // Treat an expired or revoked token as signed out; the proxy has already tried to refresh.
    if (error instanceof ApiError && error.isUnauthenticated) return null;

    throw error;
  }
});

/** Throws when there is no session. */
export async function requireSession(): Promise<PortalSession> {
  const session = await getSession();

  if (!session) {
    throw new Error('This route requires a session; the proxy should have redirected.');
  }

  return session;
}

export async function getCurrentUser(): Promise<PortalUser> {
  return (await requireSession()).user;
}

export async function getPermissions(): Promise<readonly Permission[]> {
  const session = await getSession();

  return session?.permissions ?? [];
}

/** Only callable from a Server Action or Route Handler. */
export async function createSession(tokens: AuthTokens, remember: boolean): Promise<void> {
  const cookieStore = await cookies();

  // Without "remember", no maxAge: the cookie ends with the browser (shared counter machines).
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    cookieOptions(remember ? REFRESH_MAX_AGE_SECONDS : undefined),
  );

  cookieStore.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    cookieOptions(remember ? REFRESH_MAX_AGE_SECONDS : undefined),
  );
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE };
