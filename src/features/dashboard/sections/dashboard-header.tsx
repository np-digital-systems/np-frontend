import React from 'react';

interface DashboardHeaderProps {
  name: string;
  role: string;
}

export function DashboardHeader({ name, role }: DashboardHeaderProps) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
          {greeting},
        </p>
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          {name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Temple Management Overview ({role})
        </p>
      </div>
      <div
        className="flex items-center gap-4 rounded-xl px-4 py-2.5 shrink-0"
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Financial Year
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
              2026
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}
            >
              Open
            </span>
          </div>
        </div>
        <div style={{ width: 1, height: 28, backgroundColor: 'var(--border)' }} />
        <div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Date
          </p>
          <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
            12 August 2026
          </p>
        </div>
      </div>
    </div>
  );
}
