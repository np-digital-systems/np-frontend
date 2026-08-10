import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, LinkButton } from '../components';

export function FundOverview() {
  const funds = [
    { name: 'General Temple Fund', income: '₹8,20,000', expenses: '₹4,65,000', balance: '₹3,55,000' },
    { name: 'Festival Fund', income: '₹10,75,000', expenses: '₹6,66,000', balance: '₹4,09,000' },
    { name: 'Thiruppani Fund', income: '₹5,70,000', expenses: '₹3,13,000', balance: '₹2,57,000' },
  ];

  return (
    <Card>
      <CardHeader
        title="Fund Overview"
        action={
          <LinkButton>
            View all <ChevronRight size={12} />
          </LinkButton>
        }
      />
      <div>
        {funds.map((f, i) => (
          <div
            key={f.name}
            className="px-5 py-4 flex items-center justify-between gap-4 transition-colors"
            style={{
              borderBottom: i < funds.length - 1 ? '1px solid var(--border)' : 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex-1">
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {f.name}
              </p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Income
                  </p>
                  <p className="text-xs font-semibold tabular mt-0.5" style={{ color: 'var(--success)' }}>
                    {f.income}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Expenses
                  </p>
                  <p className="text-xs font-semibold tabular mt-0.5" style={{ color: 'var(--danger)' }}>
                    {f.expenses}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Balance
                  </p>
                  <p
                    className="text-xs font-semibold tabular mt-0.5"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {f.balance}
                  </p>
                </div>
              </div>
            </div>
            <LinkButton>
              View <ChevronRight size={11} />
            </LinkButton>
          </div>
        ))}
      </div>
    </Card>
  );
}
