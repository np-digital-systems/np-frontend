import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Card, CardHeader, LinkButton, Badge } from '../components';
import { UPCOMING_EVENTS } from '../constants/mock-data';

export function UpcomingEvents() {
  return (
    <Card>
      <CardHeader
        title="Upcoming Events"
        action={
          <LinkButton>
            View calendar <ChevronRight size={12} />
          </LinkButton>
        }
      />
      <div>
        {UPCOMING_EVENTS.map((ev, i) => (
          <div
            key={ev.name}
            className="flex gap-4 px-5 py-4"
            style={{
              borderBottom: i < UPCOMING_EVENTS.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 40, height: 40, backgroundColor: 'var(--accent-subtle)' }}
            >
              <Calendar size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {ev.name}
                </p>
                <Badge status={ev.status} />
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {ev.date} · {ev.time}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Sponsor: {ev.sponsor}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
