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
  /** Null when registering a new person rather than granting to an existing one. */
  partyId: z.number().int().positive().nullable(),
  /*
   * The Tamil name is the record; the English one is a convenience.
   *
   * Optional here rather than required, because a sign-in granted to somebody
   * already in the directory carries no name at all — theirs is on the party.
   * The refinement below demands it only when registering a new person.
   */
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
  // A new person needs a name; an existing one already has one on their party.
  if (value.partyId === null && !value.nameTa?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: ['nameTa'],
      message: 'Pick somebody from the directory, or give a Tamil name to register them.',
    });
  }

  /*
   * Staff sign in; devotees do not.
   *
   * The API requires an email for every role except `user`, because that is
   * the credential someone signs in with. A devotee on the register has no
   * account to sign in to, and often no email either.
   */
  if (value.role !== 'member' && !value.email) {
    ctx.addIssue({
      code: 'custom',
      path: ['email'],
      message: 'Staff sign in with their email, so this one is needed.',
    });
  }

  /*
   * Whether a password is *needed* depends on context the schema cannot see —
   * only a new staff account requires one, and the API refuses to change a
   * password through an edit at all. So the rules here are about the password
   * itself, and the dialog adds the one about when it must be present.
   *
   * The confirmation exists because an administrator types this password for
   * somebody else and then has to tell them what it is. A typo would not
   * surface as a validation error but as a colleague who cannot sign in, with
   * nothing to point at.
   */
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
