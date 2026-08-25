import type { Metadata } from 'next';

import { UsersFeature } from '@/features/administration';

export const metadata: Metadata = {
  title: 'Users',
};

export default function UsersPage() {
  return <UsersFeature />;
}
