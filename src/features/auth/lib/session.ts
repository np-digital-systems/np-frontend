// Server-only module: it reads request cookies via next/headers, so importing
// it from a client component is a build error by construction. Consider
// `npm i server-only` and importing it here to make that boundary explicit.
import { cookies } from 'next/headers';

import { USER_ROLES, type UserRole } from '@/features/auth/types/user-role';
import type { PortalUser } from '@/features/auth/types/user';

/**
 * The one place the portal learns who is signed in.
 *
 * Every server component, layout and page reads identity from here — never
 * from a prop drilled down from somewhere else and never from client state.
 * When real authentication lands, only the body of `getCurrentUser` changes;
 * no call site has to move.
 */

/** Cookie a developer can set to preview the portal as another role. */
const ROLE_PREVIEW_COOKIE = 'portal-role-preview';

const MOCK_USER: PortalUser = {
  id: 'usr_001',
  name: 'K. Suresh',
  email: 'suresh@neeliyampathipillaiyarkovil.com',
  role: 'admin',
  initials: 'KS',
};

function isUserRole(value: string | undefined): value is UserRole {
  return (
    value !== undefined &&
    (USER_ROLES as readonly string[]).includes(value)
  );
}

export async function getCurrentUser(): Promise<PortalUser> {
  // TODO: replace with the real session lookup once auth is wired up.
  const user = MOCK_USER;

  // Role preview is a development affordance only. In production the role
  // always comes from the session, so a forged cookie changes nothing.
  if (process.env.NODE_ENV === 'production') {
    return user;
  }

  const cookieStore = await cookies();
  const preview = cookieStore.get(ROLE_PREVIEW_COOKIE)?.value;

  if (!isUserRole(preview)) {
    return user;
  }

  return {
    ...user,
    role: preview,
    name: PREVIEW_NAMES[preview] ?? user.name,
    initials: PREVIEW_INITIALS[preview] ?? user.initials,
  };
}

const PREVIEW_NAMES: Partial<Record<UserRole, string>> = {
  admin: 'K. Suresh',
  accountant: 'S. Vijayan',
  cashier: 'R. Murugan',
  user: 'A. Shanmugam',
};

const PREVIEW_INITIALS: Partial<Record<UserRole, string>> = {
  admin: 'KS',
  accountant: 'SV',
  cashier: 'RM',
  user: 'AS',
};

export { ROLE_PREVIEW_COOKIE };
