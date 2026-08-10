import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader } from '../components';

export function CashierCash() {
  return (
    <Card>
      <CardHeader title="Today's Cash" />
      <div className="p-5 space-y-3">
        {[
          { label: 'Opening Balance', value: '₹1,20,000', color: 'var(--text-primary)' },
          { label: 'Receipts', value: '+₹35,000', color: 'var(--success)' },
          { label: 'Payments', value: '−₹29,550', color: 'var(--danger)' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {row.label}
            </span>
            <span className="text-sm font-medium tabular" style={{ color: row.color }}>
              {row.value}
            </span>
          </div>
        ))}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '2px solid var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Current Balance
          </span>
          <span
            className="text-xl font-semibold tabular"
            style={{ color: 'var(--accent)', letterSpacing: '-0.02em' }}
          >
            ₹1,25,450
          </span>
        </div>
        <button
          className="w-full flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg py-2 mt-2"
          style={{
            backgroundColor: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          View Cash Book <ChevronRight size={12} />
        </button>
      </div>
    </Card>
  );
}
