import { z } from 'zod';

import { email, password } from '@/lib/validation';

export const signInSchema = z.object({
  email,

  // Length only, matching the API; strength rules are enforced by the API.
  password,

  remember: z.boolean(),
});

export type SignInInput = z.input<typeof signInSchema>;
