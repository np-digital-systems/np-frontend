import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, LinkButton } from '../components';

export function AccountantFundSummary() {
  const funds = [
    { name: 'General Temple Fund', balance: '₹3,55,000', income: '₹8,20,000', expense: '₹4,65,000' },
    { name: 'Festival Fund', balance: '₹4,09,000', income: '₹10,75,000', expense: '₹6,66,000' },
    { name: 'Thiruppani Fund', balance: '₹2,57,000', income: '₹5,70,000', expense: '₹3,13,000' },
  ];

  return (
    <Card>
      <CardHeader
        title="Fund Summary"
        action={
          <LinkButton>
            View all funds <ChevronRight size={12} />
          </LinkButton>
        }
      />
      <div
        className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {funds.map((f) => (
          <div key={f.name} className="p-5">
            <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
              {f.name}
            </p>
            <p
              className="text-xl font-semibold tabular mb-3"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              {f.balance}
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Income</span>
                <span className="tabular font-medium" style={{ color: 'var(--success)' }}>
                  {f.income}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-muted)' }}>Expense</span>
                <span className="tabular font-medium" style={{ color: 'var(--danger)' }}>
                  {f.expense}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
