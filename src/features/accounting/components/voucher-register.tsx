'use client';

import { useMemo, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';

import { useRouter } from '@/i18n/routing';
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
import {
  approveVoucher,
  cancelVoucher,
  createVoucher,
  postVoucher,
  rejectVoucher,
  submitVoucher,
  updateVoucher,
} from '../lib/accounting-actions';
import type {
  AccountRef,
  BankAccountRef,
  FundRef,
  ActivityRef,
  PartyRef,
  PoojaRef,
  PoojaTypeRef,
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
  activities: readonly ActivityRef[];
  parties: readonly PartyRef[];
  poojaTypes: readonly PoojaTypeRef[];
  poojas: readonly PoojaRef[];
  access: AccountingAccess;
  user: PortalUser;
  year: number;
}

export function VoucherRegister({
  kind,
  title,
  description,
  initialVouchers,
  accounts,
  funds,
  projects,
  bankAccounts,
  activities,
  parties,
  poojaTypes,
  poojas,
  access,
  user,
  year,
}: VoucherRegisterProps) {
  const vouchers = initialVouchers;
  const [filters, setFilters] = useState<VoucherFilterState>(
    EMPTY_VOUCHER_FILTERS,
  );

  const params = useSearchParams();

  // Dashboard shortcuts and approval links land here with intent in the URL.
  const [formOpen, setFormOpen] = useState(() => params.get('new') === '1');
  const [editing, setEditing] = useState<VoucherRecord | null>(null);
  const [viewing, setViewing] = useState<VoucherRecord | null>(() => {
    const ref = params.get('ref');
    return ref
      ? initialVouchers.find((entry) => entry.ref === ref) ?? null
      : null;
  });
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

  const router = useRouter();
  const [, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  /**
   * Every mutation goes to the API and the page is then refetched.
   *
   * Nothing is patched into local state on the way past: a voucher's reference
   * and its whole lifecycle are the server's to decide, and a screen that
   * guessed either would eventually disagree with the books.
   */
  function run(write: () => Promise<{ ok: boolean; message?: string }>) {
    startTransition(async () => {
      const result = await write();

      if (!result.ok) {
        setActionError(result.message ?? 'That change was refused.');
        return;
      }

      setActionError(null);
      router.refresh();
    });
  }

  function handleSave(draft: VoucherDraft, thenSubmit: boolean) {
    const input = {
      kind,
      date: draft.date,
      description: draft.description,
      lines: draft.lines.map((line) => ({
        accountId: line.accountId,
        amount: line.amount,
        fundId: line.fundId,
        projectId: line.projectId,
        activityId: line.activityId,
      })),
      mode: draft.mode,
      bankAccountId: draft.bankAccountId,
      chequeNo: draft.chequeNo || null,
      partyId: draft.partyId,
      party: draft.party,
      manualVoucherNo: draft.manualVoucherNo || null,
      notes: draft.notes || null,
    };

    const target = editing;

    run(() =>
      target ? updateVoucher(target.id, input, thenSubmit) : createVoucher(input, thenSubmit),
    );

    setEditing(null);
    setFormOpen(false);
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

      {actionError && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-subtle px-4 py-3 text-sm text-danger"
        >
          {actionError}
        </p>
      )}

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

                    {voucher.manualVoucherNo && (
                      <span className="mt-0.5 block text-[11px] text-text-muted ref">
                        Book #{voucher.manualVoucherNo}
                      </span>
                    )}

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

                  {/*
                    * A register is a list, so it shows the first head and says
                    * how many more there are rather than growing rows of
                    * uneven height. The detail dialog has all of them.
                    */}
                  <DataCell nowrap className="text-xs">
                    <span className="ref text-text-muted">
                      {voucher.lines[0]?.account.code}
                    </span>{' '}
                    <span className="text-text-secondary">
                      {voucher.lines[0]?.account.name}
                    </span>
                    {voucher.lines.length > 1 && (
                      <span className="ml-1.5 text-[11px] text-text-muted">
                        +{voucher.lines.length - 1} more
                      </span>
                    )}
                  </DataCell>

                  <DataCell>
                    <p className="truncate text-xs text-text-secondary">
                      {voucher.lines[0]?.fund.name}
                    </p>
                    {voucher.lines[0]?.project && (
                      <p className="mt-0.5 truncate text-[11px] text-text-muted">
                        {voucher.lines[0].project.name}
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
                      onSubmit={() => run(() => submitVoucher(voucher.id))}
                      onApprove={() => run(() => approveVoucher(voucher.id))}
                      onReject={() => setRejecting(voucher)}
                      onPost={() => run(() => postVoucher(voucher.id))}
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
          activities={activities}
          parties={parties}
          poojaTypes={poojaTypes}
          poojas={poojas}
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
          if (rejecting) run(() => rejectVoucher(rejecting.id, reason));
          setRejecting(null);
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={
          deleting?.status === 'Pending Approval'
            ? 'Withdraw this entry?'
            : 'Cancel this draft?'
        }
        description={
          deleting
            ? `${deleting.ref} — ${formatCurrency(deleting.amount)} to ${deleting.party}. ${
                deleting.status === 'Pending Approval'
                  ? 'It is withdrawn from the approver and cancelled.'
                  : 'It is cancelled rather than erased.'
              } The reference stays in the register for the audit trail and counts towards no total.`
            : ''
        }
        onConfirm={() => {
          if (deleting) run(() => cancelVoucher(deleting.id));
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
                {voucher.status === 'Pending Approval'
                  ? 'Withdraw and cancel'
                  : 'Cancel draft'}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
