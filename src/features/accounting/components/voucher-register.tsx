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
  formatCurrency,
  formatShortDate,
  headsFor,
  kindTone,
  modeLabel,
  partyLabel,
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
  type VoucherInput,
} from '../lib/accounting-actions';
import type {
  AccountRef,
  BankAccountRef,
  FundRef,
  ActivityRef,
  MoneyAccount,
  PartyRef,
  PoojaRef,
  ProjectRef,
  VoucherKind,
  VoucherRecord,
} from '../types';

import { Amount } from './amount';
import { ContraFormDialog } from './contra-form-dialog';
import { JournalFormDialog } from './journal-form-dialog';
import { RejectDialog } from './reject-dialog';
import { VoucherDetailDialog } from './voucher-detail-dialog';
import {
  EMPTY_VOUCHER_FILTERS,
  VoucherFilters,
  applyVoucherFilters,
  type VoucherFilterState,
} from './voucher-filters';
import { VoucherFormDialog, type VoucherDraft } from './voucher-form-dialog';

const NOUNS: Record<VoucherKind, string> = {
  receipt: 'Receipt',
  payment: 'Payment',
  contra: 'Contra',
  journal: 'Journal',
};

const TOTAL_LABELS: Record<VoucherKind, string> = {
  receipt: 'Total Received',
  payment: 'Total Paid',
  contra: 'Total Moved',
  journal: 'Total Journalled',
};

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
  poojas: readonly PoojaRef[];
  /** Cash and each bank account; contra only. */
  moneyAccounts?: readonly MoneyAccount[];
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
  poojas,
  moneyAccounts = [],
  access,
  user,
  year,
}: VoucherRegisterProps) {
  const vouchers = initialVouchers;
  const [filters, setFilters] = useState<VoucherFilterState>(
    EMPTY_VOUCHER_FILTERS,
  );

  const params = useSearchParams();

  // Dashboard and approval links pass their intent in the URL.
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

  function save(input: Omit<VoucherInput, 'kind'>, thenSubmit: boolean) {
    const target = editing;

    run(() =>
      target
        ? updateVoucher(target.id, { ...input, kind }, thenSubmit)
        : createVoucher({ ...input, kind }, thenSubmit),
    );

    setEditing(null);
    setFormOpen(false);
  }

  function handleSave(draft: VoucherDraft, thenSubmit: boolean) {
    const input = {
      date: draft.date,
      description: draft.description,
      lines: draft.lines.map((line) => ({
        accountId: line.accountId,
        amount: line.amount,
        fundId: line.fundId,
        projectId: line.projectId,
        activityId: line.activityId,
        eventId: line.eventId,
        fixedDepositId: line.fixedDepositId,
        side: null,
      })),
      mode: draft.mode,
      bankAccountId: draft.bankAccountId,
      chequeNo: draft.chequeNo || null,
      partyId: draft.partyId,
      party: draft.party,
      manualVoucherNo: draft.manualVoucherNo || null,
      notes: draft.notes || null,
    };

    save(input, thenSubmit);
  }

  const columns: DataColumn[] = [
    { key: 'ref', label: 'Reference' },
    { key: 'date', label: 'Date' },
    { key: 'party', label: partyLabel(kind) },
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
                New {NOUNS[kind]}
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
          label={TOTAL_LABELS[kind]}
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
                    ? `No ${NOUNS[kind].toLowerCase()} vouchers yet`
                    : 'No entries match these filters'
                }
                description={
                  vouchers.length === 0
                    ? undefined
                    : 'Try a different search or clear the filters.'
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
                    {modeLabel(voucher.mode)}
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
                          : kindTone(kind)
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

      {canCreate && kind === 'contra' && (
        <ContraFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          voucher={editing}
          accounts={moneyAccounts}
          funds={funds}
          onSubmit={(input) => save(input, false)}
          onSubmitForApproval={
            access.canSubmit ? (input) => save(input, true) : undefined
          }
        />
      )}

      {canCreate && kind === 'journal' && (
        <JournalFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          voucher={editing}
          accounts={accounts.filter((account) => account.moneyHead === null)}
          funds={funds}
          parties={parties}
          onSubmit={(input) => save(input, false)}
          onSubmitForApproval={
            access.canSubmit ? (input) => save(input, true) : undefined
          }
        />
      )}

      {canCreate && (kind === 'receipt' || kind === 'payment') && (
        <VoucherFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          kind={kind}
          voucher={editing}
          accounts={headsFor(kind, accounts)}
          funds={funds}
          projects={projects}
          bankAccounts={bankAccounts}
          activities={activities}
          parties={parties}
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
        access={access}
        user={user}
        onApprove={(voucher) => run(() => approveVoucher(voucher.id))}
        onReject={(voucher) => setRejecting(voucher)}
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
                  ? 'It will be withdrawn and cancelled.'
                  : 'It will be cancelled.'
              } The reference is kept but excluded from totals.`
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
