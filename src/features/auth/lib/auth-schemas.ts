import { z } from 'zod';

import { email, password } from '@/lib/validation';

export const signInSchema = z.object({
  email,

  // Length only, and the same floor the API applies. The strength rules belong
  // to the API that hashes it, not to the form that collects it.
  password,

  remember: z.boolean(),
});

export type SignInInput = z.input<typeof signInSchema>;
