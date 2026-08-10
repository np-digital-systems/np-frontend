import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader } from '../components';

export function AccountantCashBook() {
  return (
    <Card>
      <CardHeader title="Cash Book" />
      <div className="p-5 space-y-3">
        {[
          { label: 'Opening Balance', value: '₹1,20,000', color: 'var(--text-primary)' },
          { label: "Today's Receipts", value: '+₹35,000', color: 'var(--success)' },
          { label: "Today's Payments", value: '−₹29,550', color: 'var(--danger)' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {row.label}
            </span>
            <span className="text-sm tabular font-medium" style={{ color: row.color }}>
              {row.value}
            </span>
          </div>
        ))}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '2px solid var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Closing Balance
          </span>
          <span
            className="text-2xl font-semibold tabular"
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
          Open Cash Book <ChevronRight size={12} />
        </button>
      </div>
    </Card>
  );
}
