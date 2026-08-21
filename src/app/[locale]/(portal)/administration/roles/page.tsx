import type { Metadata } from 'next';

import { RolesFeature } from '@/features/administration';

export const metadata: Metadata = {
  title: 'Roles & Permissions',
};

export default function RolesPage() {
  return <RolesFeature />;
}
