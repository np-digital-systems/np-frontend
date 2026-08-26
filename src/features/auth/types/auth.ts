import type { UserRole } from './user-role';

/**
 * Icon keys rather than components: the role options are built on the server
 * and handed to a client component, so everything in them has to survive
 * serialisation. The screen maps a key to a lucide glyph.
 */
export type AuthRoleIcon = 'shield' | 'ledger' | 'counter' | 'devotee';

export interface AuthRoleOption {
  readonly role: UserRole;
  readonly label: string;
  readonly summary: string;
  readonly icon: AuthRoleIcon;

  /** Two or three things this role opens, in the temple's own words. */
  readonly highlights: readonly string[];
}

export type SignInState =
  | { readonly status: 'idle' }
  | { readonly status: 'error'; readonly message: string };

export const SIGN_IN_IDLE: SignInState = { status: 'idle' };
