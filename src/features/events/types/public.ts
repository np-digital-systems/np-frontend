import type { FrequencyType } from './index';

// Raw frequency and instance number (not a rendered label) so the site can localise it.
export interface PublicEvent {
  readonly id: number;
  readonly eventTypeId: number;
  readonly nameTa: string;
  readonly nameEn: string;
  readonly frequencyType: FrequencyType;
  readonly instanceIdentifier: number;
  readonly customInstanceName: string | null;
  readonly scheduledDate: string;
  readonly startTime: string;
  readonly endTime: string | null;
  /** Name only; contact details are never exposed publicly. */
  readonly sponsorNameTa: string | null;
  readonly sponsorNameEn: string | null;
  readonly notes: string | null;
  readonly isCompleted: boolean;
}
