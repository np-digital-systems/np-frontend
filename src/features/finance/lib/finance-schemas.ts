import { z } from 'zod';

import {
  isoDate,
  nonNegativeAmount,
  optionalText,
  percentage,
  positiveAmount,
  requiredText,
} from '@/lib/validation';

import {
  ASSET_CATEGORIES,
  ASSET_CONDITIONS,
  INTEREST_PAYOUTS,
  PROJECT_STATUSES,
} from './finance-data';

export const fundSchema = z.object({
  nameTa: requiredText('A Tamil name'),
  name: optionalText(),
  opening: nonNegativeAmount('An opening balance'),
  isActive: z.boolean(),
});

export const projectSchema = z
  .object({
    nameTa: requiredText('A Tamil name'),
    name: optionalText(),
    fundId: z.number().int().positive('Choose a fund.'),
    budget: nonNegativeAmount('A budget').nullable(),
    startDate: isoDate,
    targetDate: z.union([isoDate, z.literal('')]),
    status: z.enum(PROJECT_STATUSES),
    description: optionalText(1000),
    isActive: z.boolean(),
  })
  .refine(
    (draft) => draft.targetDate === '' || draft.targetDate >= draft.startDate,
    {
      message: 'The target date cannot fall before the start date.',
      path: ['targetDate'],
    },
  );

export const depositSchema = z.object({
  certificateNo: requiredText('The certificate number', 64),
  bankName: requiredText('The bank name'),
  branch: optionalText(),
  principal: positiveAmount('The principal'),
  interestRate: percentage('The interest rate').refine(
    (rate) => rate > 0,
    'Enter the annual interest rate as a percentage, e.g. 12.5.',
  ),
  placedOn: isoDate,
  tenureMonths: z
    .number()
    .int()
    .min(1, 'The tenure must be at least one month.')
    .max(120, 'The tenure cannot exceed ten years.'),
  interestPayout: z.enum(INTEREST_PAYOUTS),
  fundId: z.number().int().positive('Choose a fund.'),
  notes: optionalText(1000),
});

export const assetSchema = z.object({
  tag: requiredText('An asset tag', 32).transform((value) =>
    value.toUpperCase(),
  ),
  nameTa: requiredText('A Tamil name'),
  name: optionalText(),
  category: z.enum(ASSET_CATEGORIES),
  acquiredOn: isoDate,
  cost: positiveAmount('The acquisition cost'),
  depreciationRate: percentage('The depreciation rate'),
  location: optionalText(),
  condition: z.enum(ASSET_CONDITIONS),
  status: z.enum(['in-use', 'in-storage', 'under-repair', 'disposed']),
  fundId: z.number().int().positive('Choose a fund.'),
  notes: optionalText(1000),
});

export const disposalSchema = z.object({
  disposedOn: isoDate,
  disposalValue: nonNegativeAmount('The disposal value'),
  notes: requiredText('A note saying what happened to it', 1000),
});

export type FundInput = z.input<typeof fundSchema>;
export type ProjectInput = z.input<typeof projectSchema>;
export type DepositInput = z.input<typeof depositSchema>;
export type AssetInput = z.input<typeof assetSchema>;
