import React from 'react';
import { Card, CardHeader } from '../components';

export function BankPosition() {
  const accounts = [
    { name: "People's Bank", balance: '₹4,50,000' },
    { name: 'Bank of Ceylon', balance: '₹1,20,000' },
  ];

  return (
    <Card>
      <CardHeader title="Bank Position" />
      <div className="p-5 space-y-3">
        {accounts.map((a) => (
          <div key={a.name} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {a.name}
            </span>
            <span className="text-sm font-medium tabular" style={{ color: 'var(--text-primary)' }}>
              {a.balance}
            </span>
          </div>
        ))}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px dashed var(--border)' }}
        >
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Total Bank Balance
          </span>
          <span className="text-base font-semibold tabular" style={{ color: 'var(--text-primary)' }}>
            ₹5,70,000
          </span>
        </div>
      </div>
    </Card>
  );
}
