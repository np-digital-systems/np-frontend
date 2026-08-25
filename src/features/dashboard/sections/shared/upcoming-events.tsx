import { Calendar } from 'lucide-react';

import { EVENT_ROUTES } from '@/features/events/lib/routes';

import { Card, CardHeader, LinkButton, StatusBadge, EmptyState } from '../../components';
import { UPCOMING_EVENTS } from '../../constants/mock-data';

export function UpcomingEvents() {
  return (
    <Card>
      <CardHeader
        title="Upcoming Events"
        action={
          <LinkButton href={EVENT_ROUTES.calendar}>View calendar</LinkButton>
        }
      />

      {UPCOMING_EVENTS.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No scheduled events"
          description="Events added to the yearly schedule will appear here."
        />
      ) : (
        <ul className="divide-y divide-border">
          {UPCOMING_EVENTS.map((event) => (
            <li key={event.name} className="flex gap-3.5 px-5 py-4">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle"
                aria-hidden
              >
                <Calendar className="size-4 text-primary" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-medium text-text-primary">
                    {event.name}
                  </p>
                  <StatusBadge status={event.status} />
                </div>

                <p className="mt-0.5 text-xs text-text-muted">
                  {event.date} · {event.time}
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  Sponsor: {event.sponsor}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
