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
  funding: z.enum(['sponsored', 'general']),
  noOfInstances: z
    .number()
    .int()
    .min(1, 'An event type must have at least one instance.')
    .max(366, 'An event type cannot have more than 366 instances.'),
  activityId: z.number().int().positive().nullable(),
});

const sponsorPlacement = {
  eventTypeId: z.number().int().positive('Choose an event type.'),
  instanceIdentifier: z
    .number()
    .int()
    .min(1, 'The instance number starts at 1.')
    .nullable(),
};

export const newSponsorSchema = z.object({
  ...sponsorPlacement,
  nameTa: requiredText('A sponsor name'),
  nameEn: optionalText(),
  phone: optionalText(32),
});

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
