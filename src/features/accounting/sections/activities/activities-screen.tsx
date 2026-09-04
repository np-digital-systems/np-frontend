'use client';

import { useMemo, useState } from 'react';
import { Layers, Plus, Search, X } from 'lucide-react';

import { useServerAction } from '@/hooks/use-server-action';
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
import { cn } from '@/lib/utils';

import {
  ActivityFormDialog,
  type ActivityDraft,
} from '../../components/activity-form-dialog';
import { Amount } from '../../components/amount';
import type { AccountingAccess } from '../../lib/accounting-access';
import {
  ACTIVITY_KINDS,
  ACTIVITY_KIND_LABELS,
  formatCurrency,
} from '../../lib/accounting-data';
import {
  createActivity,
  deactivateActivity,
  updateActivity,
} from '../../lib/accounting-actions';
import type { ActivityKind, ActivityRecord, FundRef } from '../../types';

interface ActivitiesScreenProps {
  initialActivities: readonly ActivityRecord[];
  funds: readonly FundRef[];
  access: AccountingAccess;
  year: number;
}

export function ActivitiesScreen({
  initialActivities,
  funds,
  access,
  year,
}: ActivitiesScreenProps) {
  const activities = initialActivities;
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<ActivityKind | 'all'>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityRecord | null>(null);
  const [retiring, setRetiring] = useState<ActivityRecord | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return activities.filter((activity) => {
      if (kind !== 'all' && activity.kind !== kind) return false;
      if (!needle) return true;

      return `${activity.name} ${activity.nameEn}`.toLowerCase().includes(needle);
    });
  }, [activities, query, kind]);

  const totals = useMemo(
    () => ({
      income: activities.reduce((sum, activity) => sum + activity.income, 0),
      expenses: activities.reduce((sum, activity) => sum + activity.expenses, 0),
      // The ones worth looking at first: an activity spending more than it
      // brings in is the finding this screen exists to surface.
      inDeficit: activities.filter(
        (activity) => activity.net < 0 && activity.entryCount > 0,
      ).length,
    }),
    [activities],
  );

  const { run, error: actionError } = useServerAction();

  function handleSubmit(draft: ActivityDraft) {
    const target = editing;

    run(
      () =>
        target
          ? updateActivity(target.id, {
              nameTa: draft.nameTa,
              nameEn: draft.nameEn,
              kind: draft.kind,
              defaultFundId: draft.defaultFundId,
              isActive: draft.isActive,
            })
          : createActivity({
              nameTa: draft.nameTa,
              nameEn: draft.nameEn,
              kind: draft.kind,
              defaultFundId: draft.defaultFundId,
            }),
      () => {
        setEditing(null);
        setFormOpen(false);
      },
    );
  }

  const columns: DataColumn[] = [
    { key: 'name', label: 'Activity' },
    { key: 'kind', label: 'Kind' },
    { key: 'entries', label: 'Entries', align: 'right' },
    { key: 'income', label: 'Income', align: 'right' },
    { key: 'expenses', label: 'Expenditure', align: 'right' },
    { key: 'net', label: 'Net', align: 'right' },
    ...(access.canManageActivities
      ? [{ key: 'actions', label: 'Actions', align: 'right', srOnly: true } as const]
      : []),
  ];

  const isFiltered = query.trim() !== '' || kind !== 'all';

  return (
    <>
      <PortalPageHeader
        title="Activities"
        description="What entries are reported under. Income and expenditure both carry one, so a pooja can be read whole."
        meta={[
          <span key="year" className="tabular">
            Financial year {year}
          </span>,
          <span key="count" className="tabular">
            {activities.length} activities
          </span>,
        ]}
        actions={
          access.canManageActivities && (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus />
              New Activity
            </Button>
          )
        }
      />

      <ActionError message={actionError} />

      {!access.canManageActivities && (
        <ReadOnlyNotice message="You can see the activities. Adding or changing one is restricted to administrators and accountants." />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Income" value={formatCurrency(totals.income)} />
        <StatCard label="Expenditure" value={formatCurrency(totals.expenses)} />
        <StatCard
          label="Running at a loss"
          value={String(totals.inDeficit)}
          caption={
            totals.inDeficit === 0
              ? 'Every activity covers itself'
              : 'Spending more than they bring in'
          }
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <InputGroup className="sm:max-w-xs">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              placeholder="Search activities"
              onChange={(changeEvent) => setQuery(changeEvent.target.value)}
            />
          </InputGroup>

          <Select
            value={kind}
            onValueChange={(value) => setKind(value as ActivityKind | 'all')}
          >
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Every kind</SelectItem>

              {ACTIVITY_KINDS.map((entry) => (
                <SelectItem key={entry} value={entry}>
                  {ACTIVITY_KIND_LABELS[entry]}
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
                setKind('all');
              }}
            >
              <X />
              Clear
            </Button>
          )}
        </div>

        <DataTable columns={columns}>
          {activities.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              <EmptyState
                icon={Layers}
                title="No activities yet"
                description="An activity is what a receipt or payment is reported under — a pooja, annadhanam, hall upkeep. Add one and the voucher form will offer it."
              />
            </DataTableEmpty>
          ) : filtered.length === 0 ? (
            <DataTableEmpty colSpan={columns.length}>
              Nothing matches that search.
            </DataTableEmpty>
          ) : (
            filtered.map((activity) => (
              <DataRow key={activity.id}>
                <DataCell>
                  <p
                    className={cn(
                      'truncate text-[13px]',
                      activity.isActive
                        ? 'text-text-primary'
                        : 'text-text-disabled line-through',
                    )}
                  >
                    {activity.name}
                  </p>
                  {activity.nameEn && (
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {activity.nameEn}
                    </p>
                  )}
                </DataCell>

                <DataCell nowrap className="text-xs text-text-secondary">
                  {ACTIVITY_KIND_LABELS[activity.kind]}
                </DataCell>

                <DataCell align="right" nowrap className="text-xs tabular">
                  {activity.entryCount > 0 ? (
                    activity.entryCount
                  ) : (
                    <span className="text-text-disabled">—</span>
                  )}
                </DataCell>

                <DataCell align="right" nowrap>
                  <Amount value={activity.income} tone="in" />
                </DataCell>

                <DataCell align="right" nowrap>
                  <Amount value={activity.expenses} tone="out" />
                </DataCell>

                <DataCell align="right" nowrap>
                  <Amount
                    value={activity.net}
                    tone={activity.net < 0 ? 'out' : 'neutral'}
                  />
                </DataCell>

                {access.canManageActivities && (
                  <DataCell align="right" nowrap>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(activity);
                          setFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      {activity.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-danger hover:bg-danger-subtle hover:text-danger"
                          onClick={() => setRetiring(activity)}
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

      {access.canManageActivities && (
        <ActivityFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          activity={editing}
          funds={funds}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={retiring !== null}
        onOpenChange={(open) => !open && setRetiring(null)}
        title="Retire this activity?"
        description={
          retiring
            ? `${retiring.name} will no longer be offered on new entries. The ${retiring.entryCount} entries already coded to it keep naming it, and every report that mentions it is unchanged.`
            : ''
        }
        confirmLabel="Retire"
        onConfirm={() => {
          if (retiring) run(() => deactivateActivity(retiring.id));
          setRetiring(null);
        }}
      />
    </>
  );
}
