// Server-only module: it reads request cookies via next/headers, so importing
// it from a client component is a build error by construction. Consider
// `npm i server-only` and importing it here to make that boundary explicit.
import { cookies } from 'next/headers';

import { PORTAL_ACCOUNTS } from '@/features/auth/constants/portal-accounts';
import { USER_ROLES, type UserRole } from '@/features/auth/types/user-role';
import type { PortalUser } from '@/features/auth/types/user';

/**
 * The signed-in role.
 *
 * TODO: a real session is an opaque server-issued token, not the role itself —
 * this cookie only stands in until the auth API exists. It is deliberately
 * httpOnly so the value at least cannot be edited from the console, but the
 * portal must not treat it as proof of anything once the API lands.
 */
const SESSION_COOKIE = 'portal-session';

const ROLE_PREVIEW_COOKIE = 'portal-role-preview';

const SESSION_MAX_AGE_DAYS = 30;

/** Who the portal falls back to before anyone has signed in. */
const DEFAULT_USER: PortalUser = PORTAL_ACCOUNTS.admin;

function isUserRole(value: string | undefined): value is UserRole {
  return (
    value !== undefined &&
    (USER_ROLES as readonly string[]).includes(value)
  );
}

/** The signed-in user, or null when no session cookie is present. */
export async function getSession(): Promise<PortalUser | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(SESSION_COOKIE)?.value;

  return isUserRole(role) ? PORTAL_ACCOUNTS[role] : null;
}

export async function getCurrentUser(): Promise<PortalUser> {
  // TODO: replace with the real session lookup once auth is wired up. Until
  // then an unauthenticated visitor still reaches the portal as the default
  // account — swap this for a redirect to AUTH_ROUTES.signIn to close it.
  const user = (await getSession()) ?? DEFAULT_USER;

  // Role preview is a development affordance only. In production the role
  // always comes from the session, so a forged cookie changes nothing.
  if (process.env.NODE_ENV === 'production') {
    return user;
  }

  const cookieStore = await cookies();
  const preview = cookieStore.get(ROLE_PREVIEW_COOKIE)?.value;

  return isUserRole(preview) ? PORTAL_ACCOUNTS[preview] : user;
}

/**
 * Writes the session cookie. Only callable from a Server Action or a Route
 * Handler — Next refuses cookie writes during a render.
 */
export async function createSession(
  role: UserRole,
  remember: boolean,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, role, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',

    // No maxAge means a session cookie: it dies with the browser, which is
    // what a shared counter machine wants.
    ...(remember
      ? { maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60 }
      : {}),
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);

  // A stale preview would otherwise survive the sign-out and put the next
  // visitor straight back into a role.
  cookieStore.delete(ROLE_PREVIEW_COOKIE);
}

export { ROLE_PREVIEW_COOKIE, SESSION_COOKIE };
