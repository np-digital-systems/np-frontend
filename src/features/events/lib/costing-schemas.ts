import { z } from 'zod';

import { isoDate, optionalText, requiredText } from '@/lib/validation';

/**
 * An item is a name and a figure.
 *
 * The committee agrees what a head comes to and, where it helps, what the parts
 * of it are. They do not price by the coconut, so nothing here asks them to.
 */
export const costingItemSchema = z.object({
  label: requiredText('An item name', 160),
  amount: z
    .number({ message: 'An item amount must be a number.' })
    .positive('An item amount must be greater than zero.'),
});

/**
 * One expected cost as it is written.
 *
 * No fund and no activity: both come from the pooja type's own activity, which
 * already answers them for every receipt the temple raises.
 */
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

/** A costing may be saved empty; the lines are written in the editor. */
export const costingLinesSchema = z.array(costingLineSchema).max(80);

/** Filling a voucher in from a budget still needs the paper book number. */
export const movementSchema = z.object({
  date: isoDate,
  mode: z.enum(['cash', 'bank', 'cheque', 'online']),
  bankAccountId: z.number().int().positive().nullable(),
  chequeNo: optionalText(40),
  manualVoucherNo: requiredText('The manual voucher number', 60),
});
