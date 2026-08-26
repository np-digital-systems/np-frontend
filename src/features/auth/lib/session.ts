// Server-only: it reads request cookies via next/headers, so importing it from
// a client component is a build error by construction.
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

/** What `GET /auth/me` returns. */
interface MeResponse {
  readonly id: string;
  readonly nameTa: string;
  readonly fullName: string | null;
  readonly email: string | null;
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
  /** Granted by the server, not by a matrix compiled into the bundle. */
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

/**
 * The signed-in session, or null.
 *
 * Cached for the lifetime of one request, so a layout and the page it wraps
 * resolve the identity once rather than calling the API for every component
 * that asks who is signed in.
 */
export const getSession = cache(async (): Promise<PortalSession | null> => {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) return null;

  try {
    const me = await api.get<MeResponse>('/auth/me');
    const name = me.fullName ?? me.nameTa;

    return {
      user: {
        id: me.id,
        name,
        email: me.email ?? '',
        role: isUserRole(me.role) ? me.role : 'user',
        initials: initialsOf(name),
      },
      permissions: me.permissions as readonly Permission[],
    };
  } catch (error) {
    // An expired or revoked token is a signed-out visitor, not a crash. The
    // proxy has already had its chance to refresh before the render began.
    if (error instanceof ApiError && error.isUnauthenticated) return null;

    throw error;
  }
});

/** The signed-in user. Throws when there is no session — routes are guarded. */
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

/** Writes the token pair. Only callable from a Server Action or Route Handler. */
export async function createSession(tokens: AuthTokens, remember: boolean): Promise<void> {
  const cookieStore = await cookies();

  // No maxAge means a session cookie: it dies with the browser, which is what
  // a shared counter machine wants.
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
