import type { Metadata } from 'next';

import { FinancialYearsFeature } from '@/features/administration';

export const metadata: Metadata = {
  title: 'Financial Years',
};

export default function FinancialYearsPage() {
  return <FinancialYearsFeature />;
}
