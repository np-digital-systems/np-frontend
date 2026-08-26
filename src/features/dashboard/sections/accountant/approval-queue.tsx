import Link from 'next/link';

import { Card, CardHeader, LinkButton, StatusBadge } from '../../components';
import { getApprovalSummary, getQueueSplit } from '../../lib/dashboard-service';
import { formatCurrency } from '../../lib/dashboard-data';

import { cn } from '@/lib/utils';

export async function ApprovalQueue() {
  const [{ queue: APPROVAL_QUEUE_ITEMS }, APPROVAL_QUEUE] = await Promise.all([
    getApprovalSummary(),
    getQueueSplit(),
  ]);

  const total = APPROVAL_QUEUE.receipts + APPROVAL_QUEUE.payments;

  const counts = [
    { label: 'Receipts', count: APPROVAL_QUEUE.receipts, tone: 'text-success' },
    { label: 'Payments', count: APPROVAL_QUEUE.payments, tone: 'text-danger' },
    { label: 'Total', count: total, tone: 'text-text-primary' },
  ];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Pending Approvals"
        action={<LinkButton href="/accounting/approvals">Open center</LinkButton>}
      />

      <dl className="flex items-center border-b border-border px-5 py-4">
        {counts.map((item) => (
          <div key={item.label} className="flex-1 text-center">
            <dd
              className={`text-2xl font-semibold tracking-[-0.02em] tabular ${item.tone}`}
            >
              {item.count}
            </dd>
            <dt className="mt-0.5 text-xs text-text-muted">{item.label}</dt>
          </div>
        ))}
      </dl>

      <ul className="flex-1 divide-y divide-border">
        {APPROVAL_QUEUE_ITEMS.map((item) => (
          <li key={item.ref}>
            <Link
              href={`/accounting/approvals/${item.ref}`}
              className={cn(
                'flex items-center justify-between gap-3 px-5 py-3',
                'transition-colors hover:bg-interactive-hover',
                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
              )}
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-primary ref">{item.ref}</p>
                <p className="mt-0.5 text-xs text-text-muted">{item.type}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-[13px] font-medium text-text-primary tabular">
                  {formatCurrency(item.amount)}
                </span>
                <StatusBadge status="Pending Approval" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
