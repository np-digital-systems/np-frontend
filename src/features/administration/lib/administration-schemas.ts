import { z } from 'zod';

import { USER_ROLES } from '@/features/auth/types/user-role';
import { email, optionalEmail, optionalText, requiredText } from '@/lib/validation';

export const userSchema = z.object({
  /*
   * The Tamil name is the record; the English one is a convenience.
   *
   * The register is kept in Tamil, and most devotees have no email at all, so
   * those are the two the API treats as optional — this follows it rather than
   * demanding more of a devotee than the temple does.
   */
  nameTa: requiredText('A Tamil name'),
  fullName: optionalText(),
  email: optionalEmail,
  phone: optionalText(32),
  address: optionalText(),
  role: z.enum(USER_ROLES),
  isActive: z.boolean(),
}).superRefine((value, ctx) => {
  /*
   * Staff sign in; devotees do not.
   *
   * The API requires an email for every role except `user`, because that is
   * the credential someone signs in with. A devotee on the register has no
   * account to sign in to, and often no email either.
   */
  if (value.role !== 'user' && !value.email) {
    ctx.addIssue({
      code: 'custom',
      path: ['email'],
      message: 'Staff sign in with their email, so this one is needed.',
    });
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
