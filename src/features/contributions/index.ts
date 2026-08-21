/**
 * Temple contributions feature — public surface.
 *
 * Sanththa is the members' subscription register: who has pledged what, what
 * has been collected and who is behind.
 */
export { SanththaFeature } from './sections/sanththa/sanththa-feature';

export {
  getContributionAccess,
  type ContributionAccess,
} from './lib/contributions-access';

export { CONTRIBUTION_ROUTES } from './lib/routes';

export {
  getCollectionTrend,
  getMemberRecords,
  getSanththaSummary,
} from './lib/contributions-service';

export type {
  CollectionPoint,
  MemberRecord,
  MemberStatus,
  SanththaMember,
  SanththaPayment,
  SanththaSummary,
  SubscriptionFrequency,
} from './types';
