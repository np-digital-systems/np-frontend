import { z } from 'zod';

import { email } from '@/lib/validation';

import { USER_ROLES } from '../types/user-role';

export const signInSchema = z.object({
  role: z.enum(USER_ROLES, { message: 'Choose the role you are signing in as.' }),
  email,

  // Length only. The strength rules belong to the API that will hash it, not
  // to the form that collects it.
  password: z
    .string()
    .min(6, 'Your password is at least six characters.')
    .max(128, 'That password is too long.'),

  remember: z.boolean(),
});

export type SignInInput = z.input<typeof signInSchema>;
