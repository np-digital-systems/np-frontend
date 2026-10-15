import { z } from 'zod';

import { isoDate, optionalText, requiredText } from '@/lib/validation';

export const costingItemSchema = z.object({
  label: requiredText('An item name', 160),
  amount: z
    .number({ message: 'An item amount must be a number.' })
    .positive('An item amount must be greater than zero.'),
});

export const costingLineSchema = z
  .object({
    accountId: z.number().int().positive('Choose an expense head for every line.'),
    partyId: z.number().int().positive().nullable(),
    label: z.string().trim().max(160).nullable(),
    amount: z.number({ message: 'A line amount must be a number.' }).min(0),
    chargedToSponsor: z.boolean(),
    items: z.array(costingItemSchema).max(60),
  })
  .refine((line) => line.items.length > 0 || line.amount > 0, {
    message: 'Give the line an amount, or itemise it.',
    path: ['amount'],
  });

export const costingSchema = z.object({
  eventTypeId: z.number().int().positive('Choose a pooja type.'),
  slotId: z.number().int().positive().nullable(),
  effectiveFrom: isoDate.optional(),
  notes: optionalText(2000),
});

export const costingLinesSchema = z.array(costingLineSchema).max(80);

export const movementSchema = z.object({
  date: isoDate,
  mode: z.enum(['cash', 'bank', 'cheque', 'online']),
  bankAccountId: z.number().int().positive().nullable(),
  chequeNo: optionalText(40),
  manualVoucherNo: requiredText('The manual voucher number', 60),
});
