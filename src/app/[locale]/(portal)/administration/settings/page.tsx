import type { Metadata } from 'next';

import { SettingsFeature } from '@/features/administration';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return <SettingsFeature />;
}
