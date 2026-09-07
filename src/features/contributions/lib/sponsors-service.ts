import 'server-only';

import { getAll } from '@/lib/api';

import type { SponsorRecord } from '../types';

/** A row of `GET /sponsors` — the register, not the event assignments. */
interface ApiSponsor {
  readonly partyId: number;
  readonly sponsorNo: string;
  readonly name: string;
  readonly nameEn: string;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly sponsorSince: string;
  readonly subscribes: boolean;
  readonly isActive: boolean;
  readonly notes: string | null;
  readonly sponsorships: number;
  readonly paidYears: readonly number[];
  readonly totalPaid: number;
  readonly paidThisYear: boolean;
}

function toRecord(row: ApiSponsor): SponsorRecord {
  return {
    partyId: row.partyId,
    sponsorNo: row.sponsorNo,
    name: row.name,
    nameEn: row.nameEn,
    phone: row.phone ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    sponsorSince: row.sponsorSince?.slice(0, 10) ?? '',
    subscribes: row.subscribes,
    isActive: row.isActive,
    notes: row.notes,
    sponsorships: row.sponsorships,
    paidYears: row.paidYears ?? [],
    totalPaid: row.totalPaid ?? 0,
    paidThisYear: row.paidThisYear ?? false,
  };
}

export async function getSponsorRecords(year?: number): Promise<readonly SponsorRecord[]> {
  const rows = await getAll<ApiSponsor>('/sponsors', { year });

  return rows.map(toRecord);
}
