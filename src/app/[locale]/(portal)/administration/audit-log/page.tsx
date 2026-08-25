import type { Metadata } from 'next';

import { AuditLogFeature } from '@/features/administration';

export const metadata: Metadata = {
  title: 'Audit Log',
};

export default function AuditLogPage() {
  return <AuditLogFeature />;
}
