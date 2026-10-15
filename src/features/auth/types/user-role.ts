// Non-staff all share `member`; what they see is derived from their party.
export const USER_ROLES = ['admin', 'accountant', 'cashier', 'member'] as const;

export type UserRole = (typeof USER_ROLES)[number];