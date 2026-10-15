export const AUTH_ROUTES = {
  signIn: '/login',

  /** Every role has `dashboard:view`, so this never bounces a new session. */
  portalHome: '/dashboard',
} as const;
