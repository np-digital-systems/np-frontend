import type { MemberRecord } from '../types';

/**
 * Contact-detail redaction.
 *
 * A role that cannot see a member's phone and address must not be *sent*
 * them — a server component's props travel to the browser in the RSC
 * payload, so a conditional in the markup hides the field from the eye and
 * from nothing else.
 */
export function redactMembers(
  members: readonly MemberRecord[],
  canSeeContact: boolean,
): readonly MemberRecord[] {
  if (canSeeContact) return members;

  return members.map((member) => ({
    ...member,
    phone: '',
    address: '',
    // Notes are kept by whoever runs the register and often carry personal
    // circumstances — "away since June", "family to settle on return".
    notes: null,
  }));
}
