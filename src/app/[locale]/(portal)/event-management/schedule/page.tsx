import type { Metadata } from 'next';

import { YearlyScheduleFeature } from '@/features/events';

export const metadata: Metadata = {
  title: 'Yearly Schedule',
};

export default function YearlySchedulePage() {
  return <YearlyScheduleFeature />;
}
