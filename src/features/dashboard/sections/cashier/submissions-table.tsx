import { Card, CardHeader, LinkButton, StatusBadge } from '../../components';
import { getMySubmissions } from '../../lib/dashboard-service';
import { formatCurrency } from '../../lib/dashboard-data';

export async function SubmissionsTable() {
  const CASHIER_SUBMISSIONS = await getMySubmissions();

  return (
    <Card>
      <CardHeader
        title="My Recent Submissions"
        action={<LinkButton href="/accounting/transactions">View all</LinkButton>}
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              {['Reference', 'Type', 'Amount', 'Date', 'Status'].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className={`px-4 py-2.5 text-[11px] font-medium text-text-muted ${
                    heading === 'Amount' ? 'text-right' : ''
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {CASHIER_SUBMISSIONS.map((row) => (
              <tr key={row.ref} className="transition-colors hover:bg-interactive-hover">
                <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-primary ref">
                  {row.ref}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      row.type === 'Receipt'
                        ? 'bg-success-subtle text-success'
                        : 'bg-danger-subtle text-danger'
                    }`}
                  >
                    {row.type}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-[13px] font-medium text-text-primary tabular">
                  {formatCurrency(row.amount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-text-muted tabular">
                  {row.date}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
