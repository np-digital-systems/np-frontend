import React from 'react';
import { Card, CardHeader } from '../components';
import { RECENT_ACTIVITY } from '../constants/mock-data';

export function RecentActivity() {
  return (
    <Card>
      <CardHeader title="Recent Activity" />
      <div>
        {RECENT_ACTIVITY.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-5 py-3.5"
            style={{
              borderBottom: i < RECENT_ACTIVITY.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div
              className="rounded-full shrink-0 mt-0.5"
              style={{ width: 7, height: 7, backgroundColor: 'var(--border)', marginTop: 6 }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {item.action}
                {item.ref && (
                  <span className="ml-1.5 font-mono text-xs" style={{ color: 'var(--accent)' }}>
                    {item.ref}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {item.user}
                </span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {item.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
