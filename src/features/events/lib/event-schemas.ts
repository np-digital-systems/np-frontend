import { z } from 'zod';

import {
  isoDate,
  isoTime,
  optionalEmail,
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
    customInstanceName: optionalText(),
    scheduledDate: isoDate,
    startTime: isoTime,
    endTime: z.union([isoTime, z.literal('')]),
    sponsorId: z.string().nullable(),
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
  customInstanceName: optionalText(),
};

/** Registering somebody new: their details and the slot in one step. */
export const newSponsorSchema = z.object({
  ...sponsorPlacement,
  fullName: requiredText('A sponsor name'),
  phone: optionalText(32),
  email: optionalEmail,
  address: optionalText(500),
});

/** Editing an existing registration — the person is chosen, not typed. */
export const sponsorPlacementSchema = z.object({
  ...sponsorPlacement,
  userId: z.string().min(1, 'Choose the devotee or trust sponsoring this.'),
});

export type EventInput = z.input<typeof eventSchema>;
export type EventTypeInput = z.input<typeof eventTypeSchema>;
export type NewSponsorInput = z.input<typeof newSponsorSchema>;
export type SponsorPlacementInput = z.input<typeof sponsorPlacementSchema>;
