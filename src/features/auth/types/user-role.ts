export const USER_ROLES = [
  'admin',
  'accountant',
  'cashier',
  'user',
] as const;

export type UserRole = (typeof USER_ROLES)[number];