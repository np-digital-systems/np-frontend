import { Card, CardHeader, LinkButton } from '../../components';
import { getFundOverview } from '../../lib/dashboard-service';
import { formatCurrency } from '../../lib/dashboard-data';

export async function FundSummary() {
  const FUNDS = await getFundOverview();

  return (
    <Card>
      <CardHeader
        title="Fund Summary"
        action={<LinkButton href="/finance/funds">View all funds</LinkButton>}
      />

      <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
        {FUNDS.map((fund) => (
          <section key={fund.name} className="p-5">
            <h3 className="text-xs font-medium text-text-muted">{fund.name}</h3>

            <p className="mt-3 text-xl font-semibold tracking-[-0.02em] text-text-primary tabular">
              {formatCurrency(fund.balance)}
            </p>

            <dl className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <dt className="text-text-muted">Income</dt>
                <dd className="font-medium text-success tabular">
                  {formatCurrency(fund.income)}
                </dd>
              </div>
              <div className="flex justify-between text-xs">
                <dt className="text-text-muted">Expense</dt>
                <dd className="font-medium text-danger tabular">
                  {formatCurrency(fund.expenses)}
                </dd>
              </div>
            </dl>
          </section>
        ))}
      </div>
    </Card>
  );
}
