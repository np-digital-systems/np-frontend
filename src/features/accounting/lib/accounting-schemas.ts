import { z } from 'zod';

import {
  isoDate,
  nonNegativeAmount,
  optionalText,
  positiveAmount,
  requiredText,
} from '@/lib/validation';

import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  ACTIVITY_KINDS,
  PARTY_KINDS,
  PAYMENT_MODES,
  opensAtZero,
} from './accounting-data';

export const ACCOUNT_CODE_PREFIX = {
  asset: '1',
  liability: '2',
  equity: '3',
  income: '4',
  expense: '5',
} as const;

export const voucherSchema = z
  .object({
    date: isoDate,
    description: requiredText('A description'),
    amount: positiveAmount('The amount'),
    accountId: z.number().int().positive('Choose a ledger account.'),
    fundId: z.number().int().positive('Choose a fund.'),
    projectId: z.number().int().positive().nullable(),
    activityId: z.number().int().positive().nullable(),
    partyId: z.number().int().positive().nullable(),
    mode: z.enum(PAYMENT_MODES),
    bankAccountId: z.number().int().positive().nullable(),
    chequeNo: optionalText(32),
    party: requiredText('This field'),
    manualVoucherNo: optionalText(32),
    eventTypeId: z.number().int().positive().nullable(),
    eventId: z.number().int().positive().nullable(),
    notes: optionalText(1000),
  })
  .refine(
    (draft) => draft.mode === 'cash' || draft.bankAccountId !== null,
    {
      message: 'Choose the bank account this money moves through.',
      path: ['bankAccountId'],
    },
  )
  .refine(
    (draft) => draft.mode !== 'cheque' || draft.chequeNo.length > 0,
    {
      message: 'A cheque number is required for a cheque payment.',
      path: ['chequeNo'],
    },
  );

/** Pooja sponsorship needs the pooja identified before the entry means anything. */
export function poojaRefinement(isSponsorshipAccount: boolean) {
  return (draft: { eventTypeId: number | null; eventId: number | null }) =>
    !isSponsorshipAccount || (draft.eventTypeId !== null && draft.eventId !== null);
}

export const accountSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'The account code must be four digits, e.g. 5012.'),
    nameTa: requiredText('A Tamil name'),
    name: optionalText(),
    type: z.enum(ACCOUNT_TYPES),
    parentId: z.number().int().positive().nullable(),
    openingBalance: nonNegativeAmount('The opening balance'),
    isActive: z.boolean(),
  })
  .superRefine((draft, ctx) => {
    const prefix = ACCOUNT_CODE_PREFIX[draft.type];

    if (!draft.code.startsWith(prefix)) {
      ctx.addIssue({
        code: 'custom',
        path: ['code'],
        message: `${ACCOUNT_TYPE_LABELS[draft.type]} accounts are numbered in the ${prefix}000 range.`,
      });
    }

    if (draft.openingBalance !== 0 && opensAtZero(draft.type)) {
      ctx.addIssue({
        code: 'custom',
        path: ['openingBalance'],
        message: `${ACCOUNT_TYPE_LABELS[draft.type]} heads measure a year, not a position, so they always open at nil.`,
      });
    }
  });

export const activitySchema = z.object({
  nameTa: requiredText('A Tamil name'),
  nameEn: optionalText(),
  kind: z.enum(ACTIVITY_KINDS),
  defaultFundId: z.number().int().positive().nullable(),
  isActive: z.boolean(),
});

export const partySchema = z.object({
  nameTa: requiredText('A Tamil name'),
  nameEn: optionalText(),
  kind: z.enum(PARTY_KINDS),
  phone: optionalText(32),
  isActive: z.boolean(),
});

export const bankAccountSchema = z.object({
  label: requiredText('A label'),
  bankName: requiredText('The bank name'),
  branch: optionalText(),
  // The whole number: the API stores it and masks it on the way back out, so
  // the browser never receives more than the last four digits.
  accountNumber: z
    .string()
    .trim()
    .regex(/^[0-9-]{6,34}$/, 'Enter the account number, digits and dashes only.'),
  type: z.enum(['current', 'savings', 'fixed-deposit']),
  openingBalance: nonNegativeAmount('The opening balance'),
  openedOn: isoDate,
  isActive: z.boolean(),
  ledgerAccountId: z
    .number({ message: 'Choose the asset head this account posts through.' })
    .int()
    .positive('Choose the asset head this account posts through.')
    .nullable(),
});

export const rejectionSchema = z.object({
  reason: requiredText('A reason', 500),
});

export type VoucherInput = z.input<typeof voucherSchema>;
export type AccountInput = z.input<typeof accountSchema>;
export type BankAccountInput = z.input<typeof bankAccountSchema>;
export type ActivityInput = z.input<typeof activitySchema>;
export type PartyInput = z.input<typeof partySchema>;
