import React from 'react';
import { BadgeStatus } from '../types';

const badgeCfg: Record<BadgeStatus, { bg: string; text: string }> = {
  Draft: { bg: 'var(--surface-2)', text: 'var(--text-secondary)' },
  Submitted: { bg: 'rgba(10,132,255,0.1)', text: 'var(--accent)' },
  'Pending Approval': { bg: 'rgba(255,159,10,0.12)', text: 'var(--warning)' },
  Approved: { bg: 'var(--success-subtle)', text: 'var(--success)' },
  Rejected: { bg: 'var(--danger-subtle)', text: 'var(--danger)' },
  Posted: { bg: 'rgba(175,82,222,0.12)', text: '#AF52DE' },
  Cancelled: { bg: 'var(--surface-2)', text: 'var(--text-muted)' },
  Scheduled: { bg: 'rgba(10,132,255,0.1)', text: 'var(--accent)' },
  Active: { bg: 'var(--success-subtle)', text: 'var(--success)' },
};

interface BadgeProps {
  status: BadgeStatus;
}

export function Badge({ status }: BadgeProps) {
  const cfg = badgeCfg[status] ?? badgeCfg.Draft;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      <span className="rounded-full" style={{ width: 5, height: 5, backgroundColor: cfg.text }} />
      {status}
    </span>
  );
}
