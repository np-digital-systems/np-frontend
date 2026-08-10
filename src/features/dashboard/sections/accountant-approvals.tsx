import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, LinkButton, Badge } from '../components';

export function AccountantApprovals() {
  const items = [
    { ref: 'RV-2026-0125', type: 'Receipt', amount: '₹25,000' },
    { ref: 'PV-2026-0025', type: 'Payment', amount: '₹15,000' },
    { ref: 'RV-2026-0126', type: 'Receipt', amount: '₹8,500' },
  ];

  return (
    <Card>
      <CardHeader
        title="Pending Approvals"
        action={
          <LinkButton>
            Open center <ChevronRight size={12} />
          </LinkButton>
        }
      />
      <div
        className="px-5 py-3 flex items-center gap-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {[
          { label: 'Receipts', count: 5, color: 'var(--success)' },
          { label: 'Payments', count: 3, color: 'var(--danger)' },
          { label: 'Total', count: 8, color: 'var(--text-primary)' },
        ].map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <p
              className="text-2xl font-semibold tabular"
              style={{ color: s.color, letterSpacing: '-0.02em' }}
            >
              {s.count}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <div>
        {items.map((item, i) => (
          <div
            key={item.ref}
            className="flex items-center justify-between px-5 py-3"
            style={{
              borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div>
              <p className="text-xs font-mono font-medium" style={{ color: 'var(--accent)' }}>
                {item.ref}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {item.type}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tabular" style={{ color: 'var(--text-primary)' }}>
                {item.amount}
              </span>
              <Badge status="Pending Approval" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
