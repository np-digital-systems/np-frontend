import { z } from 'zod';

import { isoDate, optionalText, positiveAmount, requiredText } from '@/lib/validation';

import { PAYMENT_MODES } from './contributions-data';

export const memberSchema = z.object({
  memberNo: requiredText('A member number'),
  nameTa: requiredText('A Tamil name', 160),
  fullName: optionalText(),
  phone: optionalText(32),
  address: optionalText(240),
  notes: optionalText(500),
});

export const paymentSchema = z.object({
  amount: positiveAmount('The amount'),
  paidOn: isoDate,
  mode: z.enum(PAYMENT_MODES),
  receiptRef: optionalText(32),
});
