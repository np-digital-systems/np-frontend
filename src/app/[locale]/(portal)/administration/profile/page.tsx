import type { Metadata } from 'next';

import { ProfileFeature } from '@/features/administration';

export const metadata: Metadata = {
  title: 'My Profile',
};

export default function ProfilePage() {
  return <ProfileFeature />;
}
