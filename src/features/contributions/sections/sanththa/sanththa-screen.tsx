'use client';

import { useMemo, useState } from 'react';
import { HandCoins, MoreHorizontal, Plus, Search, Users, X } from 'lucide-react';

import {
  Card,
  CardBody,
  CardHeader,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';

import {
  MemberFormDialog,
  type MemberDraft,
} from '../../components/member-form-dialog';
import {
  RecordPaymentDialog,
  type PaymentDraft,
} from '../../components/record-payment-dialog';
import {
  REGISTER_READ_ONLY_MESSAGE,
  type ContributionAccess,
} from '../../lib/contributions-access';
import {
  FREQUENCY_LABELS,
  MEMBER_STATUSES,
  MEMBER_STATUS_LABELS,
  formatCurrency,
  formatShortDate,
  periodsDueSoFar,
} from '../../lib/contributions-data';
import type {
  CollectionPoint,
  MemberRecord,
  MemberStatus,
  SanththaSummary,
} from '../../types';

type PaidFilter = 'all' | 'paid' | 'arrears';

interface SanththaScreenProps {
  initialMembers: readonly MemberRecord[];
  summary: SanththaSummary;
  trend: readonly CollectionPoint[];
  access: ContributionAccess;
  today: string;
  year: number;
}

/** TODO: replace the local mutations with calls to the contributions API. */
export function SanththaScreen({
  initialMembers,
  summary,
  trend,
  access,
  today,
  year,
}: SanththaScreenProps) {
  const [members, setMembers] =
    useState<readonly MemberRecord[]>(initialMembers);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<MemberStatus | 'all'>('all');
  const [paid, setPaid] = useState<PaidFilter>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MemberRecord | null>(null);
  const [collecting, setCollecting] = useState<MemberRecord | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return members.filter((member) => {
      if (status !== 'all' && member.status !== status) return false;
      if (paid === 'paid' && !member.isFullyPaid) return false;
      if (paid === 'arrears' && !member.isInArrears) return false;
      if (!needle) return true;

      return `${member.memberNo} ${member.fullName} ${member.nameTa} ${member.phone} ${member.address}`
        .toLowerCase()
        .includes(needle);
    });
  }, [members, query, status, paid]);

    const live = useMemo(() => {
    const expected = members.reduce(
      (sum, member) => sum + member.dueForYear,
      0,
    );
    const collected = members.reduce(
      (sum, member) => sum + member.paidForYear,
      0,
    );

    return {
      expected,
      collected,
      outstanding: members.reduce(
        (sum, member) => sum + member.outstanding,
        0,
      ),
      inArrears: members.filter((member) => member.isInArrears).length,
      active: members.filter((member) => member.status === 'active').length,
      rate: expected === 0 ? 0 : collected / expected,
    };
  }, [members]);

  const nextMemberNo = useMemo(() => {
    const highest = members.reduce((max, member) => {
      const digits = Number(member.memberNo.replace(/\D/g, ''));
      return Number.isNaN(digits) ? max : Math.max(max, digits);
    }, 0);

    return `S-${String(highest + 1).padStart(3, '0')}`;
  }, [members]);

  const peak = Math.max(...trend.map((point) => point.amount), 1);

    function reshape(
    base: MemberRecord | null,
    patch: Partial<MemberRecord>,
  ): MemberRecord {
    const merged = { ...(base as MemberRecord), ...patch };

    const periodsExpected = periodsDueSoFar(
      merged.frequency,
      today,
      year,
      merged.joinedOn,
    );

    const accruing = merged.status !== 'inactive';
    const dueForYear = accruing
      ? merged.subscriptionAmount * periodsExpected
      : 0;
    const paidForYear = merged.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    const outstanding = Math.max(dueForYear - paidForYear, 0);

    return {
      ...merged,
      dueForYear,
      paidForYear,
      outstanding,
      periodsExpected,
      periodsPaid: merged.payments.length,
      lastPaidOn:
        merged.payments.length > 0
          ? merged.payments[merged.payments.length - 1].paidOn
          : null,
      isFullyPaid: accruing && outstanding === 0 && periodsExpected > 0,
      isInArrears: merged.status === 'active' && outstanding > 0,
    };
  }

  function handleMemberSubmit(draft: MemberDraft) {
    setMembers((current) => {
      if (editing) {
        return current.map((member) =>
          member.id === editing.id
            ? reshape(member, { ...draft, notes: draft.notes || null })
            : member,
        );
      }

      const nextId =
        current.reduce((highest, member) => Math.max(highest, member.id), 0) +
        1;

      return [
        ...current,
        reshape(null, {
          id: nextId,
          ...draft,
          notes: draft.notes || null,
          payments: [],
        } as Partial<MemberRecord>),
      ].sort((a, b) => a.memberNo.localeCompare(b.memberNo));
    });
  }

  function handlePayment(draft: PaymentDraft) {
    if (!collecting) return;

    setMembers((current) =>
      current.map((member) => {
        if (member.id !== collecting.id) return member;

        return reshape(member, {
          payments: [
            ...member.payments,
            {
              id: Date.now(),
              memberId: member.id,
              period: draft.period,
              amount: draft.amount,
              paidOn: draft.paidOn,
              receiptRef: null,
              mode: draft.mode,
              collectedBy: 'You',
            },
          ].sort((a, b) => (a.period < b.period ? -1 : 1)),
        });
      }),
    );

    setCollecting(null);
  }

    function unpaidPeriodsFor(member: MemberRecord): readonly string[] {
    const paidPeriods = new Set(
      member.payments.map((payment) => payment.period),
    );

    if (member.frequency === 'annual') {
      return paidPeriods.has(String(year)) ? [] : [String(year)];
    }

    return Array.from(
      { length: 12 },
      (_, index) => `${year}-${String(index + 1).padStart(2, '0')}`,
    ).filter((period) => !paidPeriods.has(period));
  }

  const columns: DataColumn[] = [
    { key: 'member', label: 'Member' },
    ...(access.canSeeContact
      ? [{ key: 'contact', label: 'Contact' } as const]
      : []),
    { key: 'pledge', label: 'Pledge', align: 'right' },
    { key: 'progress', label: 'Periods Paid' },
    { key: 'due', label: 'Due to Date', align: 'right' },
    { key: 'paid', label: 'Paid', align: 'right' },
    { key: 'outstanding', label: 'Outstanding', align: 'right' },
    { key: 'status', label: 'Status' },
    ...(access.canRecord || access.canManage
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  const isFiltered = query.trim() !== '' || status !== 'all' || paid !== 'all';

  return (
    <>
      <PortalPageHeader
        title="Sanththa"
        description="The members’ subscription register — who has pledged what, and who is behind."
        meta={[
          <span key="year" className="tabular">
            Collection year {year}
          </span>,
          <span key="members" className="tabular">
            {live.active} active members
          </span>,
          live.inArrears > 0 ? (
            <span key="arrears" className="text-warning tabular">
              {live.inArrears} in arrears
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
          label="Collected"
          value={formatCurrency(live.collected)}
          caption={`${Math.round(live.rate * 100)}% of dues to date`}
        />
        <StatCard
          label="Due to Date"
          value={formatCurrency(live.expected)}
          caption={`${summary.members} on the register`}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(live.outstanding)}
          caption={`${live.inArrears} members behind`}
        />
        <StatCard
          label="Fully Paid"
          value={String(members.filter((member) => member.isFullyPaid).length)}
          caption="Square for the year so far"
        />
      </div>

      {trend.length > 0 && (
        <Card>
          <CardHeader
            title="Collections this year"
            description="What came in each month"
          />

          <CardBody>
            <div className="flex items-end gap-2" role="img" aria-label="Monthly collections">
              {trend.map((point) => (
                <div
                  key={point.label}
                  className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
                >
                  <span className="text-[11px] text-text-muted tabular">
                    {point.amount > 0
                      ? `${Math.round(point.amount / 1000)}k`
                      : '—'}
                  </span>

                  <div
                    className="w-full rounded-t bg-primary/80"
                    style={{
                      height: `${Math.max((point.amount / peak) * 96, 2)}px`,
                    }}
                  />

                  <span className="text-[11px] text-text-muted">
                    {point.label}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-64">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>

          <InputGroupInput
            type="search"
            value={query}
            placeholder="Search member number, name or phone…"
            aria-label="Search members"
            onChange={(changeEvent) => setQuery(changeEvent.target.value)}
          />
        </InputGroup>

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as MemberStatus | 'all')}
        >
          <SelectTrigger aria-label="Filter by member status">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All members</SelectItem>

            {MEMBER_STATUSES.map((entry) => (
              <SelectItem key={entry} value={entry}>
                {MEMBER_STATUS_LABELS[entry]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={paid}
          onValueChange={(value) => setPaid(value as PaidFilter)}
        >
          <SelectTrigger aria-label="Filter by payment standing">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Any standing</SelectItem>
            <SelectItem value="arrears">In arrears</SelectItem>
            <SelectItem value="paid">Fully paid</SelectItem>
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setStatus('all');
              setPaid('all');
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <Card>
        <DataTable columns={columns} minWidth={access.canSeeContact ? 1220 : 1040}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={Users}
                title={
                  members.length === 0
                    ? 'No members on the register'
                    : 'No members match these filters'
                }
                description={
                  members.length === 0
                    ? 'Add the families and trusts who subscribe to the temple.'
                    : 'Adjust the search or filters above.'
                }
              />
            </DataTableEmpty>
          ) : (
            <>
              {filtered.map((member) => (
                <DataRow
                  key={member.id}
                  className={cn(member.status === 'inactive' && 'opacity-60')}
                >
                  <DataCell>
                    <div className="flex items-baseline gap-2">
                      <span className="ref shrink-0 text-xs text-text-muted">
                        {member.memberNo}
                      </span>
                      <p className="truncate text-[13px] font-medium text-text-primary">
                        {member.fullName}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {member.nameTa}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-muted tabular">
                      Since {formatShortDate(member.joinedOn)}
                    </p>
                  </DataCell>

                  {access.canSeeContact && (
                    <DataCell>
                      <p className="truncate text-xs text-text-secondary tabular">
                        {member.phone || '—'}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-text-muted">
                        {member.address}
                      </p>
                    </DataCell>
                  )}

                  <DataCell align="right" nowrap>
                    <span className="text-[13px] text-text-primary tabular">
                      {formatCurrency(member.subscriptionAmount)}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-text-muted">
                      {FREQUENCY_LABELS[member.frequency]}
                    </span>
                  </DataCell>

                  <DataCell className="w-32">
                    <PeriodDots
                      paid={member.periodsPaid}
                      expected={member.periodsExpected}
                      total={member.frequency === 'monthly' ? 12 : 1}
                    />
                    <p className="mt-1.5 text-[11px] text-text-muted tabular">
                      {member.periodsPaid} of {member.periodsExpected} due
                    </p>
                  </DataCell>

                  <DataCell
                    align="right"
                    nowrap
                    className="text-[13px] text-text-secondary tabular"
                  >
                    {formatCurrency(member.dueForYear)}
                  </DataCell>

                  <DataCell
                    align="right"
                    nowrap
                    className="text-[13px] text-success tabular"
                  >
                    {formatCurrency(member.paidForYear)}
                  </DataCell>

                  <DataCell align="right" nowrap>
                    {member.outstanding > 0 ? (
                      <span className="text-[13px] font-semibold text-danger tabular">
                        {formatCurrency(member.outstanding)}
                      </span>
                    ) : (
                      <span className="text-[13px] text-text-disabled">—</span>
                    )}
                  </DataCell>

                  <DataCell nowrap>
                    <MemberStandingBadge member={member} />
                  </DataCell>

                  {(access.canRecord || access.canManage) && (
                    <DataCell align="right" nowrap>
                      <div className="flex items-center justify-end gap-1.5">
                        {access.canRecord && member.status !== 'inactive' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCollecting(member)}
                          >
                            <HandCoins />
                            Collect
                          </Button>
                        )}

                        {access.canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${member.memberNo}`}
                              >
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onSelect={() => {
                                  setEditing(member);
                                  setFormOpen(true);
                                }}
                              >
                                Edit member
                              </DropdownMenuItem>

                              {member.status === 'active' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setMembers((current) =>
                                        current.map((entry) =>
                                          entry.id === member.id
                                            ? reshape(entry, {
                                                status: 'lapsed',
                                              })
                                            : entry,
                                        ),
                                      )
                                    }
                                  >
                                    Mark as lapsed
                                  </DropdownMenuItem>
                                </>
                              )}

                              {member.status !== 'active' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      setMembers((current) =>
                                        current.map((entry) =>
                                          entry.id === member.id
                                            ? reshape(entry, {
                                                status: 'active',
                                              })
                                            : entry,
                                        ),
                                      )
                                    }
                                  >
                                    Reinstate member
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </DataCell>
                  )}
                </DataRow>
              ))}

              <tr className="border-t border-border-strong bg-surface-2">
                <td
                  colSpan={access.canSeeContact ? 4 : 3}
                  className="px-4 py-2.5 text-[11px] font-medium text-text-muted"
                >
                  {filtered.length} of {members.length} members shown
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-text-primary tabular">
                  {formatCurrency(
                    filtered.reduce((sum, member) => sum + member.dueForYear, 0),
                  )}
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-success tabular">
                  {formatCurrency(
                    filtered.reduce(
                      (sum, member) => sum + member.paidForYear,
                      0,
                    ),
                  )}
                </td>
                <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-danger tabular">
                  {formatCurrency(
                    filtered.reduce(
                      (sum, member) => sum + member.outstanding,
                      0,
                    ),
                  )}
                </td>
                <td colSpan={access.canRecord || access.canManage ? 2 : 1} />
              </tr>
            </>
          )}
        </DataTable>
      </Card>

      {access.canManage && (
        <MemberFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          member={editing}
          existing={members}
          nextMemberNo={nextMemberNo}
          today={today}
          onSubmit={handleMemberSubmit}
        />
      )}

      {access.canRecord && (
        <RecordPaymentDialog
          open={collecting !== null}
          onOpenChange={(open) => !open && setCollecting(null)}
          member={collecting}
          unpaidPeriods={collecting ? unpaidPeriodsFor(collecting) : []}
          today={today}
          onSubmit={handlePayment}
        />
      )}
    </>
  );
}

function PeriodDots({
  paid,
  expected,
  total,
}: {
  paid: number;
  expected: number;
  total: number;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: total }, (_, index) => {
        const isPaid = index < paid;
        const isDue = index < expected;

        return (
          <span
            key={index}
            className={cn(
              'size-2 rounded-full',
              isPaid
                ? 'bg-success'
                : isDue
                  ? 'bg-danger/60'
                  : 'border border-border bg-transparent',
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

function MemberStandingBadge({ member }: { member: MemberRecord }) {
  if (member.status === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-subtle px-1.5 py-0.5 text-[11px] font-medium text-text-muted">
        Inactive
      </span>
    );
  }

  if (member.status === 'lapsed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-warning-subtle px-1.5 py-0.5 text-[11px] font-medium text-warning">
        Lapsed
      </span>
    );
  }

  if (member.isInArrears) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-danger-subtle px-1.5 py-0.5 text-[11px] font-medium text-danger">
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
        In arrears
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-success-subtle px-1.5 py-0.5 text-[11px] font-medium text-success">
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      Paid up
    </span>
  );
}
