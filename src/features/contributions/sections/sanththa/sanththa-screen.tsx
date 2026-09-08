'use client';

import { useMemo, useState, useTransition } from 'react';
import { Plus, Search, Users, X } from 'lucide-react';

import {
  Card,
  DataCell,
  DataRow,
  DataTable,
  DataTableEmpty,
  EmptyState,
  PortalPageHeader,
  ReadOnlyNotice,
  StatCard,
  type DataColumn,
} from '@/components/portal/ui';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, useRouter } from '@/i18n/routing';

import { CONTRIBUTION_ROUTES } from '../../lib/routes';
import { cn } from '@/lib/utils';

import {
  MemberFormDialog,
  type MemberDraft,
} from '../../components/member-form-dialog';
import { RecordPaymentDialog } from '../../components/record-payment-dialog';
import { SetRateDialog } from '../../components/set-rate-dialog';
import type { ContributionAccess } from '../../lib/contributions-access';
import { REGISTER_READ_ONLY_MESSAGE } from '../../lib/contributions-access';
import {
  PAYMENT_MODE_LABELS,
  formatCurrency,
  formatShortDate,
} from '../../lib/contributions-data';
import { summarise } from '../../lib/contributions-data';
import { enrolMember, updateMember } from '../../lib/contributions-actions';
import type { MemberRecord, SanththaPosting } from '../../types';

type StatusFilter = 'all' | 'paid' | 'unpaid';

interface SanththaScreenProps {
  initialMembers: readonly MemberRecord[];
  years: readonly number[];
  year: number;
  /** The fixed amount set for this year, or null if none has been set. */
  rate: number | null;
  /** Where a subscription will be receipted, as the server resolves it. */
  posting: SanththaPosting;
  access: ContributionAccess;
}

/**
 * The sanththa register.
 *
 * One flat subscription per sponsor per year, at the rate set for that year,
 * so the only question this screen answers is who has paid and who has not.
 */
export function SanththaScreen({
  initialMembers,
  years,
  year,
  rate,
  posting,
  access,
}: SanththaScreenProps) {
  const router = useRouter();

  const [members, setMembers] =
    useState<readonly MemberRecord[]>(initialMembers);

  /*
   * Recording a subscription happens on the server, so the register comes back
   * as a new `initialMembers`. Adopting it during render keeps the table in
   * step with the ledger; the price is that unsaved local member edits — which
   * are placeholders anyway — are dropped when that happens.
   */
  const [lastServerMembers, setLastServerMembers] = useState(initialMembers);

  if (lastServerMembers !== initialMembers) {
    setLastServerMembers(initialMembers);
    setMembers(initialMembers);
  }

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [editing, setEditing] = useState<MemberRecord | null>(null);
  const [paying, setPaying] = useState<MemberRecord | null>(null);
  const [, startTransition] = useTransition();

  const summary = useMemo(() => summarise(members, rate), [members, rate]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return members.filter((member) => {
      if (status === 'paid' && !member.hasPaid) return false;
      if (status === 'unpaid' && member.hasPaid) return false;

      if (!needle) return true;

      return `${member.memberNo} ${member.fullName} ${member.nameTa} ${member.phone}`
        .toLowerCase()
        .includes(needle);
    });
  }, [members, query, status]);

  const [memberError, setMemberError] = useState<string | null>(null);

  /**
   * Enrolling writes through the API and then refreshes.
   *
   * The member number comes back from the database rather than being guessed
   * from the highest one on this page — two cashiers enrolling at the same
   * moment would otherwise both read the same highest number.
   */
  function handleMemberSubmit(draft: MemberDraft) {
    startTransition(async () => {
      const result = editing
        ? await updateMember(editing.id, draft)
        : await enrolMember(draft);

      if (!result.ok) {
        setMemberError(result.message);
        return;
      }

      setMemberError(null);
      setEditing(null);
      setFormOpen(false);
      router.refresh();
    });
  }

  /**
   * The payment and its receipt voucher are already written by the time this
   * runs, so there is nothing to patch in — the refresh pulls the register back
   * from the same source the accounts read.
   */
  function handleRecorded() {
    setPaying(null);
    router.refresh();
  }

  const columns: DataColumn[] = [
    { key: 'no', label: 'Sponsor No' },
    { key: 'name', label: 'Sponsor' },
    ...(access.canSeeContact
      ? [{ key: 'phone', label: 'Phone' } as const]
      : []),
    { key: 'status', label: `${year} Subscription` },
    { key: 'paidOn', label: 'Paid On' },
    { key: 'receipt', label: 'Receipt' },
    { key: 'actions', label: 'Actions', align: 'right', srOnly: true },
  ];

  const isFiltered = query.trim() !== '' || status !== 'all';

  return (
    <>
      <PortalPageHeader
        title="Sanththa"
        description={
          rate === null
            ? `No sanththa has been set for ${year} yet.`
            : `Yearly temple membership — ${formatCurrency(rate)} per sponsor, paid once a year.`
        }
        meta={[
          <span key="year" className="tabular">
            {year}
          </span>,
          <span key="paid" className="tabular">
            {summary.paid} of {summary.members} paid
          </span>,
          summary.unpaid > 0 ? (
            <span key="unpaid" className="text-warning tabular">
              {summary.unpaid} outstanding
            </span>
          ) : null,
        ].filter(Boolean)}
        actions={
          access.canManage && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setRateOpen(true)}>
                {rate === null ? `Set ${year} sanththa` : `Sanththa ${formatCurrency(rate)}`}
              </Button>

              {/*
                * Enrolling lives on the register, not here. This screen asks
                * one question — who has paid this year — and having a second
                * way to create a sponsor only invited the same person to be
                * entered twice.
                */}
              <Button asChild variant="secondary">
                <Link href={CONTRIBUTION_ROUTES.sponsors}>
                  <Plus />
                  Sponsor register
                </Link>
              </Button>
            </div>
          )
        }
      />

      {!access.canManage && (
        <ReadOnlyNotice message={REGISTER_READ_ONLY_MESSAGE} />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Members"
          value={String(summary.members)}
          caption="On the register"
        />
        <StatCard
          label="Paid"
          value={String(summary.paid)}
          caption={`For ${year}`}
        />
        <StatCard
          label="Outstanding"
          value={String(summary.unpaid)}
          caption={formatCurrency(summary.outstanding)}
        />
        <StatCard
          label="Collected"
          value={formatCurrency(summary.collected)}
          caption={`Subscription year ${year}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>

          <InputGroupInput
            type="search"
            value={query}
            placeholder="Search sponsor no, name or phone…"
            aria-label="Search members"
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
        >
          <SelectTrigger aria-label="Filter by subscription status">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All sponsors</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Not paid</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={String(year)}
          onValueChange={(value) =>
            router.push(`/contributions/sanththa?year=${value}`)
          }
        >
          <SelectTrigger aria-label="Subscription year">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {years.map((entry) => (
              <SelectItem key={entry} value={String(entry)}>
                {entry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setStatus('all');
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <Card>
        <DataTable columns={columns} minWidth={860}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={Users}
                title={
                  members.length === 0
                    ? 'No members yet'
                    : 'No members match these filters'
                }
                description={
                  members.length === 0
                    ? 'Add the families and trusts that subscribe to the temple.'
                    : 'Adjust the search or filters above.'
                }
              />
            </DataTableEmpty>
          ) : (
            filtered.map((member) => (
              <DataRow
                key={member.id}
                className={cn(!member.subscribes && 'opacity-60')}
              >
                <DataCell nowrap className="ref text-xs text-text-muted">
                  {member.memberNo}
                </DataCell>

                <DataCell>
                  <p className="truncate text-[13px] font-medium text-text-primary">
                    {member.fullName}
                  </p>
                  {member.nameTa && (
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {member.nameTa}
                    </p>
                  )}
                </DataCell>

                {access.canSeeContact && (
                  <DataCell nowrap className="text-xs tabular">
                    {member.phone || '—'}
                  </DataCell>
                )}

                <DataCell nowrap>
                  {member.hasPaid ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2 py-0.5 text-[11px] font-medium text-success">
                      <span
                        className="size-1.5 rounded-full bg-current"
                        aria-hidden
                      />
                      Paid {formatCurrency(member.payment?.amount ?? 0)}
                    </span>
                  ) : member.subscribes ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-subtle px-2 py-0.5 text-[11px] font-medium text-warning">
                      <span
                        className="size-1.5 rounded-full bg-current"
                        aria-hidden
                      />
                      Not paid
                    </span>
                  ) : (
                    <span className="text-[11px] text-text-disabled">
                      Exempt
                    </span>
                  )}
                </DataCell>

                <DataCell nowrap className="text-xs tabular">
                  {member.payment ? formatShortDate(member.payment.paidOn) : '—'}
                </DataCell>

                <DataCell nowrap className="text-xs">
                  {member.payment?.receiptRef ? (
                    <span className="ref text-text-secondary">
                      {member.payment.receiptRef}
                    </span>
                  ) : member.payment ? (
                    <span className="text-text-muted">
                      {PAYMENT_MODE_LABELS[member.payment.mode]}
                    </span>
                  ) : (
                    <span className="text-text-disabled">—</span>
                  )}
                </DataCell>

                <DataCell align="right" nowrap>
                  <div className="flex items-center justify-end gap-1.5">
                    {access.canRecord && !member.hasPaid && member.subscribes && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaying(member)}
                      >
                        Mark Paid
                      </Button>
                    )}

                    {access.canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(member);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </DataCell>
              </DataRow>
            ))
          )}
        </DataTable>
      </Card>

      {access.canManage && (
        <MemberFormDialog
          submitError={memberError}
          open={formOpen}
          onOpenChange={setFormOpen}
          member={editing}
          nextMemberNo=""
          onSubmit={handleMemberSubmit}
        />
      )}

      {access.canManage && (
        <SetRateDialog
          open={rateOpen}
          onOpenChange={setRateOpen}
          year={year}
          current={rate}
          subscribing={summary.subscribing}
          onSaved={() => router.refresh()}
        />
      )}

      {access.canRecord && (
        <RecordPaymentDialog
          open={paying !== null}
          onOpenChange={(open) => !open && setPaying(null)}
          member={paying}
          year={year}
          rate={rate}
          posting={posting}
          onRecorded={handleRecorded}
        />
      )}
    </>
  );
}
