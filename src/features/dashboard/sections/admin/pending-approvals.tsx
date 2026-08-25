import Link from 'next/link';
import { Eye, Inbox } from 'lucide-react';

import {
  Card,
  CardFooter,
  CardHeader,
  DetailGrid,
  EmptyState,
  LinkButton,
  StatusBadge,
} from '../../components';
import {
  PENDING_APPROVALS,
  TOTAL_PENDING_APPROVALS,
} from '../../constants/mock-data';
import { formatCurrency } from '../../lib/dashboard-data';

import { cn } from '@/lib/utils';

export function PendingApprovals() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Pending Approvals"
        action={<LinkButton href="/accounting/approvals">View all</LinkButton>}
      />

      {PENDING_APPROVALS.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing awaiting approval"
          description="Submitted vouchers will queue up here for review."
        />
      ) : (
        <ul className="flex-1 divide-y divide-border">
          {PENDING_APPROVALS.map((item) => (
            <li key={item.ref} className="px-5 py-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary ref">{item.ref}</p>
                  <p className="mt-0.5 text-[13px] font-medium text-text-primary">
                    {item.type}
                  </p>
                </div>

                <p className="shrink-0 text-[13px] font-semibold text-text-primary tabular">
                  {formatCurrency(item.amount)}
                </p>
              </div>

              <DetailGrid
                items={[
                  { label: 'Payee', value: item.payee },
                  { label: 'Fund', value: item.fund },
                  { label: 'Project', value: item.project },
                  { label: 'Created by', value: item.createdBy },
                ]}
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <StatusBadge status="Pending Approval" />

                <Link
                  href={`/accounting/approvals/${item.ref}`}
                  className={cn(
                    'inline-flex h-7 items-center gap-1.5 rounded-lg',
                    'border border-border bg-surface-2 px-2.5',
                    'text-xs font-medium text-text-primary',
                    'transition-colors hover:bg-interactive-hover',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  )}
                >
                  <Eye className="size-3.5" aria-hidden />
                  Review
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CardFooter>
        <span className="text-xs text-text-muted tabular">
          {TOTAL_PENDING_APPROVALS} pending approvals total
        </span>
        <LinkButton href="/accounting/approvals">View all</LinkButton>
      </CardFooter>
    </Card>
  );
}
