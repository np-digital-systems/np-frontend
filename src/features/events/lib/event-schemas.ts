import { z } from 'zod';

import {
  isoDate,
  isoTime,
  optionalText,
  requiredText,
} from '@/lib/validation';

import { FREQUENCY_TYPES } from './event-data';

export const eventSchema = z
  .object({
    eventTypeId: z.number().int().positive('Choose an event type.'),
    instanceIdentifier: z
      .number()
      .int()
      .min(1, 'The instance number starts at 1.'),
    scheduledDate: isoDate,
    startTime: isoTime,
    endTime: z.union([isoTime, z.literal('')]),
    sponsorPartyId: z.number().int().positive().nullable(),
    notes: optionalText(1000),
    isCompleted: z.boolean(),
  })
  .refine(
    (draft) => draft.endTime === '' || draft.endTime > draft.startTime,
    {
      message: 'The end time must come after the start time.',
      path: ['endTime'],
    },
  );

export const eventTypeSchema = z.object({
  name: requiredText('A Tamil name'),
  nameEn: optionalText(),
  frequencyType: z.enum(FREQUENCY_TYPES),
  noOfInstances: z
    .number()
    .int()
    .min(1, 'An event type must have at least one instance.')
    .max(366, 'An event type cannot have more than 366 instances.'),
  activityId: z.number().int().positive().nullable(),
});

/**
 * A sponsor is registered against an event type; the instance is optional and
 * `null` means they stand for every instance of that type.
 */
const sponsorPlacement = {
  eventTypeId: z.number().int().positive('Choose an event type.'),
  instanceIdentifier: z
    .number()
    .int()
    .min(1, 'The instance number starts at 1.')
    .nullable(),
};

/**
 * Registering somebody new: their details and the slot in one step.
 *
 * A name and a phone number, which is all the temple has for most sponsors.
 * Email and address belong to a sign-in, and a sponsor does not need one —
 * the electricity board will never have one, and nor will most devotees.
 */
export const newSponsorSchema = z.object({
  ...sponsorPlacement,
  nameTa: requiredText('A sponsor name'),
  nameEn: optionalText(),
  phone: optionalText(32),
});

/** Editing an existing registration — the person is chosen, not typed. */
export const sponsorPlacementSchema = z.object({
  ...sponsorPlacement,
  partyId: z
    .number()
    .int()
    .positive('Choose who is sponsoring this.'),
});

export type EventInput = z.input<typeof eventSchema>;
export type EventTypeInput = z.input<typeof eventTypeSchema>;
export type NewSponsorInput = z.input<typeof newSponsorSchema>;
export type SponsorPlacementInput = z.input<typeof sponsorPlacementSchema>;
