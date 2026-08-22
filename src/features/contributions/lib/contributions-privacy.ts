import type { MemberRecord } from '../types';

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
