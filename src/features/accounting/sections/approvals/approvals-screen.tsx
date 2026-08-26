'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  approveVoucher,
  postVoucher,
  rejectVoucher,
} from '../../lib/accounting-actions';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Inbox } from 'lucide-react';

import {
  ActionError,
  Card,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  DetailGrid,
  EmptyState,
  PortalPageHeader,
  StatCard,
  StatusBadge,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PortalUser } from '@/features/auth/types/user';

import { Amount } from '../../components/amount';
import { RejectDialog } from '../../components/reject-dialog';
import { VoucherDetailDialog } from '../../components/voucher-detail-dialog';
import {
  SELF_APPROVAL_MESSAGE,
  canApproveVoucher,
  canPostVoucher,
  type AccountingAccess,
} from '../../lib/accounting-access';
import {
  PAYMENT_MODE_LABELS,
  VOUCHER_KIND_LABELS,
  formatCurrency,
  formatShortDate,
} from '../../lib/accounting-data';
import type { VoucherRecord } from '../../types';

interface ApprovalsScreenProps {
  initialVouchers: readonly VoucherRecord[];
  access: AccountingAccess;
  user: PortalUser;
  year: number;
}

export function ApprovalsScreen({
  initialVouchers,
  access,
  user,
  year,
}: ApprovalsScreenProps) {
  const vouchers = initialVouchers;
  const params = useSearchParams();

  const [viewing, setViewing] = useState<VoucherRecord | null>(() => {
    const ref = params.get('ref');
    return ref
      ? initialVouchers.find((entry) => entry.ref === ref) ?? null
      : null;
  });
  const [rejecting, setRejecting] = useState<VoucherRecord | null>(null);

  const queues = useMemo(
    () => ({
      pending: vouchers.filter(
        (voucher) => voucher.status === 'Pending Approval',
      ),
      approved: vouchers.filter((voucher) => voucher.status === 'Approved'),
      decided: vouchers.filter(
        (voucher) =>
          voucher.status === 'Rejected' || voucher.status === 'Posted',
      ),
    }),
    [vouchers],
  );

  const pendingTotal = queues.pending.reduce(
    (sum, voucher) => sum + voucher.amount,
    0,
  );

  const blockedByOwnEntry = queues.pending.filter(
    (voucher) => voucher.createdBy.id === user.id,
  ).length;

  const { run, error: actionError } = useServerAction();

  return (
    <>
      <PortalPageHeader
        title="Approval Center"
        description="Every voucher waiting on a decision, from both registers."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="pending" className="tabular">
            {queues.pending.length} pending
          </span>,
          queues.approved.length > 0 ? (
            <span key="unposted" className="text-warning tabular">
              {queues.approved.length} approved, not posted
            </span>
          ) : null,
        ].filter(Boolean)}
      />

      <ActionError message={actionError} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Awaiting Decision"
          value={String(queues.pending.length)}
          caption={formatCurrency(pendingTotal)}
        />
        <StatCard
          label="Approved, Unposted"
          value={String(queues.approved.length)}
          caption="Not yet in the ledger"
        />
        <StatCard
          label="Your Own Entries"
          value={String(blockedByOwnEntry)}
          caption="Need another approver"
        />
        <StatCard
          label="Settled"
          value={String(queues.decided.length)}
          caption="Posted or rejected"
        />
      </div>

      {blockedByOwnEntry > 0 && (
        <div className="rounded-lg border border-border bg-warning-subtle px-3.5 py-2.5">
          <p className="text-xs text-warning">{SELF_APPROVAL_MESSAGE}</p>
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({queues.pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({queues.approved.length})
          </TabsTrigger>
          <TabsTrigger value="settled">
            Settled ({queues.decided.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {queues.pending.length === 0 ? (
            <Card>
              <EmptyState
                icon={Inbox}
                title="Nothing awaiting approval"
                description="Submitted vouchers queue up here for review."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {queues.pending.map((voucher) => (
                <ApprovalCard
                  key={voucher.id}
                  voucher={voucher}
                  access={access}
                  user={user}
                  onView={() => setViewing(voucher)}
                  onApprove={() =>
                    run(() => approveVoucher(voucher.id))
                  }
                  onReject={() => setRejecting(voucher)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          <SettledTable
            vouchers={queues.approved}
            emptyTitle="Nothing approved and waiting"
            emptyDescription="Approved vouchers sit here until they are posted to the ledger."
            onView={setViewing}
            action={
              access.canPost
                ? (voucher) =>
                    canPostVoucher(voucher, access) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => run(() => postVoucher(voucher.id))}
                      >
                        Post to ledger
                      </Button>
                    ) : null
                : undefined
            }
          />
        </TabsContent>

        <TabsContent value="settled">
          <SettledTable
            vouchers={queues.decided}
            emptyTitle="Nothing settled yet"
            emptyDescription="Posted and rejected entries are kept here for the audit trail."
            onView={setViewing}
          />
        </TabsContent>
      </Tabs>

      <VoucherDetailDialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
        voucher={viewing}
      />

      <RejectDialog
        open={rejecting !== null}
        onOpenChange={(open) => !open && setRejecting(null)}
        reference={rejecting?.ref ?? null}
        onConfirm={(reason) => {
          if (rejecting) run(() => rejectVoucher(rejecting.id, reason));
          setRejecting(null);
        }}
      />
    </>
  );
}

interface ApprovalCardProps {
  voucher: VoucherRecord;
  access: AccountingAccess;
  user: PortalUser;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
}

function ApprovalCard({
  voucher,
  access,
  user,
  onView,
  onApprove,
  onReject,
}: ApprovalCardProps) {
  const mayDecide = canApproveVoucher(voucher, access, user);
  const isOwn = voucher.createdBy.id === user.id;

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="min-w-0">
          <p className="ref text-xs font-medium text-primary">{voucher.ref}</p>
          <p className="mt-0.5 text-[13px] font-medium text-text-primary">
            {VOUCHER_KIND_LABELS[voucher.kind]}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[15px] font-semibold text-text-primary tabular">
            {formatCurrency(voucher.amount)}
          </p>
          <p className="mt-0.5 text-[11px] text-text-muted tabular">
            {formatShortDate(voucher.date)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-[13px] text-text-primary">{voucher.description}</p>

        <DetailGrid
          items={[
            {
              label: voucher.kind === 'receipt' ? 'From' : 'To',
              value: voucher.party,
            },
            { label: 'Account', value: voucher.account.name },
            { label: 'Fund', value: voucher.fund.name },
            { label: 'Project', value: voucher.project?.name ?? '—' },
            { label: 'Mode', value: PAYMENT_MODE_LABELS[voucher.mode] },
            { label: 'Raised by', value: voucher.createdBy.name },
          ]}
        />

        {voucher.notes && (
          <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs leading-relaxed text-text-secondary">
            {voucher.notes}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <StatusBadge status={voucher.status} />

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={onView}>
              Details
            </Button>

            {mayDecide ? (
              <>
                <Button variant="destructive" size="sm" onClick={onReject}>
                  Reject
                </Button>
                <Button size="sm" onClick={onApprove}>
                  <CheckCircle2 />
                  Approve
                </Button>
              </>
            ) : (
              isOwn && (
                <span className="text-[11px] text-text-muted">
                  Your own entry
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface SettledTableProps {
  vouchers: readonly VoucherRecord[];
  emptyTitle: string;
  emptyDescription: string;
  onView: (voucher: VoucherRecord) => void;
  action?: (voucher: VoucherRecord) => React.ReactNode;
}

function SettledTable({
  vouchers,
  emptyTitle,
  emptyDescription,
  onView,
  action,
}: SettledTableProps) {
  const columns: DataColumn[] = [
    { key: 'ref', label: 'Reference' },
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'party', label: 'Party' },
    { key: 'fund', label: 'Fund' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', align: 'right', srOnly: true },
  ];

  return (
    <Card>
      <DataTable columns={columns} minWidth={900}>
        {vouchers.length === 0 ? (
          <DataTableEmpty colSpan={columns.length}>
            <EmptyState
              icon={Inbox}
              title={emptyTitle}
              description={emptyDescription}
            />
          </DataTableEmpty>
        ) : (
          vouchers.map((voucher) => (
            <DataRow key={voucher.id}>
              <DataCell nowrap>
                <button
                  type="button"
                  onClick={() => onView(voucher)}
                  className="ref text-xs font-medium text-primary transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {voucher.ref}
                </button>
              </DataCell>

              <DataCell nowrap className="text-xs text-text-muted tabular">
                {formatShortDate(voucher.date)}
              </DataCell>

              <DataCell nowrap className="text-xs">
                {VOUCHER_KIND_LABELS[voucher.kind]}
              </DataCell>

              <DataCell>
                <p className="truncate text-[13px] text-text-primary">
                  {voucher.party}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-muted">
                  {voucher.description}
                </p>
              </DataCell>

              <DataCell nowrap className="text-xs">
                {voucher.fund.name}
              </DataCell>

              <DataCell align="right" nowrap>
                <Amount
                  value={voucher.amount}
                  tone={voucher.kind === 'receipt' ? 'in' : 'out'}
                />
              </DataCell>

              <DataCell nowrap>
                <StatusBadge status={voucher.status} />
              </DataCell>

              <DataCell align="right" nowrap>
                {action?.(voucher)}
              </DataCell>
            </DataRow>
          ))
        )}
      </DataTable>
    </Card>
  );
}
