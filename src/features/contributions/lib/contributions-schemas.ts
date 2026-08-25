import { z } from 'zod';

import {
  isoDate,
  optionalText,
  positiveAmount,
  requiredText,
} from '@/lib/validation';

import { FREQUENCIES, MEMBER_STATUSES } from './contributions-data';

export const memberSchema = z.object({
  memberNo: requiredText('A membership number', 32).transform((value) =>
    value.toUpperCase(),
  ),
  fullName: requiredText('A member name'),
  nameTa: optionalText(),
  phone: optionalText(32),
  address: optionalText(),
  subscriptionAmount: positiveAmount('The subscription amount'),
  frequency: z.enum(FREQUENCIES),
  joinedOn: isoDate,
  status: z.enum(MEMBER_STATUSES),
  notes: optionalText(1000),
});

export const paymentSchema = z.object({
  period: z.string().min(1, 'Choose the period this payment covers.'),
  amount: positiveAmount('The amount'),
  paidOn: isoDate,
  mode: z.enum(['cash', 'bank', 'online']),
});

export type MemberInput = z.input<typeof memberSchema>;
export type PaymentInput = z.input<typeof paymentSchema>;
