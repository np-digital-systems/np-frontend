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
  /**
   * The number off the paper receipt book. Required: the member walks away
   * holding it, and an entry that cannot be matched to what they hold is not
   * evidence of anything.
   */
  manualVoucherNo: requiredText('A receipt book number', 32),
});
