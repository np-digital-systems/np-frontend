import { z } from 'zod';

import { USER_ROLES } from '@/features/auth/types/user-role';
import {
  email,
  optionalEmail,
  optionalText,
  PASSWORD_MIN_LENGTH,
  requiredText,
} from '@/lib/validation';

export const userSchema = z.object({
  /** Null when registering a new person. */
  partyId: z.number().int().positive().nullable(),
  // Optional: an existing party already has a name. Required below only for new people.
  nameTa: optionalText(160),
  fullName: optionalText(),
  email: optionalEmail,
  phone: optionalText(32),
  address: optionalText(),
  role: z.enum(USER_ROLES),
  isActive: z.boolean(),
  password: optionalText(128),
  passwordConfirmation: optionalText(128),
}).superRefine((value, ctx) => {
  if (value.partyId === null && !value.nameTa?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['nameTa'],
      message: 'Pick somebody from the directory, or give a Tamil name to register them.',
    });
  }

  // The API requires an email for every role except `user` (devotees don't sign in).
  if (value.role !== 'member' && !value.email) {
    ctx.addIssue({
      code: 'custom',
      path: ['email'],
      message: 'Staff sign in with their email, so this one is needed.',
    });
  }

  // Only new staff accounts need a password; the dialog enforces when. Confirmation catches
  // typos, since an admin sets it on someone else's behalf.
  if (value.password) {
    if (value.password.length < PASSWORD_MIN_LENGTH) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: `The password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      });
    }

    if (value.password !== value.passwordConfirmation) {
      ctx.addIssue({
        code: 'custom',
        path: ['passwordConfirmation'],
        message: 'The two passwords do not match.',
      });
    }
  }
});

export const templeProfileSchema = z.object({
  nameTa: requiredText('The Tamil name'),
  name: optionalText(),
  registrationNo: optionalText(64),
  address: optionalText(500),
  phone: optionalText(32),
  email: z.union([email, z.literal('')]),
  website: optionalText(255),
});

export const accountingSettingsSchema = z.object({
  receiptPrefix: z
    .string()
    .trim()
    .regex(/^[A-Z]{2,4}$/, 'Use two to four capital letters, e.g. RV.'),
  paymentPrefix: z
    .string()
    .trim()
    .regex(/^[A-Z]{2,4}$/, 'Use two to four capital letters, e.g. PV.'),
  yearStartMonth: z.number().int().min(1).max(12),
  approvalThreshold: z
    .number()
    .min(0, 'The approval threshold cannot be negative.'),
  requireSeparatePoster: z.boolean(),
});

export type UserInput = z.input<typeof userSchema>;
