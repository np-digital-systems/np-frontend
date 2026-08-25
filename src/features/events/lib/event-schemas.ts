import { z } from 'zod';

import { isoDate, isoTime, optionalText, requiredText } from '@/lib/validation';

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
});

export const sponsorAssignmentSchema = z.object({
  eventTypeId: z.number().int().positive('Choose an event type.'),
  instanceIdentifier: z
    .number()
    .int()
    .min(1, 'The instance number starts at 1.'),
  customInstanceName: optionalText(),
  userId: z.string().min(1, 'Choose the devotee or trust sponsoring this.'),
});

export type EventInput = z.input<typeof eventSchema>;
export type EventTypeInput = z.input<typeof eventTypeSchema>;
export type SponsorAssignmentInput = z.input<typeof sponsorAssignmentSchema>;
