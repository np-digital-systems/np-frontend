'use client';

import { useMemo, useState } from 'react';
import { Handshake, Mail, Phone, Search, UserPlus } from 'lucide-react';

import {
  Card,
  CardBody,
  CardHeader,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { EventName } from '../../components/event-name';
import { FrequencyBadge } from '../../components/frequency-badge';
import {
  SponsorFormDialog,
  type SponsorDraft,
} from '../../components/sponsor-form-dialog';
import type { EventAccess } from '../../lib/event-access';
import { describeInstance } from '../../lib/event-data';
import type { EventType, SponsorAssignment, SponsorUser } from '../../types';

interface SponsorsScreenProps {
  initialAssignments: readonly SponsorAssignment[];
  eventTypes: readonly EventType[];
  sponsors: readonly SponsorUser[];
  access: EventAccess;
    unsponsoredEvents: number;
  year: number;
}

/** TODO: replace the local mutations with calls to the sponsors API. */
export function SponsorsScreen({
  initialAssignments,
  eventTypes,
  sponsors,
  access,
  unsponsoredEvents,
  year,
}: SponsorsScreenProps) {
  const [assignments, setAssignments] =
    useState<readonly SponsorAssignment[]>(initialAssignments);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SponsorAssignment | null>(null);
  const [pendingRemove, setPendingRemove] = useState<SponsorAssignment | null>(
    null,
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    if (!needle) return assignments;

    return assignments.filter((assignment) =>
      `${assignment.eventType.name} ${assignment.eventType.nameEn} ${assignment.instanceLabel} ${assignment.sponsor.fullName}`
        .toLowerCase()
        .includes(needle),
    );
  }, [assignments, query]);

  const directory = useMemo(() => {
    return sponsors
      .map((sponsor) => ({
        sponsor,
        slots: assignments.filter(
          (assignment) => assignment.userId === sponsor.id,
        ),
      }))
      .filter((entry) => entry.slots.length > 0)
      .sort((a, b) => b.slots.length - a.slots.length);
  }, [sponsors, assignments]);

  const distinctSponsors = new Set(
    assignments.map((assignment) => assignment.userId),
  ).size;

  const coveredTypes = new Set(
    assignments.map((assignment) => assignment.eventTypeId),
  ).size;

  function handleSubmit(draft: SponsorDraft) {
    const eventType = eventTypes.find((type) => type.id === draft.eventTypeId);
    const sponsor = sponsors.find((user) => user.id === draft.userId);

    if (!eventType || !sponsor) return;

    const customInstanceName = draft.customInstanceName || null;

    const instanceLabel = describeInstance(
      eventType.frequencyType,
      draft.instanceIdentifier,
      customInstanceName,
    );

    setAssignments((current) => {
      if (editing) {
        return current.map((assignment) =>
          assignment.id === editing.id
            ? {
                ...assignment,
                eventTypeId: draft.eventTypeId,
                instanceIdentifier: draft.instanceIdentifier,
                customInstanceName,
                userId: draft.userId,
                eventType,
                sponsor,
                instanceLabel,
              }
            : assignment,
        );
      }

      const nextId =
        current.reduce(
          (highest, assignment) => Math.max(highest, assignment.id),
          0,
        ) + 1;

      return [
        ...current,
        {
          id: nextId,
          eventTypeId: draft.eventTypeId,
          instanceIdentifier: draft.instanceIdentifier,
          customInstanceName,
          userId: draft.userId,
          createdAt: new Date().toISOString(),
          eventType,
          sponsor,
          instanceLabel,
          occurrences: 0,
        },
      ];
    });
  }

  function handleRemove() {
    if (!pendingRemove) return;

    setAssignments((current) =>
      current.filter((assignment) => assignment.id !== pendingRemove.id),
    );

    setPendingRemove(null);
  }

  const columns: DataColumn[] = [
    { key: 'event-type', label: 'Event Type' },
    { key: 'instance', label: 'Instance' },
    { key: 'frequency', label: 'Frequency' },
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
      <PortalPageHeader
        title="Sponsors"
        description="Standing sponsor assignments — who traditionally sponsors each recurring instance."
        meta={[
          <span key="assignments" className="tabular">
            {assignments.length} assignments
          </span>,
          <span key="sponsors" className="tabular">
            {distinctSponsors} sponsors
          </span>,
          <span key="types" className="tabular">
            {coveredTypes} event types covered
          </span>,
        ]}
        actions={
          access.canManageSponsors && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <UserPlus />
              Assign Sponsor
            </Button>
          )
        }
      />

      {!access.canManageSponsors && (
        <ReadOnlyNotice message="You can see who sponsors each instance. Creating and changing sponsor assignments is restricted to administrators." />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Standing Assignments"
          value={String(assignments.length)}
          caption="Recurring slots claimed"
        />
        <StatCard
          label="Active Sponsors"
          value={String(distinctSponsors)}
          caption="Devotees and trusts"
        />
        <StatCard
          label="Event Types Covered"
          value={`${coveredTypes} / ${eventTypes.length}`}
          caption="Have at least one sponsor"
        />
        <StatCard
          label="Unsponsored Events"
          value={String(unsponsoredEvents)}
          caption={`Dated in ${year}, no sponsor`}
        />
      </div>

      <Tabs defaultValue="assignments">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="directory">Sponsor Directory</TabsTrigger>
          </TabsList>

          <InputGroup className="w-full sm:w-64">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>

            <InputGroupInput
              type="search"
              value={query}
              placeholder="Search sponsors or event types…"
              aria-label="Search sponsor assignments"
              onChange={(changeEvent) => setQuery(changeEvent.target.value)}
            />
          </InputGroup>
        </div>

        <TabsContent value="assignments">
          <Card>
            <DataTable columns={columns} minWidth={access.canSeeSponsorContact ? 1000 : 840}>
              {filtered.length === 0 ? (
                <DataTableEmpty colSpan={columns.length}>
                  <EmptyState
                    icon={Handshake}
                    title={
                      assignments.length === 0
                        ? 'No sponsor assignments yet'
                        : 'No assignments match that search'
                    }
                    description={
                      assignments.length === 0
                        ? 'Assign devotees to the instances they traditionally sponsor.'
                        : 'Try a different name or clear the search.'
                    }
                  />
                </DataTableEmpty>
              ) : (
                filtered.map((assignment) => (
                  <DataRow key={assignment.id}>
                    <DataCell>
                      <EventName
                        name={assignment.eventType.name}
                        nameEn={assignment.eventType.nameEn}
                      />
                    </DataCell>

                    <DataCell>
                      <span className="text-[13px] text-text-primary">
                        {assignment.instanceLabel}
                      </span>
                      <span className="ml-2 text-[11px] text-text-muted tabular">
                        #{assignment.instanceIdentifier}
                      </span>
                    </DataCell>

                    <DataCell nowrap>
                      <FrequencyBadge
                        frequency={assignment.eventType.frequencyType}
                      />
                    </DataCell>

                    <DataCell>
                      <span className="text-[13px] text-text-primary">
                        {assignment.sponsor.fullName}
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
                ))
              )}
            </DataTable>
          </Card>
        </TabsContent>

        <TabsContent value="directory">
          {directory.length === 0 ? (
            <Card>
              <EmptyState
                icon={Handshake}
                title="No sponsors assigned yet"
                description="Sponsors appear here once they hold at least one recurring slot."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {directory.map(({ sponsor, slots }) => (
                <Card key={sponsor.id} className="flex flex-col">
                  <CardHeader
                    title={sponsor.fullName}
                    description={sponsor.address}
                    action={
                      <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-medium text-primary tabular">
                        {slots.length}
                      </span>
                    }
                  />

                  <CardBody className="flex flex-1 flex-col gap-3">
                    <ul className="flex flex-col gap-1.5">
                      {slots.map((slot) => (
                        <li
                          key={slot.id}
                          className="flex items-baseline justify-between gap-3"
                        >
                          <span className="min-w-0 truncate text-[13px] text-text-primary">
                            {slot.eventType.name}
                          </span>
                          <span className="shrink-0 text-[11px] text-text-muted">
                            {slot.instanceLabel}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {access.canSeeSponsorContact && (
                      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-3">
                        <span className="flex items-center gap-1.5 text-xs text-text-secondary tabular">
                          <Phone className="size-3 text-text-muted" aria-hidden />
                          {sponsor.phone}
                        </span>

                        <span className="flex items-center gap-1.5 truncate text-xs text-text-muted">
                          <Mail className="size-3" aria-hidden />
                          {sponsor.email}
                        </span>
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {access.canManageSponsors && (
        <SponsorFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          assignment={editing}
          eventTypes={eventTypes}
          sponsors={sponsors}
          taken={assignments.map((assignment) => ({
            id: assignment.id,
            eventTypeId: assignment.eventTypeId,
            instanceIdentifier: assignment.instanceIdentifier,
          }))}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => !open && setPendingRemove(null)}
        title="Remove this sponsor assignment?"
        confirmLabel="Remove"
        description={
          pendingRemove
            ? `${pendingRemove.sponsor.fullName} will no longer be the standing sponsor for ${pendingRemove.eventType.name} — ${pendingRemove.instanceLabel}. Events already scheduled keep their sponsor.`
            : ''
        }
        onConfirm={handleRemove}
      />
    </>
  );
}
