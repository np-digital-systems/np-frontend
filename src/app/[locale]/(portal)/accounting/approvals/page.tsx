import type { Metadata } from 'next';

import { ApprovalsFeature } from '@/features/accounting';

export const metadata: Metadata = {
  title: 'Approval Center',
};

export default function ApprovalsPage() {
  return <ApprovalsFeature />;
}
