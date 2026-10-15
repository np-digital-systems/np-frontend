import type { UserRole } from './user-role';

// Icon keys, not components, so the options can be serialised from server to client.
export type AuthRoleIcon = 'shield' | 'ledger' | 'counter' | 'devotee';

export interface AuthRoleOption {
  readonly role: UserRole;
  readonly label: string;
  readonly summary: string;
  readonly icon: AuthRoleIcon;

  readonly highlights: readonly string[];
}

export type SignInState =
  | { readonly status: 'idle' }
  | { readonly status: 'error'; readonly message: string };

export const SIGN_IN_IDLE: SignInState = { status: 'idle' };
