import type { Metadata } from 'next';

import { AssetsFeature } from '@/features/finance';

export const metadata: Metadata = {
  title: 'Assets',
};

export default function AssetsPage() {
  return <AssetsFeature />;
}
