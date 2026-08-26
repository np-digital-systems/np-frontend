import Link from 'next/link';

import { Card, CardHeader, LinkButton } from '../../components';
import { getFundOverview } from '../../lib/dashboard-service';
import { formatCurrency } from '../../lib/dashboard-data';

import { cn } from '@/lib/utils';

export async function FundOverview() {
  const FUNDS = await getFundOverview();

  return (
    <Card>
      <CardHeader
        title="Fund Overview"
        action={<LinkButton href="/finance/funds">View all</LinkButton>}
      />

      <ul className="divide-y divide-border">
        {FUNDS.map((fund) => (
          <li key={fund.name}>
            <Link
              href={`/finance/funds?fund=${encodeURIComponent(fund.name)}`}
              className={cn(
                'flex items-center justify-between gap-4 px-5 py-4',
                'transition-colors hover:bg-interactive-hover',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-text-primary">
                  {fund.name}
                </p>

                <dl className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  <div>
                    <dt className="text-[11px] text-text-muted">Income</dt>
                    <dd className="mt-0.5 text-xs font-semibold text-success tabular">
                      {formatCurrency(fund.income)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] text-text-muted">Expenses</dt>
                    <dd className="mt-0.5 text-xs font-semibold text-danger tabular">
                      {formatCurrency(fund.expenses)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] text-text-muted">Balance</dt>
                    <dd className="mt-0.5 text-xs font-semibold text-text-primary tabular">
                      {formatCurrency(fund.balance)}
                    </dd>
                  </div>
                </dl>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
