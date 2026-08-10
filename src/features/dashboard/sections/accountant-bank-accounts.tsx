import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader } from '../components';

export function AccountantBankAccounts() {
  return (
    <Card>
      <CardHeader title="Bank Accounts" />
      <div className="p-5 space-y-3">
        {[
          { name: "People's Bank", value: '₹4,50,000' },
          { name: 'Bank of Ceylon', value: '₹1,20,000' },
        ].map((a) => (
          <div key={a.name} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {a.name}
            </span>
            <span className="text-sm font-medium tabular" style={{ color: 'var(--text-primary)' }}>
              {a.value}
            </span>
          </div>
        ))}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px dashed var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Total
          </span>
          <span className="text-base font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
            ₹5,70,000
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
          Open Bank Book <ChevronRight size={12} />
        </button>
      </div>
    </Card>
  );
}
