'use client';

import { useMemo, useState, useTransition } from 'react';
import { HeartHandshake, Plus, Search, X } from 'lucide-react';

import {
  ActionError,
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
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

import { SponsorFormDialog, type SponsorDraft } from '../../components/sponsor-form-dialog';
import type { ContributionAccess } from '../../lib/contributions-access';
import { REGISTER_READ_ONLY_MESSAGE } from '../../lib/contributions-access';
import { formatCurrency, formatShortDate } from '../../lib/contributions-data';
import { enrolSponsor, retireSponsor, updateSponsor } from '../../lib/sponsors-actions';
import type { SponsorRecord } from '../../types';

/**
 * The shared StatusBadge only knows voucher and event statuses, so the three
 * states this register cares about get their own pill rather than a new entry
 * in a vocabulary they do not belong to.
 */
function Pill({
  tone,
  children,
}: {
  tone: 'neutral' | 'success' | 'warning';
  children: React.ReactNode;
}) {
  const tones = {
    neutral: 'bg-neutral-subtle text-text-secondary',
    success: 'bg-success-subtle text-success',
    warning: 'bg-warning-subtle text-warning',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        tones[tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

type Filter = 'all' | 'subscribing' | 'exempt' | 'retired';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All sponsors' },
  { key: 'subscribing', label: 'Subscribing' },
  { key: 'exempt', label: 'Exempt' },
  { key: 'retired', label: 'Retired' },
];

interface SponsorsScreenProps {
  sponsors: readonly SponsorRecord[];
  year: number;
  access: ContributionAccess;
}

/**
 * The sponsor register.
 *
 * Distinct from the sanththa screen, which asks only who has paid this year.
 * This one is about the sponsor themselves: their details, how many
 * observances they stand over, and whether they still owe the subscription.
 */
export function SponsorsScreen({ sponsors, year, access }: SponsorsScreenProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SponsorRecord | null>(null);
  const [retiring, setRetiring] = useState<SponsorRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const summary = useMemo(() => {
    const active = sponsors.filter((sponsor) => sponsor.isActive);
    const subscribing = active.filter((sponsor) => sponsor.subscribes);

    return {
      total: active.length,
      subscribing: subscribing.length,
      sponsorships: active.reduce((sum, sponsor) => sum + sponsor.sponsorships, 0),
      collected: sponsors.reduce(
        (sum, sponsor) => sum + (sponsor.paidThisYear ? sponsor.totalPaid : 0),
        0,
      ),
    };
  }, [sponsors]);

  const isFiltered = query.trim() !== '' || filter !== 'all';

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return sponsors.filter((sponsor) => {
      if (filter === 'subscribing' && !(sponsor.isActive && sponsor.subscribes)) return false;
      if (filter === 'exempt' && !(sponsor.isActive && !sponsor.subscribes)) return false;
      if (filter === 'retired' && sponsor.isActive) return false;
      if (!needle) return true;

      return `${sponsor.sponsorNo} ${sponsor.name} ${sponsor.nameEn} ${sponsor.phone}`
        .toLowerCase()
        .includes(needle);
    });
  }, [sponsors, query, filter]);

  function handleSubmit(draft: SponsorDraft) {
    const target = editing;

    startTransition(async () => {
      const result = target
        ? await updateSponsor(target.partyId, draft)
        : await enrolSponsor(draft);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setError(null);
      setFormOpen(false);
      setEditing(null);
      router.refresh();
    });
  }

  const columns: DataColumn[] = [
    { key: 'no', label: 'No.' },
    { key: 'name', label: 'Sponsor' },
    ...(access.canSeeContact ? [{ key: 'phone', label: 'Phone' } as const] : []),
    { key: 'since', label: 'Since' },
    { key: 'sponsorships', label: 'Observances', align: 'right' as const },
    { key: 'sanththa', label: `Sanththa ${year}` },
    ...(access.canManage ? [{ key: 'actions', label: '', align: 'right' as const }] : []),
  ];

  return (
    <>
      <PortalPageHeader
        title="Sponsors"
        description="Everyone who sponsors an observance. A sponsor is a person in the directory, so editing them here renames them everywhere."
        meta={[
          <span key="count" className="tabular">
            {summary.total} active
          </span>,
          <span key="subs" className="tabular">
            {summary.subscribing} subscribing
          </span>,
        ]}
        actions={
          access.canManage ? (
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="size-4" />
              Enrol sponsor
            </Button>
          ) : null
        }
      />

      {!access.canManage && <ReadOnlyNotice message={REGISTER_READ_ONLY_MESSAGE} />}
      {error && <ActionError message={error} />}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active sponsors" value={String(summary.total)} />
        <StatCard label="Owe the sanththa" value={String(summary.subscribing)} />
        <StatCard label="Standing observances" value={String(summary.sponsorships)} />
        <StatCard label={`Collected ${year}`} value={formatCurrency(summary.collected)} />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <InputGroup className="sm:max-w-xs">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              placeholder="Search sponsors"
              onChange={(changeEvent) => setQuery(changeEvent.target.value)}
            />
          </InputGroup>

          <Select value={filter} onValueChange={(value) => setFilter(value as Filter)}>
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {FILTERS.map((option) => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              className="sm:ml-auto"
              onClick={() => {
                setQuery('');
                setFilter('all');
              }}
            >
              <X />
              Clear
            </Button>
          )}
        </div>

        <DataTable columns={columns} minWidth={900}>
          {filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={HeartHandshake}
                title="No sponsors match"
                description={
                  query || filter !== 'all'
                    ? 'Try a different search or filter.'
                    : 'Enrol the first sponsor to start the register.'
                }
              />
            </DataTableEmpty>
          ) : (
            filtered.map((sponsor) => (
              <DataRow key={sponsor.partyId}>
                <DataCell className="tabular font-medium">{sponsor.sponsorNo}</DataCell>
                <DataCell>
                  <span className="block font-medium text-text-primary">{sponsor.name}</span>
                  {sponsor.nameEn && (
                    <span className="block text-xs text-text-tertiary">{sponsor.nameEn}</span>
                  )}
                </DataCell>
                {access.canSeeContact && (
                  <DataCell className="tabular text-text-secondary">
                    {sponsor.phone || '—'}
                  </DataCell>
                )}
                <DataCell className="text-text-secondary">
                  {sponsor.sponsorSince ? formatShortDate(sponsor.sponsorSince) : '—'}
                </DataCell>
                <DataCell align="right" className="tabular">
                  {sponsor.sponsorships}
                </DataCell>
                <DataCell nowrap>
                  {!sponsor.isActive ? (
                    <span className="text-[11px] text-text-disabled">Retired</span>
                  ) : !sponsor.subscribes ? (
                    <Pill tone="neutral">Exempt</Pill>
                  ) : sponsor.paidThisYear ? (
                    <Pill tone="success">Paid</Pill>
                  ) : (
                    <Pill tone="warning">Due</Pill>
                  )}
                </DataCell>
                {access.canManage && (
                  <DataCell align="right" nowrap>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(sponsor);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      {sponsor.isActive && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger hover:bg-danger-subtle hover:text-danger"
                          onClick={() => setRetiring(sponsor)}
                        >
                          Retire
                        </Button>
                      )}
                    </div>
                  </DataCell>
                )}
              </DataRow>
            ))
          )}
        </DataTable>
      </Card>

      <ConfirmDialog
        open={retiring !== null}
        onOpenChange={(open) => !open && setRetiring(null)}
        title="Retire this sponsor?"
        description={
          retiring
            ? `${retiring.name} (${retiring.sponsorNo}) will no longer be offered when assigning observances or taking the sanththa. Their ${retiring.sponsorships} standing sponsorship(s) and every receipt already naming them are unchanged, and they can be reactivated from Edit.`
            : ''
        }
        confirmLabel="Retire"
        onConfirm={() => {
          const target = retiring;

          setRetiring(null);

          if (!target) return;

          startTransition(async () => {
            const result = await retireSponsor(target.partyId);

            if (!result.ok) {
              setError(result.message);
              return;
            }

            setError(null);
            router.refresh();
          });
        }}
      />

      {access.canManage && (
        <SponsorFormDialog
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditing(null);
          }}
          sponsor={editing}
          pending={pending}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
