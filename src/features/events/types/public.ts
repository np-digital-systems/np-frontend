import type { FrequencyType } from './index';

/**
 * An occurrence as the public website receives it.
 *
 * Both names travel because the visitor picks the language, and the raw
 * frequency and instance number travel instead of a rendered label so the site
 * can phrase "Week 24" in Tamil as readily as in English.
 */
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
  readonly notes: string | null;
  readonly isCompleted: boolean;
}
