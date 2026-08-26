import { z } from 'zod';

import { email } from '@/lib/validation';

export const signInSchema = z.object({
  email,

  // Length only. The strength rules belong to the API that hashes it, not to
  // the form that collects it.
  password: z
    .string()
    .min(6, 'Your password is at least six characters.')
    .max(128, 'That password is too long.'),

  remember: z.boolean(),
});

export type SignInInput = z.input<typeof signInSchema>;
