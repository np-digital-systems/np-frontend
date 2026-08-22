import { Calendar, Heart } from 'lucide-react';

import {
  Card,
  CardHeader,
  DashboardShell,
  PageHeader,
  QuickActions,
  type QuickAction,
} from '../../components';
import { EVENT_ROUTES } from '@/features/events/lib/routes';

import type { DashboardProps } from '../../types';
import { UpcomingEvents } from '../shared';

const QUICK_ACTIONS: readonly QuickAction[] = [
  { label: 'Temple Calendar', href: EVENT_ROUTES.calendar, icon: Calendar },
  { label: 'Make a Donation', href: '/#donation-section', icon: Heart },
];

export function MemberDashboard({
  user,
  greeting,
  today,
  financialYear,
}: DashboardProps) {
  return (
    <DashboardShell>
      <PageHeader
        user={user}
        greeting={greeting}
        today={today}
        financialYear={financialYear}
        subtitle="Temple events and announcements"
      />

      <QuickActions actions={QUICK_ACTIONS} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <UpcomingEvents />

        <Card>
          <CardHeader title="Announcements" />
          <div className="p-5">
            <p className="text-[13px] leading-relaxed text-text-secondary">
              Temple notices published by the administration will appear here.
            </p>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
