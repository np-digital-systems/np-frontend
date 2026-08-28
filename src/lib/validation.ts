import { z } from 'zod';

export const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.');

export const isoTime = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Enter a valid time.');

export const requiredText = (label: string, max = 255) =>
  z.string().trim().min(1, `${label} is required.`).max(max);

export const optionalText = (max = 255) =>
  z.string().trim().max(max).default('');

export const positiveAmount = (label = 'The amount') =>
  z
    .number({ message: `${label} must be a number.` })
    .positive(`${label} must be greater than zero.`);

export const nonNegativeAmount = (label = 'The amount') =>
  z
    .number({ message: `${label} must be a number.` })
    .min(0, `${label} cannot be negative.`);

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.');

/**
 * An address that may be left blank.
 *
 * Most people on the register have no email at all, so the field is optional —
 * but anything actually typed still has to be an address.
 */
export const optionalEmail = z.union([email, z.literal('')]).default('');

export const percentage = (label = 'The rate') =>
  z
    .number({ message: `${label} must be a number.` })
    .min(0, `${label} cannot be negative.`)
    .max(100, `${label} cannot exceed 100%.`);

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Check the values above.';
}

export type ValidationResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly message: string };

export function validate<Schema extends z.ZodType>(
  schema: Schema,
  value: unknown,
): ValidationResult<z.output<Schema>> {
  const result = schema.safeParse(value);

  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, message: firstIssue(result.error) };
}
