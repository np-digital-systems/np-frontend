'use client';

import { useMemo, useState } from 'react';
import { Download, MoreHorizontal, Plus, Receipt } from 'lucide-react';

import {
  Card,
  ConfirmDialog,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  PortalPageHeader,
  ReadOnlyNotice,
  StatCard,
  StatusBadge,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PortalUser } from '@/features/auth/types/user';

import {
  PAYMENT_MODE_LABELS,
  formatCurrency,
  formatShortDate,
  nextReference,
} from '../lib/accounting-data';
import {
  READ_ONLY_MESSAGE,
  canApproveVoucher,
  canCreateKind,
  canDeleteVoucher,
  canEditVoucher,
  canPostVoucher,
  canSubmitVoucher,
  type AccountingAccess,
} from '../lib/accounting-access';
import { applyAction } from '../lib/voucher-workflow';
import type {
  AccountRef,
  BankAccountRef,
  FundRef,
  ProjectRef,
  VoucherKind,
  VoucherRecord,
} from '../types';

import { Amount } from './amount';
import { RejectDialog } from './reject-dialog';
import { VoucherDetailDialog } from './voucher-detail-dialog';
import {
  EMPTY_VOUCHER_FILTERS,
  VoucherFilters,
  applyVoucherFilters,
  type VoucherFilterState,
} from './voucher-filters';
import { VoucherFormDialog, type VoucherDraft } from './voucher-form-dialog';

interface VoucherRegisterProps {
  kind: VoucherKind;
  title: string;
  description: string;
  initialVouchers: readonly VoucherRecord[];
  accounts: readonly AccountRef[];
  funds: readonly FundRef[];
  projects: readonly ProjectRef[];
  bankAccounts: readonly BankAccountRef[];
  access: AccountingAccess;
  user: PortalUser;
  year: number;
}

/** TODO: replace the local mutations with calls to the vouchers API. */
export function VoucherRegister({
  kind,
  title,
  description,
  initialVouchers,
  accounts,
  funds,
  projects,
  bankAccounts,
  access,
  user,
  year,
}: VoucherRegisterProps) {
  const [vouchers, setVouchers] =
    useState<readonly VoucherRecord[]>(initialVouchers);
  const [filters, setFilters] = useState<VoucherFilterState>(
    EMPTY_VOUCHER_FILTERS,
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VoucherRecord | null>(null);
  const [viewing, setViewing] = useState<VoucherRecord | null>(null);
  const [rejecting, setRejecting] = useState<VoucherRecord | null>(null);
  const [deleting, setDeleting] = useState<VoucherRecord | null>(null);

  const canCreate = canCreateKind(access, kind);

  const filtered = useMemo(
    () => applyVoucherFilters(vouchers, filters, user.id),
    [vouchers, filters, user.id],
  );

  const totals = useMemo(() => {
    const settled = vouchers.filter(
      (voucher) => voucher.status === 'Posted' || voucher.status === 'Approved',
    );

    return {
      settled: settled.reduce((sum, voucher) => sum + voucher.amount, 0),
      pending: vouchers.filter(
        (voucher) => voucher.status === 'Pending Approval',
      ),
      drafts: vouchers.filter((voucher) => voucher.status === 'Draft').length,
      filteredTotal: filtered
        .filter((voucher) => voucher.status !== 'Cancelled')
        .reduce((sum, voucher) => sum + voucher.amount, 0),
    };
  }, [vouchers, filtered]);

  function replace(updated: VoucherRecord) {
    setVouchers((current) =>
      current.map((voucher) => (voucher.id === updated.id ? updated : voucher)),
    );
  }

  function materialise(draft: VoucherDraft, base: VoucherRecord | null): VoucherRecord {
    const account = accounts.find((entry) => entry.id === draft.accountId)!;
    const fund = funds.find((entry) => entry.id === draft.fundId)!;

    return {
      id: base?.id ?? Date.now(),
      ref: base?.ref ?? nextReference(kind, year, vouchers),
      kind,
      date: draft.date,
      description: draft.description,
      amount: draft.amount,
      accountId: draft.accountId,
      fundId: draft.fundId,
      projectId: draft.projectId,
      mode: draft.mode,
      bankAccountId: draft.bankAccountId,
      chequeNo: draft.chequeNo || null,
      party: draft.party,
      eventRef: base?.eventRef ?? null,
      status: base?.status ?? 'Draft',
      notes: draft.notes || null,
      createdBy: base?.createdBy ?? { id: user.id, name: user.name },
      createdAt: base?.createdAt ?? new Date().toISOString(),
      submittedAt: base?.submittedAt ?? null,
      decidedBy: base?.decidedBy ?? null,
      decidedAt: base?.decidedAt ?? null,
      rejectionReason: base?.rejectionReason ?? null,
      postedAt: base?.postedAt ?? null,
      account,
      fund,
      project: projects.find((entry) => entry.id === draft.projectId) ?? null,
      bankAccount:
        bankAccounts.find((entry) => entry.id === draft.bankAccountId) ?? null,
    };
  }

  function handleSave(draft: VoucherDraft, thenSubmit: boolean) {
    const record = materialise(draft, editing);
    const finalRecord = thenSubmit
      ? applyAction(record, 'submit', user)
      : record;

    setVouchers((current) =>
      editing
        ? current.map((voucher) =>
            voucher.id === editing.id ? finalRecord : voucher,
          )
        : [finalRecord, ...current],
    );
  }

  const columns: DataColumn[] = [
    { key: 'ref', label: 'Reference' },
    { key: 'date', label: 'Date' },
    { key: 'party', label: kind === 'receipt' ? 'Received From' : 'Paid To' },
    { key: 'account', label: 'Account' },
    { key: 'fund', label: 'Fund / Project' },
    { key: 'mode', label: 'Mode' },
    { key: 'amount', label: 'Amount', align: 'right' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions', align: 'right', srOnly: true },
  ];

  return (
    <>
      <PortalPageHeader
        title={title}
        description={description}
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="count" className="tabular">
            {vouchers.length} entries
          </span>,
          totals.pending.length > 0 ? (
            <span key="pending" className="text-warning tabular">
              {totals.pending.length} awaiting approval
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          <>
            {access.canExportTransactions && (
              <Button variant="outline">
                <Download />
                Export
              </Button>
            )}

            {canCreate && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus />
                New {kind === 'receipt' ? 'Receipt' : 'Payment'}
              </Button>
            )}
          </>
        }
      />

      {!canCreate && <ReadOnlyNotice message={READ_ONLY_MESSAGE} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={kind === 'receipt' ? 'Total Received' : 'Total Paid'}
          value={formatCurrency(totals.settled)}
          caption="Approved and posted"
        />
        <StatCard
          label="Awaiting Approval"
          value={String(totals.pending.length)}
          caption={formatCurrency(
            totals.pending.reduce((sum, voucher) => sum + voucher.amount, 0),
          )}
        />
        <StatCard
          label="Drafts"
          value={String(totals.drafts)}
          caption="Not yet submitted"
        />
        <StatCard
          label="Entries"
          value={String(vouchers.length)}
          caption={`Financial year ${year}`}
        />
      </div>

      <VoucherFilters
        filters={filters}
        onChange={setFilters}
        funds={funds}
        showMineToggle={canCreate}
      />

      <Card>
        <DataTable columns={columns} minWidth={1100}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={Receipt}
                title={
                  vouchers.length === 0
                    ? `No ${kind === 'receipt' ? 'receipts' : 'payments'} yet`
                    : 'No entries match these filters'
                }
                description={
                  vouchers.length === 0
                    ? 'Entries appear here as soon as they are drafted.'
                    : 'Adjust the search or filters above to see more.'
                }
              />
            </DataTableEmpty>
          ) : (
            <>
              {filtered.map((voucher) => (
                <DataRow key={voucher.id}>
                  <DataCell nowrap>
                    <button
                      type="button"
                      onClick={() => setViewing(voucher)}
                      className="ref text-xs font-medium text-primary transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {voucher.ref}
                    </button>

                    {voucher.createdBy.id === user.id && (
                      <span className="ml-2 rounded bg-neutral-subtle px-1 py-0.5 text-[10px] text-text-muted">
                        Mine
                      </span>
                    )}
                  </DataCell>

                  <DataCell nowrap className="text-xs text-text-muted tabular">
                    {formatShortDate(voucher.date)}
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
                    <span className="ref text-text-muted">
                      {voucher.account.code}
                    </span>{' '}
                    <span className="text-text-secondary">
                      {voucher.account.name}
                    </span>
                  </DataCell>

                  <DataCell>
                    <p className="truncate text-xs text-text-secondary">
                      {voucher.fund.name}
                    </p>
                    {voucher.project && (
                      <p className="mt-0.5 truncate text-[11px] text-text-muted">
                        {voucher.project.name}
                      </p>
                    )}
                  </DataCell>

                  <DataCell nowrap className="text-xs text-text-secondary">
                    {PAYMENT_MODE_LABELS[voucher.mode]}
                    {voucher.chequeNo && (
                      <span className="ml-1 text-text-muted ref">
                        #{voucher.chequeNo}
                      </span>
                    )}
                  </DataCell>

                  <DataCell align="right" nowrap>
                    <Amount
                      value={voucher.amount}
                      tone={
                        voucher.status === 'Cancelled'
                          ? 'muted'
                          : kind === 'receipt'
                            ? 'in'
                            : 'out'
                      }
                      className={
                        voucher.status === 'Cancelled' ? 'line-through' : undefined
                      }
                    />
                  </DataCell>

                  <DataCell nowrap>
                    <StatusBadge status={voucher.status} />
                  </DataCell>

                  <DataCell align="right" nowrap>
                    <RowActions
                      voucher={voucher}
                      access={access}
                      user={user}
                      onView={() => setViewing(voucher)}
                      onEdit={() => {
                        setEditing(voucher);
                        setFormOpen(true);
                      }}
                      onSubmit={() =>
                        replace(applyAction(voucher, 'submit', user))
                      }
                      onApprove={() =>
                        replace(applyAction(voucher, 'approve', user))
                      }
                      onReject={() => setRejecting(voucher)}
                      onPost={() => replace(applyAction(voucher, 'post', user))}
                      onDelete={() => setDeleting(voucher)}
                    />
                  </DataCell>
                </DataRow>
              ))}

              <tr className="border-t border-border-strong bg-surface-2">
                <td
                  colSpan={6}
                  className="px-4 py-2.5 text-[11px] font-medium text-text-muted"
                >
                  {filtered.length} of {vouchers.length} entries · cancelled
                  entries excluded from the total
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-text-primary tabular">
                  {formatCurrency(totals.filteredTotal)}
                </td>
                <td colSpan={2} />
              </tr>
            </>
          )}
        </DataTable>
      </Card>

      {canCreate && (
        <VoucherFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          kind={kind}
          voucher={editing}
          accounts={accounts}
          funds={funds}
          projects={projects}
          bankAccounts={bankAccounts}
          onSubmit={(draft) => handleSave(draft, false)}
          onSubmitForApproval={
            access.canSubmit ? (draft) => handleSave(draft, true) : undefined
          }
        />
      )}

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
          if (rejecting) replace(applyAction(rejecting, 'reject', user, reason));
          setRejecting(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this draft?"
        description={
          deleting
            ? `${deleting.ref} — ${formatCurrency(deleting.amount)} to ${deleting.party}. Only drafts can be deleted; anything submitted has to be cancelled instead.`
            : ''
        }
        onConfirm={() => {
          if (deleting) {
            setVouchers((current) =>
              current.filter((voucher) => voucher.id !== deleting.id),
            );
          }
          setDeleting(null);
        }}
      />
    </>
  );
}

interface RowActionsProps {
  voucher: VoucherRecord;
  access: AccountingAccess;
  user: PortalUser;
  onView: () => void;
  onEdit: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onPost: () => void;
  onDelete: () => void;
}

function RowActions({
  voucher,
  access,
  user,
  onView,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  onPost,
  onDelete,
}: RowActionsProps) {
  const mayEdit = canEditVoucher(voucher, access, user);
  const maySubmit = canSubmitVoucher(voucher, access, user);
  const mayApprove = canApproveVoucher(voucher, access, user);
  const mayPost = canPostVoucher(voucher, access);
  const mayDelete = canDeleteVoucher(voucher, access, user);

    const blockedBySelfApproval =
    access.canApprove &&
    voucher.status === 'Pending Approval' &&
    voucher.createdBy.id === user.id;

  return (
    <div className="flex items-center justify-end gap-1.5">
      {mayApprove && (
        <Button variant="outline" size="sm" onClick={onApprove}>
          Approve
        </Button>
      )}

      {maySubmit && !mayApprove && (
        <Button variant="outline" size="sm" onClick={onSubmit}>
          Submit
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`More actions for ${voucher.ref}`}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={onView}>View details</DropdownMenuItem>

          {mayEdit && (
            <DropdownMenuItem onSelect={onEdit}>Edit entry</DropdownMenuItem>
          )}

          {maySubmit && (
            <DropdownMenuItem onSelect={onSubmit}>
              Submit for approval
            </DropdownMenuItem>
          )}

          {mayApprove && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onApprove}>Approve</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={onReject}>
                Reject
              </DropdownMenuItem>
            </>
          )}

          {blockedBySelfApproval && (
            <DropdownMenuItem disabled>
              You cannot approve your own entry
            </DropdownMenuItem>
          )}

          {mayPost && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onPost}>
                Post to ledger
              </DropdownMenuItem>
            </>
          )}

          {mayDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onDelete}>
                Delete draft
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
