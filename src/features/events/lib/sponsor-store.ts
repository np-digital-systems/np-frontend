import { SPONSOR_USERS } from '../constants/mock-data';
import type { SponsorUser } from '../types';

/** Sponsors registered while the app is running. See `voucher-store`. */
const created: SponsorUser[] = [];

export function addSponsor(sponsor: SponsorUser): void {
  created.push(sponsor);
}

export function allSponsors(): readonly SponsorUser[] {
  return [...SPONSOR_USERS, ...created];
}

export function nextSponsorId(): string {
  const highest = allSponsors().reduce((max, sponsor) => {
    const n = Number(sponsor.id.replace(/\D/g, ''));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);

  return `usr_${highest + 1}`;
}
