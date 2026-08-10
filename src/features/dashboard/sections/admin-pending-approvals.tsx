import React from 'react';
import { ChevronRight, Eye } from 'lucide-react';
import { Card, CardHeader, LinkButton, Badge } from '../components';
import { ADMIN_APPROVALS } from '../constants/mock-data';

export function AdminPendingApprovals() {
  return (
    <Card>
      <CardHeader
        title="Pending Approvals"
        action={
          <LinkButton>
            View all <ChevronRight size={12} />
          </LinkButton>
        }
      />
      <div>
        {ADMIN_APPROVALS.map((item, i) => (
          <div
            key={item.ref}
            className="px-5 py-4"
            style={{
              borderBottom: i < ADMIN_APPROVALS.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p
                  className="text-xs font-medium tabular"
                  style={{
                    color: 'var(--accent)',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {item.ref}
                </p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {item.type}
                </p>
              </div>
              <p
                className="text-sm font-semibold tabular shrink-0"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.amount}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
              {[
                { label: 'Payee', value: item.payee },
                { label: 'Fund', value: item.fund },
                { label: 'Project', value: item.project },
                { label: 'Created by', value: item.by },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-1.5">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {row.label}:
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Badge status="Pending Approval" />
              <button
                className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <Eye size={12} /> Review
              </button>
            </div>
          </div>
        ))}
      </div>
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          12 pending approvals total
        </span>
        <LinkButton>
          View all <ChevronRight size={12} />
        </LinkButton>
      </div>
    </Card>
  );
}
