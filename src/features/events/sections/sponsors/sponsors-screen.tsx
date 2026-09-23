'use client';

import { useServerAction } from '@/hooks/use-server-action';

import {
  addSponsor,
  registerSponsor,
  removeSponsor,
  updateSponsor,
} from '../../lib/sponsor-actions';

import { useMemo, useState } from 'react';
import { ChevronRight, Handshake, Search, UserRoundPlus, X } from 'lucide-react';

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

import { EventName } from '../../components/event-name';
import { FrequencyBadge } from '../../components/frequency-badge';
import {
  SponsorFormDialog,
  type SponsorDraft,
} from '../../components/sponsor-form-dialog';
import type { EventAccess } from '../../lib/event-access';
import { FREQUENCY_LABELS, FREQUENCY_TYPES } from '../../lib/event-data';
import type {
  EventType,
  FrequencyType,
  SponsorAssignment,
  SponsorParty,
} from '../../types';

interface SponsorsScreenProps {
  initialSponsors: readonly SponsorAssignment[];
  eventTypes: readonly EventType[];
  sponsors: readonly SponsorParty[];
  access: EventAccess;
    unsponsoredEvents: number;
  year: number;
}

export function SponsorsScreen({
  initialSponsors,
  eventTypes,
  sponsors,
  access,
  unsponsoredEvents,
  year,
}: SponsorsScreenProps) {
  const assignments = initialSponsors;

  /*
   * A general observance is funded by collection and takes no named sponsor,
   * so it is kept out of the picker entirely. The database refuses the
   * assignment either way; this is what stops anyone reaching that refusal.
   */
  const sponsorableTypes = useMemo(
    () => eventTypes.filter((type) => type.funding !== 'general'),
    [eventTypes],
  );

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<number | 'all'>('all');
  /*
   * Shut bands rather than open ones, so a pooja added later arrives open.
   * Tracking the open ones would hide every new type until somebody found it.
   */
  const [shut, setShut] = useState<ReadonlySet<number>>(() => new Set());
  const [frequency, setFrequency] = useState<FrequencyType | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SponsorAssignment | null>(null);
  const [pendingRemove, setPendingRemove] = useState<SponsorAssignment | null>(
    null,
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return assignments.filter((assignment) => {
      if (typeFilter !== 'all' && assignment.eventTypeId !== typeFilter) return false;

      if (frequency !== 'all' && assignment.eventType.frequencyType !== frequency) {
        return false;
      }

      if (!needle) return true;

      return `${assignment.eventType.name} ${assignment.eventType.nameEn} ${assignment.instanceLabel} ${assignment.sponsor.name}`
        .toLowerCase()
        .includes(needle);
    });
  }, [assignments, query, typeFilter, frequency]);

  /*
   * The sponsorships of one pooja, kept together.
   *
   * A flat list repeated the pooja's name on every row and left the reader to
   * spot where one ended and the next began — நாலாம் வாரம் under வெள்ளி
   * அபிஷேகம் reads as an instance; on its own it reads as nothing. The type is
   * said once, in the band, and the rows beneath it carry only what differs.
   */
  const groups = useMemo(() => {
    const byType = new Map<number, SponsorAssignment[]>();

    for (const assignment of filtered) {
      const existing = byType.get(assignment.eventTypeId);

      if (existing) existing.push(assignment);
      else byType.set(assignment.eventTypeId, [assignment]);
    }

    return [...byType.values()];
  }, [filtered]);

  const toggleBand = (eventTypeId: number) =>
    setShut((current) => {
      const next = new Set(current);

      if (next.has(eventTypeId)) next.delete(eventTypeId);
      else next.add(eventTypeId);

      return next;
    });

  const clearFilters = () => {
    setQuery('');
    setTypeFilter('all');
    setFrequency('all');
  };

  const filtering = query.trim() !== '' || typeFilter !== 'all' || frequency !== 'all';

  const distinctSponsors = new Set(
    assignments.map((assignment) => assignment.partyId),
  ).size;

  const { run, error: actionError } = useServerAction();

  function handleSubmit(draft: SponsorDraft) {
    const target = editing;

    const placement = {
      eventTypeId: draft.eventTypeId,
      instanceIdentifier: draft.instanceIdentifier,
    };

    run(
      () => {
        if (target) {
          return updateSponsor(target.id, {
            ...placement,
            partyId: draft.partyId ?? undefined,
          });
        }

        // A new party is created and placed in one go; one already on record
        // only needs the placement.
        return draft.newParty
          ? registerSponsor({ ...placement, ...draft.newParty })
          : addSponsor({ ...placement, partyId: draft.partyId! });
      },
      () => {
        setEditing(null);
        setFormOpen(false);
      },
    );
  }

  function handleRemove() {
    if (!pendingRemove) return;

    const target = pendingRemove;

    run(() => removeSponsor(target.id), () => setPendingRemove(null));
  }

  /*
   * No event type column and no frequency column: both are the same on every
   * row of a band, and a column that never changes within what the reader is
   * looking at is a column carrying no information.
   */
  const columns: DataColumn[] = [
    { key: 'instance', label: 'Instance' },
    { key: 'sponsor', label: 'Sponsor' },
    ...(access.canSeeSponsorContact
      ? [{ key: 'contact', label: 'Contact' } as const]
      : []),
    { key: 'occurrences', label: `${year} Events`, align: 'right' },
    ...(access.canManageSponsors
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  return (
    <>
      {/*
        * No meta line. The cards below already carry these counts, and a
        * heading that repeats them makes the reader check whether the two
        * agree instead of reading either.
        */}
      <PortalPageHeader
        title="Pooja Sponsorships"
        description="Which sponsor has taken which pooja."
        actions={
          access.canManageSponsors && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <UserRoundPlus />
              Register a sponsorship
            </Button>
          )
        }
      />

      <ActionError message={actionError} />

      {!access.canManageSponsors && (
        <ReadOnlyNotice message="You can see who sponsors each event type. Registering and changing sponsors is restricted to administrators." />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Sponsorships"
          value={String(assignments.length)}
          caption="Sponsors placed against a pooja"
        />
        <StatCard
          label="Active Sponsors"
          value={String(distinctSponsors)}
          caption="Devotees and trusts"
        />
        <StatCard
          label="Unsponsored Events"
          value={String(unsponsoredEvents)}
          caption={`Dated in ${year}, no sponsor`}
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
            placeholder="Search sponsors or poojas…"
            aria-label="Search registered sponsors"
            onChange={(changeEvent) => setQuery(changeEvent.target.value)}
          />
        </InputGroup>

        <Select
          value={typeFilter === 'all' ? 'all' : String(typeFilter)}
          onValueChange={(value) => setTypeFilter(value === 'all' ? 'all' : Number(value))}
        >
          <SelectTrigger aria-label="Filter by event type">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All poojas</SelectItem>

            {sponsorableTypes.map((type) => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={frequency}
          onValueChange={(value) => setFrequency(value as FrequencyType | 'all')}
        >
          <SelectTrigger aria-label="Filter by frequency">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All frequencies</SelectItem>

            {FREQUENCY_TYPES.map((option) => (
              <SelectItem key={option} value={option}>
                {FREQUENCY_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filtering && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X />
            Clear
          </Button>
        )}
      </div>

          <Card>
            <DataTable columns={columns} minWidth={access.canSeeSponsorContact ? 1000 : 840}>
              {filtered.length === 0 ? (
                <DataTableEmpty colSpan={columns.length}>
                  <EmptyState
                    icon={Handshake}
                    title={
                      assignments.length === 0
                        ? 'No sponsors registered yet'
                        : 'No sponsorships match these filters'
                    }
                    description={
                      assignments.length === 0
                        ? 'Register devotees against the poojas they sponsor.'
                        : 'Try a different name, or clear the filters.'
                    }
                  />
                </DataTableEmpty>
              ) : (
                groups.map((group) => (
                  <TypeBand
                    key={group[0].eventTypeId}
                    colSpan={columns.length}
                    assignments={group}
                    isOpen={!shut.has(group[0].eventTypeId)}
                    onToggle={() => toggleBand(group[0].eventTypeId)}
                  >
                    {group.map((assignment) => (
                  <DataRow key={assignment.id}>
                    <DataCell>
                      <span className="text-[13px] text-text-primary">
                        {assignment.instanceLabel}
                      </span>

                      {assignment.instanceIdentifier !== null && (
                        <span className="ml-2 text-[11px] text-text-muted tabular">
                          #{assignment.instanceIdentifier}
                        </span>
                      )}
                    </DataCell>

                    <DataCell>
                      <span className="text-[13px] text-text-primary">
                        {assignment.sponsor.name}
                      </span>
                    </DataCell>

                    {access.canSeeSponsorContact && (
                      <DataCell>
                        <span className="block text-xs text-text-secondary tabular">
                          {assignment.sponsor.phone}
                        </span>
                        <span className="block truncate text-xs text-text-muted">
                          {assignment.sponsor.email}
                        </span>
                      </DataCell>
                    )}

                    <DataCell align="right" nowrap className="tabular">
                      {assignment.occurrences > 0 ? (
                        assignment.occurrences
                      ) : (
                        <span className="text-text-disabled">—</span>
                      )}
                    </DataCell>

                    {access.canManageSponsors && (
                      <DataCell align="right" nowrap>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditing(assignment);
                              setFormOpen(true);
                            }}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger-subtle hover:text-danger"
                            onClick={() => setPendingRemove(assignment)}
                          >
                            Remove
                          </Button>
                        </div>
                      </DataCell>
                    )}
                  </DataRow>
                    ))}
                  </TypeBand>
                ))
              )}
            </DataTable>
          </Card>

      {access.canManageSponsors && (
        <SponsorFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          sponsor={editing}
          eventTypes={sponsorableTypes}
          directory={sponsors}
          assignments={assignments}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => !open && setPendingRemove(null)}
        title="Remove this sponsor?"
        confirmLabel="Remove"
        description={
          pendingRemove
            ? `${pendingRemove.sponsor.name} will no longer be offered as a sponsor for ${pendingRemove.eventType.name} — ${pendingRemove.instanceLabel}. Events already scheduled keep their sponsor.`
            : ''
        }
        onConfirm={handleRemove}
      />
    </>
  );
}

interface TypeBandProps {
  colSpan: number;
  assignments: readonly SponsorAssignment[];
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

/**
 * One pooja's sponsorships, under a heading naming it.
 *
 * The same band the event calendar puts a month in, for the same reason: a
 * long table is read in sections, and the thing every row of a section shares
 * belongs at the top of it rather than repeated down the side.
 *
 * It shuts, because வெள்ளி அபிஷேகம் alone is fifty-two rows. Somebody looking
 * for who has தைப்பொங்கல் should be able to put the weekly pooja away rather
 * than scroll past it, and the count stays on the heading so a shut band still
 * answers "how many" without being opened.
 */
function TypeBand({ colSpan, assignments, isOpen, onToggle, children }: TypeBandProps) {
  const [first] = assignments;

  return (
    <>
      <tr className="bg-surface-2">
        <th scope="colgroup" colSpan={colSpan} className="p-0 text-left">
          <button
            type="button"
            aria-expanded={isOpen}
            className="flex w-full items-center gap-2.5 px-4 py-1.5 text-left transition-colors hover:bg-surface-3"
            onClick={onToggle}
          >
            <ChevronRight
              className={`size-3.5 shrink-0 text-text-muted transition-transform ${
                isOpen ? 'rotate-90' : ''
              }`}
              aria-hidden
            />

            <EventName name={first.eventType.name} nameEn={first.eventType.nameEn} />

            <FrequencyBadge frequency={first.eventType.frequencyType} />

            <span className="text-[11px] font-normal text-text-muted tabular">
              {assignments.length}{' '}
              {assignments.length === 1 ? 'sponsorship' : 'sponsorships'}
            </span>
          </button>
        </th>
      </tr>

      {isOpen && children}
    </>
  );
}
