'use client';

import { useMemo, useState } from 'react';
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
import type { PortalUser } from '@/features/auth/types/user';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import {
  MemberFormDialog,
  type MemberDraft,
} from '../../components/member-form-dialog';
import {
  RecordPaymentDialog,
  type PaymentDraft,
} from '../../components/record-payment-dialog';
import type { ContributionAccess } from '../../lib/contributions-access';
import { REGISTER_READ_ONLY_MESSAGE } from '../../lib/contributions-access';
import {
  PAYMENT_MODE_LABELS,
  YEARLY_SUBSCRIPTION,
  formatCurrency,
  formatShortDate,
} from '../../lib/contributions-data';
import { summarise } from '../../lib/contributions-service';
import type { MemberRecord } from '../../types';

type StatusFilter = 'all' | 'paid' | 'unpaid';

interface SanththaScreenProps {
  initialMembers: readonly MemberRecord[];
  years: readonly number[];
  year: number;
  access: ContributionAccess;
  user: PortalUser;
}

/**
 * The sanththa register.
 *
 * One flat subscription per member per year, so the only question this
 * screen answers is who has paid it and who has not.
 *
 * TODO: replace the local mutations with calls to the sanththa API.
 */
export function SanththaScreen({
  initialMembers,
  years,
  year,
  access,
  user,
}: SanththaScreenProps) {
  const router = useRouter();

  const [members, setMembers] =
    useState<readonly MemberRecord[]>(initialMembers);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MemberRecord | null>(null);
  const [paying, setPaying] = useState<MemberRecord | null>(null);

  const summary = useMemo(() => summarise(members), [members]);

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

  const nextMemberNo = useMemo(() => {
    const highest = members.reduce((max, member) => {
      const n = Number(member.memberNo.replace(/\D/g, ''));
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);

    return `S-${String(highest + 1).padStart(3, '0')}`;
  }, [members]);

  function handleMemberSubmit(draft: MemberDraft) {
    setMembers((current) => {
      if (editing) {
        return current.map((member) =>
          member.id === editing.id ? { ...member, ...draft } : member,
        );
      }

      const nextId =
        current.reduce((max, member) => Math.max(max, member.id), 0) + 1;

      return [
        ...current,
        {
          ...draft,
          id: nextId,
          joinedOn: new Date().toISOString().slice(0, 10),
          notes: draft.notes || null,
          hasPaid: false,
          payment: null,
        },
      ];
    });
  }

  function handlePayment(draft: PaymentDraft) {
    if (!paying) return;

    setMembers((current) =>
      current.map((member) =>
        member.id === paying.id
          ? {
              ...member,
              hasPaid: true,
              payment: {
                id: Date.now(),
                memberId: member.id,
                year,
                amount: draft.amount,
                paidOn: draft.paidOn,
                receiptRef: draft.receiptRef || null,
                mode: draft.mode,
                collectedBy: user.name,
              },
            }
          : member,
      ),
    );

    setPaying(null);
  }

  const columns: DataColumn[] = [
    { key: 'no', label: 'Member No' },
    { key: 'name', label: 'Member' },
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
        description={`Yearly temple membership — ${formatCurrency(YEARLY_SUBSCRIPTION)} per member, paid once a year.`}
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
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              Add Member
            </Button>
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
            placeholder="Search member no, name or phone…"
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
            <SelectItem value="all">All members</SelectItem>
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
                className={cn(!member.isActive && 'opacity-60')}
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
                  ) : member.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-subtle px-2 py-0.5 text-[11px] font-medium text-warning">
                      <span
                        className="size-1.5 rounded-full bg-current"
                        aria-hidden
                      />
                      Not paid
                    </span>
                  ) : (
                    <span className="text-[11px] text-text-disabled">
                      Inactive
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
                    {access.canRecord && !member.hasPaid && member.isActive && (
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
          open={formOpen}
          onOpenChange={setFormOpen}
          member={editing}
          nextMemberNo={nextMemberNo}
          onSubmit={handleMemberSubmit}
        />
      )}

      {access.canRecord && (
        <RecordPaymentDialog
          open={paying !== null}
          onOpenChange={(open) => !open && setPaying(null)}
          member={paying}
          year={year}
          onSubmit={handlePayment}
        />
      )}
    </>
  );
}
