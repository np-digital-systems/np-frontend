import { z } from 'zod';

import { USER_ROLES } from '@/features/auth/types/user-role';
import { email, optionalText, requiredText } from '@/lib/validation';

export const userSchema = z.object({
  fullName: requiredText('A name'),
  nameTa: optionalText(),
  email,
  phone: optionalText(32),
  address: optionalText(),
  role: z.enum(USER_ROLES),
  isActive: z.boolean(),
});

export const templeProfileSchema = z.object({
  name: requiredText('The temple name'),
  nameTa: requiredText('The Tamil name'),
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
