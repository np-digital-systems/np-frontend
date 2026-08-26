import { Card, CardHeader, LinkButton, StatusBadge } from '../../components';
import { getRecentTransactions } from '../../lib/dashboard-service';
import { formatCurrency } from '../../lib/dashboard-data';

export async function TransactionsTable() {
  const TRANSACTIONS = await getRecentTransactions();

  return (
    <Card>
      <CardHeader
        title="Recent Transactions"
        action={<LinkButton href="/accounting/transactions">View all</LinkButton>}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              {[
                'Date',
                'Reference',
                'Description',
                'Fund',
                'Project',
                'Debit',
                'Credit',
                'Status',
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className={`px-4 py-2.5 text-[11px] font-medium text-text-muted ${
                    heading === 'Debit' || heading === 'Credit' ? 'text-right' : ''
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {TRANSACTIONS.map((txn) => (
              <tr key={txn.ref} className="transition-colors hover:bg-interactive-hover">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-text-muted tabular">
                  {txn.date}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-primary ref">
                  {txn.ref}
                </td>
                <td className="px-4 py-3 text-[13px] text-text-primary">
                  {txn.description}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-text-secondary">
                  {txn.fund}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-text-secondary">
                  {txn.project}
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right text-[13px] tabular ${
                    txn.debit ? 'text-danger' : 'text-text-disabled'
                  }`}
                >
                  {txn.debit ? formatCurrency(txn.debit) : '—'}
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right text-[13px] tabular ${
                    txn.credit ? 'text-success' : 'text-text-disabled'
                  }`}
                >
                  {txn.credit ? formatCurrency(txn.credit) : '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={txn.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
