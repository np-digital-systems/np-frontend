export const AUTH_ROUTES = {
  signIn: '/login',

  /**
   * Where a session lands after signing in. Every role holds
   * `dashboard:view`, so the dashboard is the one destination that can never
   * bounce a freshly signed-in user back out.
   */
  portalHome: '/dashboard',
} as const;
