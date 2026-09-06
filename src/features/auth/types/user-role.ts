/**
 * What a sign-in may do. Everyone outside staff shares `member`; what the
 * portal shows them is derived from their party, not from this.
 */
export const USER_ROLES = ['admin', 'accountant', 'cashier', 'member'] as const;

export type UserRole = (typeof USER_ROLES)[number];